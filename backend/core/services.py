from decimal import Decimal
import numpy as np
import pandas as pd
import math
from typing import Dict, Any, List

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_control_df: pd.DataFrame,
    yield_biochar_df: pd.DataFrame,
    crop_sales_price: Decimal,
    biochar_application_rate: float,
    biochar_price: float,
) -> pd.DataFrame:
    # Merge yield prediction data frames by index
    merged_predictions = yield_biochar_df.merge(
        yield_control_df,
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

    required_columns = {"Index", "Lat", "Long", "Payback_Period"}
    if not required_columns.issubset(payback_period_df.columns):
        raise ValueError(f"DataFrame must contain columns {required_columns}")

    features = []

    cell_radius = cell_size_meters / 2.0

    for _, row in payback_period_df.iterrows():
        lat = float(row["Lat"])
        lon = float(row["Long"])
        payback = float(row["Payback_Period"])

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
                "index": int(row["Index"]),
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