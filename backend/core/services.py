import numpy as np
import pandas as pd
from typing import Dict, Any
from GeoParser import GeoTIFFData # Braydyn's future module

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_control: pd.DataFrame,
    yield_biochar: pd.DataFrame,
    crop_sales_price: float,
    biochar_application_rate: float,
    biochar_price: float,
) -> pd.DataFrame:
    # Merge yield prediction data frames by index
    merged_predictions = yield_biochar.merge(
        yield_control,
        on=["Index", "Lat", "Long"],
        suffixes=("_Biochar", "_Control"),
        how="inner",
    )

    # Calculate yield differences
    merged_predictions["Yield_Delta"] = (
        merged_predictions["Yield_Biochar"] - merged_predictions["Yield_Control"]
    )

    # Find marginal revenue based on yield differences
    merged_predictions["Marginal_Revenue"] = merged_predictions["Yield_Delta"] * crop_sales_price

    # Calculate biochar cost per cell (one time as application rate is constant across field)
    biochar_cost = biochar_application_rate * biochar_price

    # Add payback period with mask in case of negative ROI
    merged_predictions["Payback_Period"] = np.inf
    valid_payback_mask = merged_predictions["Marginal_Revenue"] > 0

    merged_predictions.loc[valid_payback_mask, "Payback_Period"] = (
        biochar_cost / merged_predictions.loc[valid_payback_mask, "Marginal_Revenue"]
    )

    # Return DataFrame in expected Format [Index, Lat, Long, Payback_Period aka ROI]
    result = pd.DataFrame(
        merged_predictions.loc[:, ["Index", "Lat", "Long", "Payback_Period"]]
    )
    return result

def format_grid_as_geojson(
    geotiff: GeoTIFFData,
    pbp_grid: np.ndarray,
    biochar_application_rate: float,
    feature_type: str = 'zone',
) -> Dict[str, Any]:
    features = []
    height, width = pbp_grid.shape

    for row in range(height):
        for col in range(width):
            pbp_value = pbp_grid[row, col]
            if not np.isfinite(pbp_value):
                continue
            
            # Compute pixel corners in lat/lon coordinates using GeoTIFF spatial transformation metadata
            x_min, y_max = geotiff.transform * (col, row)
            x_max, y_min = geotiff.transform * (col + 1, row + 1)

            polygon_coords = [
                [x_min, y_max],
                [x_max, y_max],
                [x_max, y_min],
                [x_min, y_min],
                [x_min, y_max],
            ]

            feature = {
                'type': 'Feature',
                'properties': {
                    'applicationRate': float(biochar_application_rate),
                    'paybackPeriod': float(pbp_value),
                    'type': feature_type,
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [polygon_coords],
                },
            }
            features.append(feature)
    return {
        'type': 'FeatureCollection',
        'features': features,
    }