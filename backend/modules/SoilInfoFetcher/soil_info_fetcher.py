import logging
import tempfile
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

import h5py
import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

# Maps season name -> (month, day) tuples to sample within that season.
SEASON_SAMPLE_DATES = {
    "spring": [(3, 15), (4, 15), (5, 15)],    # Mar–May
    "summer": [(6, 15), (7, 15), (8, 15)],    # Jun–Aug
    "fall":   [(9, 15), (10, 15), (11, 15)],  # Sep–Nov
    "winter": [(12, 15), (1, 15), (2, 15)],   # Dec–Feb (Dec = year, Jan/Feb = year+1)
}

SEASONS = ("spring", "summer", "fall", "winter")

_MAX_WORKERS = 8


class SoilInfoFetcher:
    SMAP_SHORT_NAME = "SPL3SMP_E"
    SMAP_VERSION    = "006"

    CMR_GRANULE_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"

    HDF5_SM_AM  = "Soil_Moisture_Retrieval_Data_AM/soil_moisture"
    HDF5_LAT_AM = "Soil_Moisture_Retrieval_Data_AM/latitude"
    HDF5_LON_AM = "Soil_Moisture_Retrieval_Data_AM/longitude"

    FILL_VALUE = -9999.0

    def __init__(self, logger: logging.Logger, max_workers: int = _MAX_WORKERS):
        self.logger = logger
        self.max_workers = max_workers
        self._session = self._build_earthdata_session()
        self.logger.info(
            f"SoilInfoFetcher initialised (max_workers={max_workers})"
        )

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def add_soil_moisture(self, grid_df: pd.DataFrame) -> pd.DataFrame:
        """
        Adds a 'year' column (most recent completed year) and four seasonal
        soil-moisture columns to the dataframe:
            soil_moisture_spring, soil_moisture_summer,
            soil_moisture_fall,   soil_moisture_winter
        """
        required_cols = ["centroid_lat", "centroid_lon"]
        missing = [c for c in required_cols if c not in grid_df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        if grid_df.empty:
            raise ValueError("Grid dataframe is empty")

        # Determine the most recent completed year and stamp every row with it.

        most_recent_year = datetime.utcnow().year - 1
        grid_df = grid_df.copy()
        grid_df["year"] = most_recent_year

        lat = float(grid_df.iloc[0]["centroid_lat"])
        lon = float(grid_df.iloc[0]["centroid_lon"])

        self.logger.info(
            f"Fetching seasonal SMAP for ({lat:.4f}, {lon:.4f}), "
            f"year={most_recent_year} (most recent completed year)"
        )

        seasonal_values = self._fetch_all_seasons_parallel(lat, lon, most_recent_year)

        result_df = grid_df
        for season, value in seasonal_values.items():
            col = f"soil_moisture_{season}"
            result_df[col] = value
            self.logger.info(f"  {col}: {value}")

        return result_df

    def fetch_historical_soil_moisture(
        self, lat: float, lon: float, year: int
    ) -> dict[str, float | None]:
        """
        Standalone method used by CreateAndTrainYieldCalculatorModel to fetch
        seasonal soil moisture for a specific historical year without a DataFrame.
        All four seasons are fetched in parallel.

        Returns
        -------
        dict with keys: spring, summer, fall, winter  (values in m³/m³ or None)
        """
        self.logger.info(
            f"Historical soil moisture fetch for ({lat:.4f}, {lon:.4f}), year={year}"
        )
        return self._fetch_all_seasons_parallel(lat, lon, year)

    #  Parallel threading of API calls. Doesn't change time that much, but will if we get multiple API endpoints.

    def _fetch_all_seasons_parallel(
        self, lat: float, lon: float, year: int
    ) -> dict[str, float | None]:
        """
        Fetches all four seasons concurrently. Within each season, the
        sample dates are also fetched in parallel.
        Returns a dict keyed by season name in consistent SEASONS order.
        """
        results: dict[str, float | None] = {}

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_season = {
                executor.submit(
                    self._fetch_seasonal_average, lat, lon, year, season
                ): season
                for season in SEASONS
            }

            for future in as_completed(future_to_season):
                season = future_to_season[future]
                try:
                    results[season] = future.result()
                except Exception as exc:
                    self.logger.error(f"Season {season} fetch raised: {exc}")
                    results[season] = None

        # Return in consistent SEASONS order regardless of completion order
        return {s: results.get(s) for s in SEASONS}

    # ------------------------------------------------------------------ #
    #  Seasonal logic                                                      #
    # ------------------------------------------------------------------ #

    def _fetch_seasonal_average(
        self, lat: float, lon: float, year: int, season: str
    ) -> float | None:
        """
        Fetches all sample dates for a season in parallel and returns
        the average of whichever readings succeed.
        """
        month_day_pairs = SEASON_SAMPLE_DATES[season]
        now = datetime.utcnow()

        # Build date list, skipping any future dates
        date_strings: list[str] = []
        for month, day in month_day_pairs:
            sample_year = year + 1 if (season == "winter" and month in (1, 2)) else year
            date_str = f"{sample_year}-{month:02d}-{day:02d}"
            if datetime.strptime(date_str, "%Y-%m-%d") > now:
                self.logger.debug(f"Skipping future date {date_str}")
                continue
            date_strings.append(date_str)

        if not date_strings:
            self.logger.warning(f"All sample dates for {season} {year} are in the future")
            return None

        readings: list[float] = []

        # Each sample date is independent — fetch them concurrently
        with ThreadPoolExecutor(max_workers=min(len(date_strings), self.max_workers)) as executor:
            future_to_date = {
                executor.submit(
                    self._try_fetch_date_with_fallback, lat, lon, date_str
                ): date_str
                for date_str in date_strings
            }

            for future in as_completed(future_to_date):
                date_str = future_to_date[future]
                try:
                    value = future.result()
                    if value is not None:
                        readings.append(value)
                except Exception as exc:
                    self.logger.warning(f"Sample date {date_str} raised: {exc}")

        if not readings:
            self.logger.warning(
                f"No valid SMAP readings for {season} {year} at ({lat:.4f}, {lon:.4f})"
            )
            return None

        avg = float(np.mean(readings))
        self.logger.debug(
            f"{season} {year}: {len(readings)} reading(s) averaged -> {avg:.4f} m³/m³"
        )
        return avg

    def _try_fetch_date_with_fallback(
        self, lat: float, lon: float, date_str: str, window: int = 5
    ) -> float | None:
        """
        Tries `date_str` first, then scans up to `window` days earlier
        to handle gaps in SMAP coverage.
        """
        target = datetime.strptime(date_str, "%Y-%m-%d")
        candidates = [target] + [
            target - timedelta(days=d) for d in range(1, window + 1)
        ]

        for dt in candidates:
            ds = dt.strftime("%Y-%m-%d")
            url = self._find_granule_url(ds, lat, lon)
            if url is None:
                continue
            try:
                value = self._download_and_extract(url, lat, lon)
                if value is not None:
                    self.logger.debug(f"Got SMAP reading on {ds}: {value:.4f}")
                    return value
            except Exception as exc:
                self.logger.warning(f"Extraction failed for {ds}: {exc}")

        return None

    # ------------------------------------------------------------------ #
    #  NASA / SMAP internals                                               #
    # ------------------------------------------------------------------ #

    def _build_earthdata_session(self) -> requests.Session:
        api_key = os.environ.get("EARTH_DATA_API_KEY")
        if not api_key:
            raise ValueError("EARTH_DATA_API_KEY environment variable is not set")
        session = requests.Session()
        session.headers.update({"Authorization": f"Bearer {api_key}"})
        return session

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

    def _download_and_extract(
        self, url: str, target_lat: float, target_lon: float
    ) -> float | None:
        self.logger.debug(f"Downloading HDF5: {url}")

        with self._session.get(url, stream=True, timeout=120, allow_redirects=True) as resp:
            resp.raise_for_status()
            with tempfile.NamedTemporaryFile(suffix=".h5", delete=False) as tmp:
                for chunk in resp.iter_content(chunk_size=1 << 20):
                    tmp.write(chunk)
                tmp_path = tmp.name

        try:
            return self._extract_pixel(tmp_path, target_lat, target_lon)
        finally:
            os.unlink(tmp_path)

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