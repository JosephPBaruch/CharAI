"""
SoilInfoFetcher Test
Creates a mock dataframe and tests SoilInfoFetcher
by fetching NASA SMAP soil moisture data.
"""
import logging
import pandas as pd
from soil_info_fetcher import SoilInfoFetcher

def setup_logger():
    logger = logging.getLogger("SoilTest")
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(levelname)s] %(asctime)s - %(message)s"
    )
    handler.setFormatter(formatter)
    if not logger.handlers:
        logger.addHandler(handler)
    return logger

def create_mock_dataframe():
    data = {
        "cell_id": ["0_0", "0_1", "0_2", "0_3"],
        "cell_row": [0, 0, 0, 0],
        "cell_col": [0, 1, 2, 3],
        "cell_size_m": [9.99] * 4,
        "requested_cell_size_m": [5.0] * 4,
        "centroid_lat": [46.731864] * 4,
        "centroid_lon": [-117.087342, -117.087211, -117.087080, -117.086949],
        "pixel_count": [4, 4, 4, 4],
        "elev_mean_m": [761.0, 760.75, 760.0, 760.0],
        "slope_mean_deg": [0.0, 7.179, 1.426, 0.0],
        "aspect_northness": [0.0, 0.77, 0.0, 0.0],
        "aspect_eastness": [0.0, -0.62, -1.0, 0.0],
    }
    return pd.DataFrame(data)

def main():
    logger = setup_logger()
    logger.info("Creating mock dataframe...")
    grid_df = create_mock_dataframe()

    logger.info("Initializing SoilInfoFetcher...")
    fetcher = SoilInfoFetcher(logger)  # token is hardcoded in the fetcher

    try:
        logger.info("Running soil moisture fetch...")
        result_df = fetcher.add_soil_moisture(grid_df)
        print("\n=== RESULT DATAFRAME ===")
        print(result_df)
        print("\n=== SUMMARY ===")
        print(result_df.describe())
    except Exception as e:
        logger.error(f"Test failed: {e}")

if __name__ == "__main__":
    main()