# WeatherFetch

This module pulls weather data from Open-Meteo for our backend pipeline.
It is mostly here to help us build EVT dataframes from the field grid.

## What This Returns

- A growing-season dataframe where each row is an area (`acre_id`) and each
    month is a column (`JanEVT` to `SeptEVT`).

## Basic Usage

```python
from modules.WeatherFetch import WeatherFetcher

fetcher = WeatherFetcher(terrain_df=terrain_df)

hourly_df = fetcher.fetch(
    start_date="2025-01-01",
    end_date="2025-01-07",
)
```

## Matrix Usage With Terrain Rows

The `terrain_df` you pass into `WeatherFetcher` should have at least:

- `cell_id`
- `centroid_lat`
- `centroid_lon`

```python
evt_matrix_df = fetcher.fetch_growing_month_evapotranspiration_matrix(
    start_date="2025-01-01",
    end_date="2025-09-30",
    metric="evapotranspiration",
)
```

If `evapotranspiration` is unavailable for the source data window, use:

```python
et0_matrix_df = fetcher.fetch_growing_month_evapotranspiration_matrix(
    start_date="2025-01-01",
    end_date="2025-09-30",
    metric="et0_fao_evapotranspiration",
)
```


This prints results and writes `weather_report.txt` in the same folder.

## Notes

- The cache is in-memory by default (`requests_cache` memory backend).
- We are not saving weather query cache to sqlite by default.
