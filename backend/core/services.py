import numpy as np
import pandas as pd
from typing import Dict, Any, List

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

def convert_df_to_points_json(payback_period_df: pd.DataFrame) -> List[Dict]:
    """
    Convert a DataFrame with Index, Lat, Long, Payback_Period
    into a JSON-friendly list of points for the frontend.

    Subject to change. Currently, simplicity and output is prioritized over optimization.

    Example output:
    [
        {"lat": 46.72, "lng": -117.18, "paybackPeriod": 3},
        {"lat": 46.73, "lng": -117.18, "paybackPeriod": 5},
        ...
    ]
    """
    required_columns = {"Index", "Lat", "Long", "Payback_Period"}
    if not required_columns.issubset(payback_period_df.columns):
        raise ValueError(f"DataFrame must contain columns {required_columns}")

    points = []
    for _, row in payback_period_df.iterrows():
        points.append({
            "lat": float(row["Lat"]),
            "lng": float(row["Long"]),
            "paybackPeriod": float(row["Payback_Period"]),
        })

    return points
