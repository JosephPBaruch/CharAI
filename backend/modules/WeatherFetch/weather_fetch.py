"""
WeatherFetch utilities for hourly weather and growing-season EVT matrices.

This module converts Open-Meteo archive responses into pandas DataFrames that
match CharAI pipeline usage (cell-level weather rows and acre-level monthly
matrix columns).

Usage:
    from modules.WeatherFetch import WeatherFetcher

    fetcher = WeatherFetcher(terrain_df=terrain_df)
    hourly_df = fetcher.fetch(start_date="2024-01-01", end_date="2024-12-31")
    evt_df = fetcher.fetch_growing_month_evapotranspiration_matrix(
        start_date="2025-01-01",
        end_date="2025-09-30",
    )
"""

import logging
import math

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry

logger = logging.getLogger("charai")

_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
_HOURLY_VARIABLES = [
    "temperature_2m",
    "rain",
    "relative_humidity_2m",
    "surface_pressure",
]
_ET_HOURLY_VARIABLES = [
    "evapotranspiration",
    "et0_fao_evapotranspiration",
]
_PALOUSE_GROWING_MONTHS = (1, 2, 3, 4, 5, 6, 7, 8, 9)
_MONTH_EVT_COLUMNS = {
    1: "JanEVT",
    2: "FebEVT",
    3: "MarEVT",
    4: "AprEVT",
    5: "MayEVT",
    6: "JunEVT",
    7: "JulEVT",
    8: "AugEVT",
    9: "SeptEVT",
    10: "OctEVT",
    11: "NovEVT",
    12: "DecEVT",
}


class WeatherFetcher:
    """Client wrapper for Open-Meteo weather and evapotranspiration queries."""

    def __init__(
        self,
        terrain_df: pd.DataFrame,
        latitude_col: str = "centroid_lat",
        longitude_col: str = "centroid_lon",
        cache_name: str = "weather_fetch",
        cache_backend: str = "memory",
        cache_expire_after: int = -1,
        retries: int = 5,
        backoff_factor: float = 0.2,
    ) -> None:
        if terrain_df.empty:
            raise ValueError("terrain_df must contain at least one row")

        required_columns = {latitude_col, longitude_col}
        missing_columns = required_columns - set(terrain_df.columns)
        if missing_columns:
            raise ValueError(
                "terrain_df is missing required columns: "
                f"{sorted(missing_columns)}"
            )

        self._terrain_df = terrain_df.copy()
        self._latitude_col = latitude_col
        self._longitude_col = longitude_col

        self.latitude = float(self._terrain_df[self._latitude_col].iloc[0])
        self.longitude = float(self._terrain_df[self._longitude_col].iloc[0])

        cache_session = requests_cache.CachedSession(
            cache_name=cache_name,
            backend=cache_backend,
            expire_after=cache_expire_after,
        )
        retry_session = retry(
            cache_session, retries=retries, backoff_factor=backoff_factor
        )
        self._client = openmeteo_requests.Client(session=retry_session)

    def fetch(self, start_date: str, end_date: str) -> pd.DataFrame:
        """Return hourly weather rows between two dates for this fetcher's location. This is left in for tests later down the road 
        but can be removed if needed """
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "start_date": start_date,
            "end_date": end_date,
            "hourly": _HOURLY_VARIABLES,
        }

        logger.debug(
            "Fetching weather data for (%s, %s) from %s to %s",
            self.latitude,
            self.longitude,
            start_date,
            end_date,
        )

        responses = self._client.weather_api(_ARCHIVE_URL, params=params)
        response = responses[0]

        logger.debug(
            "Received weather data: Coordinates %s°N %s°E, Elevation %s m asl",
            response.Latitude(),
            response.Longitude(),
            response.Elevation(),
        )

        hourly = response.Hourly()

        date_range = pd.date_range(
            start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
            end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left",
        )

        return pd.DataFrame(
            {
                "date": date_range,
                "temperature_2m": hourly.Variables(0).ValuesAsNumpy(),
                "rain": hourly.Variables(1).ValuesAsNumpy(),
                "relative_humidity_2m": hourly.Variables(2).ValuesAsNumpy(),
                "surface_pressure": hourly.Variables(3).ValuesAsNumpy(),
            }
        )

    def fetch_monthly_evapotranspiration_by_acre(
        self,
        start_date: str,
        end_date: str,
        terrain_df: pd.DataFrame | None = None,
        latitude_col: str = "centroid_lat",
        longitude_col: str = "centroid_lon",
        acre_size_m2: float = 4_047.0,
    ) -> pd.DataFrame:
        """Return monthly ET and ET0 means per acre for a terrain dataframe.

        Each 5 m cell is bucketed into an acre-sized geographic region
        (default 4 047 m²).  The centr of each bucket becomes its
        representative coordinate for the Open-Meteo request, and the
        bucket index is assigned as ``acre_id`` in the output. reduces api calls by a lot"""

        if terrain_df is None:
            terrain_df = self._terrain_df
            latitude_col = self._latitude_col
            longitude_col = self._longitude_col

        required_columns = {latitude_col, longitude_col}
        missing_columns = required_columns - set(terrain_df.columns)
        if missing_columns:
            raise ValueError(
                "terrain_df is missing required columns: "
                f"{sorted(missing_columns)}"
            )

        # Compute acre-sized bucket centroids from cell coordinates.
        ref_lat = float(terrain_df[latitude_col].iloc[0])
        acre_side_m = math.sqrt(acre_size_m2)
        lat_step = acre_side_m / 111_320.0
        lon_step = acre_side_m / (111_320.0 * math.cos(math.radians(ref_lat)))

        lats = terrain_df[latitude_col].astype(float)
        lons = terrain_df[longitude_col].astype(float)
        lat_bucket = (lats / lat_step).apply(math.floor) * lat_step + lat_step / 2
        lon_bucket = (lons / lon_step).apply(math.floor) * lon_step + lon_step / 2

        # Build a deduplicated list of unique bucket centroids and assign each
        # a stable integer acre_id.
        bucket_keys = list(zip(lat_bucket.round(6), lon_bucket.round(6)))
        seen: dict[tuple[float, float], int] = {}
        for key in bucket_keys:
            if key not in seen:
                seen[key] = len(seen)

        unique_coords = pd.DataFrame(
            list(seen.keys()), columns=["_lat", "_lon"]
        )
        cell_acre_ids = [seen[k] for k in bucket_keys]

        logger.debug(
            "Acre bucketing: %s cells → %s unique acre centroids (acre_side=%.1f m)",
            len(terrain_df),
            len(unique_coords),
            acre_side_m,
        )

        logger.debug(
            "Fetching ET data: %s unique locations from %s to %s",
            len(unique_coords),
            start_date,
            end_date,
        )

        params = {
            "latitude": unique_coords["_lat"].tolist(),
            "longitude": unique_coords["_lon"].tolist(),
            "start_date": start_date,
            "end_date": end_date,
            "hourly": _ET_HOURLY_VARIABLES,
        }

        responses = self._client.weather_api(_ARCHIVE_URL, params=params)

        # acre_id (bucket index) → monthly means DataFrame
        acre_to_monthly: dict[int, pd.DataFrame] = {}
        for acre_id, response in enumerate(responses):
            hourly = response.Hourly()
            date_range = pd.date_range(
                start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
                end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
                freq=pd.Timedelta(seconds=hourly.Interval()),
                inclusive="left",
            )
            hourly_df = pd.DataFrame(
                {
                    "date": date_range,
                    "evapotranspiration": hourly.Variables(0).ValuesAsNumpy(),
                    "et0_fao_evapotranspiration": hourly.Variables(1).ValuesAsNumpy(),
                }
            )
            hourly_df["month"] = (
                hourly_df["date"].dt.tz_convert(None).dt.to_period("M").dt.to_timestamp()
            )
            monthly_df = (
                hourly_df.groupby("month", as_index=False)[
                    ["evapotranspiration", "et0_fao_evapotranspiration"]
                ]
                .mean()
            )
            monthly_df["acre_id"] = acre_id
            acre_to_monthly[acre_id] = monthly_df

        if not acre_to_monthly:
            return pd.DataFrame(
                columns=[
                    "acre_id",
                    "month",
                    "evapotranspiration",
                    "et0_fao_evapotranspiration",
                ]
            )

        # One row per unique acre (deduplicated by bucket, not by cell).
        result_df = pd.concat(acre_to_monthly.values(), ignore_index=True)
        return result_df[
            [
                "acre_id",
                "month",
                "evapotranspiration",
                "et0_fao_evapotranspiration",
            ]
        ]

    def fetch_growing_month_evapotranspiration_matrix(
        self,
        start_date: str,
        end_date: str,
        terrain_df: pd.DataFrame | None = None,
        latitude_col: str = "centroid_lat",
        longitude_col: str = "centroid_lon",
        metric: str = "evapotranspiration",
        growing_months: tuple[int, ...] = _PALOUSE_GROWING_MONTHS,
        acre_size_m2: float = 4_047.0,
    ) -> pd.DataFrame:
        """Return an acre-by-month EVT matrix (JanEVT..SeptEVT by default)."""
        if metric not in _ET_HOURLY_VARIABLES:
            raise ValueError(
                f"metric must be one of {_ET_HOURLY_VARIABLES}, got '{metric}'"
            )

        normalized_months = tuple(int(month) for month in growing_months)
        if any(month < 1 or month > 12 for month in normalized_months):
            raise ValueError("growing_months must only contain values from 1 to 12")

        monthly_df = self.fetch_monthly_evapotranspiration_by_acre(
            terrain_df=terrain_df,
            start_date=start_date,
            end_date=end_date,
            latitude_col=latitude_col,
            longitude_col=longitude_col,
            acre_size_m2=acre_size_m2,
        )

        month_numbers = monthly_df["month"].dt.month
        filtered_df = monthly_df[month_numbers.isin(normalized_months)].copy()
        filtered_df["growing_month"] = filtered_df["month"].dt.month

        if filtered_df.empty:
            month_columns = [_MONTH_EVT_COLUMNS[m] for m in normalized_months]
            return pd.DataFrame(columns=["acre_id", *month_columns])

        pivot_df = (
            filtered_df.pivot_table(
                index="acre_id",
                columns="growing_month",
                values=metric,
                aggfunc="mean",
            )
            .reindex(columns=normalized_months)
            .reset_index()
        )

        rename_map = {month: _MONTH_EVT_COLUMNS[month] for month in normalized_months}
        pivot_df = pivot_df.rename(columns=rename_map)

        expected_columns = ["acre_id", *[rename_map[m] for m in normalized_months]]
        return pivot_df.reindex(columns=expected_columns)
