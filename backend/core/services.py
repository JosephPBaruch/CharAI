import numpy as np
import pandas as pd
from typing import Dict, Any

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_control_df: pd.DataFrame,
    yield_biochar_df: pd.DataFrame,
    crop_sales_price: float,
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

def format_grid_as_geojson(
    payback_period_df: pd.DataFrame,
    biochar_application_rate: float,
    # Assumes Lat and Long fields are the cell's center points, so we find cell's borders
    # TODO: Add cell border calculation logic based on feet / meters, aka different cell size units
    # TODO: Refactor cell border logic into separate function
    cell_size_in_degrees: float = 0.0002
) -> Dict[str, Any]:
    """
    Convert DataFrame with 'Lat', 'Long', 'Payback_Period' into GeoJSON polygons.
    """
    features = []

    half_size = cell_size_in_degrees / 2

    for _, row in payback_period_df.iterrows():
        lat = row["Lat"]
        lng = row["Long"]
        pbp = row["Payback_Period"]

        # Polygon corners around the point
        polygon = [
            [lng - half_size, lat + half_size],
            [lng + half_size, lat + half_size],
            [lng + half_size, lat - half_size],
            [lng - half_size, lat - half_size],
            [lng - half_size, lat + half_size],
        ]

        features.append({
            "type": "Feature",
            "properties": {
                "paybackPeriod": float(pbp),
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [polygon],
            },
        })

    return {
        "type": "FeatureCollection",
        "properties": {
            "applicationRate": float(biochar_application_rate),
        },
        "features": features,
    }