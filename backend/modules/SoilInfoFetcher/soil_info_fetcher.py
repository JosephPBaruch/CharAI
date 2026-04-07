import logging
import tempfile
import os
from datetime import datetime, timedelta

import h5py
import numpy as np
import pandas as pd
import requests
from requests.auth import HTTPBasicAuth


class SoilInfoFetcher:
    SMAP_SHORT_NAME = "SPL3SMP_E"
    SMAP_VERSION    = "006"

    HDF5_SM_AM  = "Soil_Moisture_Retrieval_Data_AM/soil_moisture"
    HDF5_LAT_AM = "Soil_Moisture_Retrieval_Data_AM/latitude"
    HDF5_LON_AM = "Soil_Moisture_Retrieval_Data_AM/longitude"

    FILL_VALUE = -9999.0

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self._session = self._build_earthdata_session()
        self.logger.info("SoilInfoFetcher initialised with Earthdata credentials")

    # Call this. Soil moisture is added as a percentage. (0.241435 = 24.1425%)
    def add_soil_moisture(self, grid_df: pd.DataFrame) -> pd.DataFrame:
        required_cols = ["centroid_lat", "centroid_lon"]
        missing = [c for c in required_cols if c not in grid_df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        if grid_df.empty:
            raise ValueError("Grid dataframe is empty")

        lat = float(grid_df.iloc[0]["centroid_lat"])
        lon = float(grid_df.iloc[0]["centroid_lon"])
        self.logger.debug(f"Fetching SMAP soil moisture for ({lat:.4f}, {lon:.4f})")

        soil_moisture = self._fetch_smap_soil_moisture(lat, lon)

        result_df = grid_df.copy()
        result_df["soil_moisture"] = soil_moisture
        self._log_statistics(result_df, soil_moisture)
        return result_df

    # Connect
    def _build_earthdata_session(self) -> requests.Session:
        api_key = os.environ.get("EARTH_DATA_API_KEY")
        if not api_key:
            raise ValueError("EARTH_DATA_API_KEY environment variable is not set")
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {api_key}"
        })
        return session

    # Gets soil based of earliest fetched date
    def _fetch_smap_soil_moisture(self, lat: float, lon: float) -> float:
        for days_back in range(3, 10):
            target_date = datetime.utcnow() - timedelta(days=days_back)
            date_str    = target_date.strftime("%Y-%m-%d")
            self.logger.debug(f"Trying SMAP date {date_str}")

            download_url = self._find_granule_url(date_str, lat, lon)
            if download_url is None:
                continue

            try:
                sm_value = self._download_and_extract(download_url, lat, lon)
                if sm_value is not None:
                    self.logger.info(
                        f"SMAP soil moisture ({date_str}): {sm_value:.4f} m³/m³"
                    )
                    return sm_value
            except Exception as exc:
                self.logger.warning(f"Extraction failed for {date_str}: {exc}")
                continue

        raise ValueError(
            "No valid SMAP data found for the requested location in the last 7 days."
        )
    # Verifies if SMAP avaiable for a date. Uses NASA CMR search API
    def _find_granule_url(self, date_str: str, lat: float, lon: float) -> str | None:
        delta = 0.1
        w, s  = lon - delta, lat - delta
        e, n  = lon + delta, lat + delta

        params = {
            "short_name"   : self.SMAP_SHORT_NAME,
            "version"      : self.SMAP_VERSION,
            "temporal"     : f"{date_str}T00:00:00Z,{date_str}T23:59:59Z",
            "bounding_box" : f"{w:.4f},{s:.4f},{e:.4f},{n:.4f}",
            "page_size"    : 1,
        }

        resp = requests.get(
            self.CMR_GRANULE_URL,
            params=params,
            headers={"Accept": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()

        entries = resp.json().get("feed", {}).get("entry", [])
        if not entries:
            self.logger.debug(f"No CMR granule found for {date_str}")
            return None

        for link in entries[0].get("links", []):
            href = link.get("href", "")
            if (
                link.get("rel", "").endswith("/data#")
                and href.endswith(".h5")
                and "https://" in href
            ):
                self.logger.debug(f"Granule URL: {href}")
                return href

        self.logger.debug("Granule found but no .h5 download link present")
        return None

    # Downloads HDF5 file from NSIDC temporarily. (soil moisture data)
    def _download_and_extract(
        self, url: str, target_lat: float, target_lon: float
    ) -> float | None:
        self.logger.debug(f"Downloading HDF5: {url}")

        with self._session.get(
            url,
            stream=True,
            timeout=120,
            allow_redirects=True,
        ) as resp:
            resp.raise_for_status()

            with tempfile.NamedTemporaryFile(suffix=".h5", delete=False) as tmp:
                for chunk in resp.iter_content(chunk_size=1 << 20):
                    tmp.write(chunk)
                tmp_path = tmp.name

        try:
            return self._extract_pixel(tmp_path, target_lat, target_lon)
        finally:
            os.unlink(tmp_path)

    # uses the HDF5 file to read moisture content. Uses lat/lon array.
    def _extract_pixel(
        self, h5_path: str, target_lat: float, target_lon: float
    ) -> float | None:
        with h5py.File(h5_path, "r") as f:
            sm_data  = f[self.HDF5_SM_AM][:]
            lat_data = f[self.HDF5_LAT_AM][:]
            lon_data = f[self.HDF5_LON_AM][:]

        sm_data  = np.where(sm_data  == self.FILL_VALUE, np.nan, sm_data)
        lat_data = np.where(lat_data == self.FILL_VALUE, np.nan, lat_data)
        lon_data = np.where(lon_data == self.FILL_VALUE, np.nan, lon_data)

        dist = np.sqrt((lat_data - target_lat) ** 2 + (lon_data - target_lon) ** 2)
        dist = np.where(np.isnan(sm_data), np.inf, dist)

        idx   = np.unravel_index(np.nanargmin(dist), dist.shape)
        value = float(sm_data[idx])

        if np.isnan(value):
            self.logger.warning("Nearest SMAP pixel is masked / fill.")
            return None

        return value

    def _log_statistics(self, df: pd.DataFrame, soil_value: float):
        self.logger.debug(f"Soil moisture applied to {len(df)} grid cells")
        self.logger.debug(f"Soil moisture value (SMAP): {soil_value:.4f} m³/m³")