"""
SoilInfoFetcher Test
Creates a mock dataframe and tests SoilInfoFetcher
by fetching NASA SMAP soil moisture data seasonally (Spring, Summer, Fall, Winter)
for both a historical year (training) and the current/future year (prediction).
"""
import logging
import pandas as pd
from soil_info_fetcher import SoilInfoFetcher


def setup_logger():
    logger = logging.getLogger("SoilTest")
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
    handler.setFormatter(formatter)
    if not logger.handlers:
        logger.addHandler(handler)
    return logger


def create_mock_dataframe(year: int):
    """
    Creates a small mock grid DataFrame for a given crop year.
    The `year` column drives which SMAP data year is fetched.
    """
    data = {
        "cell_id":                ["0_0", "0_1", "0_2", "0_3"],
        "cell_row":               [0, 0, 0, 0],
        "cell_col":               [0, 1, 2, 3],
        "cell_size_m":            [9.99] * 4,
        "requested_cell_size_m":  [5.0] * 4,
        "centroid_lat":           [46.731864] * 4,
        "centroid_lon":           [-117.087342, -117.087211, -117.087080, -117.086949],
        "pixel_count":            [4, 4, 4, 4],
        "elev_mean_m":            [761.0, 760.75, 760.0, 760.0],
        "slope_mean_deg":         [0.0, 7.179, 1.426, 0.0],
        "aspect_northness":       [0.0, 0.77, 0.0, 0.0],
        "aspect_eastness":        [0.0, -0.62, -1.0, 0.0],
        "year":                   [year] * 4,
    }
    return pd.DataFrame(data)


def print_seasonal_summary(result_df: pd.DataFrame):
    seasonal_cols = [c for c in result_df.columns if c.startswith("soil_moisture_")]
    print("\n=== SEASONAL SOIL MOISTURE VALUES ===")
    print(result_df[["cell_id", "year"] + seasonal_cols].to_string(index=False))
    print("\n=== SEASONAL SUMMARY STATISTICS ===")
    print(result_df[seasonal_cols].describe())


def test_historical_year(fetcher: SoilInfoFetcher, logger: logging.Logger):
    """
    Simulates fetching soil moisture for a historical training year.
    The fetcher should use 2018 data directly (no year offset).
    """
    logger.info("=== TEST 1: Historical year (2018) — training mode ===")
    grid_df = create_mock_dataframe(year=2018)
    result_df = fetcher.add_soil_moisture(grid_df)
    print_seasonal_summary(result_df)
    return result_df


def test_current_or_future_year(fetcher: SoilInfoFetcher, logger: logging.Logger):
    """
    Simulates fetching soil moisture for the current/upcoming crop year.
    The fetcher should automatically step back to (year - 1) since future
    seasonal data (e.g. July of this year) may not yet be available.
    """
    from datetime import datetime
    current_year = datetime.utcnow().year
    logger.info(f"=== TEST 2: Current/future year ({current_year}) — prediction mode ===")
    logger.info(f"Expect fetcher to use year {current_year - 1} internally.")
    grid_df = create_mock_dataframe(year=current_year)
    result_df = fetcher.add_soil_moisture(grid_df)
    print_seasonal_summary(result_df)
    return result_df


def test_standalone_historical_fetch(fetcher: SoilInfoFetcher, logger: logging.Logger):
    """
    Tests fetch_historical_soil_moisture directly (used by CreateAndTrainYieldCalculatorModel).
    No DataFrame involved — returns a plain dict of seasonal averages.
    """
    logger.info("=== TEST 3: Standalone historical fetch (no DataFrame) ===")
    lat, lon, year = 46.731864, -117.087342, 2020
    result = fetcher.fetch_historical_soil_moisture(lat, lon, year)
    print(f"\n=== STANDALONE RESULT for ({lat}, {lon}), year={year} ===")
    for season, value in result.items():
        display = f"{value:.4f} m³/m³" if value is not None else "No data"
        print(f"  {season:<8}: {display}")
    return result


def main():
    logger = setup_logger()
    fetcher = SoilInfoFetcher(logger)

    results = {}

    # --- Test 1: Historical year (training data) ---
    try:
        results["historical"] = test_historical_year(fetcher, logger)
    except Exception as e:
        logger.error(f"Test 1 failed: {e}")

    # --- Test 2: Current/future year (yield prediction) ---
    try:
        results["current"] = test_current_or_future_year(fetcher, logger)
    except Exception as e:
        logger.error(f"Test 2 failed: {e}")

    # --- Test 3: Standalone historical fetch (model training helper) ---
    try:
        results["standalone"] = test_standalone_historical_fetch(fetcher, logger)
    except Exception as e:
        logger.error(f"Test 3 failed: {e}")

    print("\n=== ALL TESTS COMPLETE ===")
    passed = sum(1 for v in results.values() if v is not None)
    print(f"{passed}/{len(results)} tests produced results.")


if __name__ == "__main__":
    main()