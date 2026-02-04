import numpy as np
from typing import Dict, Any
from GeoParser import GeoTIFFData # Braydyn's future module

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_control: np.ndarray,
    yield_biochar: np.ndarray,
    crop_price: float,
    biochar_application_rate: float,
    biochar_price: float,
) -> np.ndarray:
    # yield_control and yield_biochar are 2D arrays representing the field's yield predictions
    # 1. Calculate yield difference per cell
    yield_delta = yield_biochar - yield_control

    # 2. Find marginal revenue per cell
    marginal_revenue = yield_delta * crop_price

    # 3. Find amendment cost to be used in payback period equation, configured for adjustable biochar application rate
    biochar_cost = biochar_application_rate * biochar_price

    # 4. Initialize payback period grid with infinity, making it easier to handle negative payback periods
    payback_period_grid = np.full(yield_delta.shape, np.inf, dtype="float32")

    # 5. Append payback period values to each cell, keep negative payback period values as positive infinity
    valid_payback_mask = marginal_revenue > 0
    payback_period_grid[valid_payback_mask] = biochar_cost / marginal_revenue[valid_payback_mask]

    return payback_period_grid

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