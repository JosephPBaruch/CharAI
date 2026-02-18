from decimal import Decimal
import numpy as np
import pandas as pd
import math
from typing import Dict, Any, List

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_prediction_df: pd.DataFrame,
    crop_sales_price: Decimal,
    biochar_application_rate: float,
    biochar_price: float,
) -> pd.DataFrame:
    # Merge yield prediction data frames by index
    required_columns = {"cell_id", "lat", "lng", "yield_without_biochar, yield_with_biochar"}
    if not required_columns.issubset(yield_prediction_df.columns):
        raise ValueError(f"DataFrame must contain columns {required_columns}")

    # Calculate yield differences
    yield_prediction_df["yield_delta"] = (
        yield_prediction_df["yield_with_biochar"] - yield_prediction_df["yield_without_biochar"]
    )

    # Find marginal revenue based on yield differences
    yield_prediction_df["marginal_revenue"] = yield_prediction_df["yield_delta"] * crop_sales_price

    # Calculate biochar cost per cell (one time as application rate is constant across field)
    biochar_cost = biochar_application_rate * biochar_price

    # Add payback period with mask in case of negative ROI
    yield_prediction_df["payback_period"] = np.inf
    valid_payback_mask = yield_prediction_df["marginal_revenue"] > 0

    yield_prediction_df.loc[valid_payback_mask, "payback_period"] = (
        biochar_cost / yield_prediction_df.loc[valid_payback_mask, "marginal_revenue"]
    )

    # Return DataFrame in expected Format ["cell_id", "lat", "lng", "payback_period"]
    result = pd.DataFrame(
        yield_prediction_df.loc[:, ["cell_id", "lat", "lng", "payback_period"]]
    )
    return result

def convert_df_to_geojson_polygons(
    payback_period_df: pd.DataFrame,
    cell_size_meters: float,
    biochar_application_rate: float,
) -> Dict[str, Any]:
    """
    Convert DataFrame into polygon-based GeoJSON FeatureCollection.

    Each row becomes a square polygon centered at (Lat, Long).

    Returns:
    GeoJSON FeatureCollection
    """

    required_columns = {"cell_id", "lat", "lng", "payback_period"}
    if not required_columns.issubset(payback_period_df.columns):
        raise ValueError(f"DataFrame must contain columns {required_columns}")

    features = []

    cell_radius = cell_size_meters / 2.0

    for _, row in payback_period_df.iterrows():
        lat = float(row["lat"])
        lon = float(row["lng"])
        payback = float(row["payback_period"])

        # Convert meters to degrees
        lat_offset = cell_radius / 111320.0
        lon_offset = cell_radius / (111320.0 * math.cos(math.radians(lat)))

        polygon = [
            [lon - lon_offset, lat - lat_offset],
            [lon + lon_offset, lat - lat_offset],
            [lon + lon_offset, lat + lat_offset],
            [lon - lon_offset, lat + lat_offset],
            [lon - lon_offset, lat - lat_offset],
        ]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [polygon],
            },
            "properties": {
                "index": int(row["cell_id"]),
                "paybackPeriod": payback,
                "applicationRate": biochar_application_rate,
                "cellSize": cell_size_meters,
            },
        }

        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features,
    }

    return geojson