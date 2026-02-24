from decimal import Decimal
import numpy as np
import pandas as pd
import math
from typing import Dict, Any, List, cast
from shapely.geometry import shape, Point, Polygon, mapping
from shapely.prepared import prep

def compute_payback_period_grid(
    yield_prediction_df: pd.DataFrame,
    crop_sales_price: float,
    biochar_cost_per_cell: float,
) -> pd.DataFrame:

    required_columns = {
        "cell_id",
        "centroid_lat",
        "centroid_lon",
        "yield_without_biochar",
        "yield_with_biochar",
    }

    if not required_columns.issubset(set(yield_prediction_df.columns)):
        raise ValueError(
            f"DataFrame must contain columns {required_columns}. "
            f"Got: {list(yield_prediction_df.columns)}"
        )

    df = yield_prediction_df.copy()

    # Ensure numeric
    yield_with = pd.to_numeric(df["yield_with_biochar"], errors="coerce")
    yield_without = pd.to_numeric(df["yield_without_biochar"], errors="coerce")

    df["yield_delta"] = yield_with - yield_without

    # Revenue per cell
    df["marginal_revenue"] = df["yield_delta"] * float(crop_sales_price)

    # Initialize payback
    df["payback_period"] = np.inf

    valid_mask = df["marginal_revenue"] > 0

    df.loc[valid_mask, "payback_period"] = (
        float(biochar_cost_per_cell)
        / df.loc[valid_mask, "marginal_revenue"]
    )

    result = df.loc[
        :, ["cell_id", "centroid_lat", "centroid_lon", "payback_period"]
    ].reset_index(drop=True)

    return result


def filter_cells_inside_boundary(df: pd.DataFrame, field_geojson: dict) -> pd.DataFrame: 
    """
    This function removes grid cells whose centers fall outside the field boundary.
    Is relatively optimized for many cells, using shapely's "prep" and vectorization
    """

    field_polygon = get_field_polygon(field_geojson)
    prepared_polygon = prep(field_polygon)

    cell_mask = [
        prepared_polygon.contains(Point(lon, lat))
        for lon, lat in zip(df["centroid_lon"].values, df["centroid_lat"].values)
    ]

    return cast(pd.DataFrame, df.loc[cell_mask].reset_index(drop=True))

def get_field_polygon(field_geojson: dict) -> Polygon:
    """
    Get a field's boundary coordinates as a polygon.
    """

    for feature in field_geojson.get("features", []):
        geometry = feature.get("geometry")
        if geometry and geometry.get("type") == "Polygon":
            return cast(Polygon, shape(geometry))
        
    raise ValueError("No Polygon found in field GeoJSON")
    

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

    required_columns = {"cell_id", "centroid_lat", "centroid_lon", "payback_period"}
    if not required_columns.issubset(payback_period_df.columns):
        raise ValueError(f"DataFrame must contain columns {required_columns}")

    features = []

    cell_radius = cell_size_meters / 2.0

    for _, row in payback_period_df.iterrows():
        lat = float(row["centroid_lat"])
        lon = float(row["centroid_lon"])
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
                "featureType": "gridCell",
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

def parse_and_append_boundary_coordinates(
    grid_geojson_data: Dict[str, Any],
    field_geojson_data: Dict[str, Any],
) -> Dict[str, Any]:
    field_polygon = get_field_polygon(field_geojson_data)
    
    boundary_feature = {
        "type": "Feature",
        "geometry": mapping(field_polygon),
        "properties": {
            "featureType": "boundary"
        }
    }

    grid_geojson_data["features"].insert(0, boundary_feature)

    return grid_geojson_data