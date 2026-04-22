import json
import math
import os
from typing import Any, Dict, cast

import numpy as np
import pandas as pd
from django.conf import settings
from shapely.geometry import Point, Polygon, mapping, shape
from shapely.prepared import prep
from core.models import Field
import logging

class PrescriptionMapGenerator: 

    MIN_SYNTHETIC_PAYBACK_YEARS = 1.0
    MAX_SYNTHETIC_PAYBACK_YEARS = 10.0

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def compute_payback_period_grid(self,
        yield_prediction_df: pd.DataFrame,
        crop_sales_price: float,
        biochar_cost_per_cell: float,
    ) -> pd.DataFrame:
        required_columns = {
            "cell_id",
            "centroid_lat",
            "centroid_lon",
            "elev_mean_m",
        }

        if not required_columns.issubset(set(yield_prediction_df.columns)):
            raise ValueError(
                f"DataFrame must contain columns {required_columns}. "
                f"Got: {list(yield_prediction_df.columns)}"
            )

        df = yield_prediction_df.copy()
        df["payback_period"] = np.nan

        elevation = pd.to_numeric(df["elev_mean_m"], errors="coerce")
        valid_mask = elevation.notna()

        if valid_mask.any():
            valid_elevation = elevation.loc[valid_mask]
            elev_min = float(valid_elevation.min())
            elev_max = float(valid_elevation.max())

            if np.isclose(elev_min, elev_max):
                midpoint = (
                    self.MIN_SYNTHETIC_PAYBACK_YEARS
                    + self.MAX_SYNTHETIC_PAYBACK_YEARS
                ) / 2.0
                df.loc[valid_mask, "payback_period"] = midpoint
            else:
                normalized_elevation = (valid_elevation - elev_min) / (elev_max - elev_min)
                df.loc[valid_mask, "payback_period"] = (
                    self.MAX_SYNTHETIC_PAYBACK_YEARS
                    - (
                        self.MAX_SYNTHETIC_PAYBACK_YEARS
                        - self.MIN_SYNTHETIC_PAYBACK_YEARS
                    )
                    * normalized_elevation
                )

        df["payback_period"] = df["payback_period"].clip(
            lower=self.MIN_SYNTHETIC_PAYBACK_YEARS,
            upper=self.MAX_SYNTHETIC_PAYBACK_YEARS,
        )

        self.logger.debug(
            "Synthetic payback gradient generated from elevation: min=%s, max=%s",
            float(df["payback_period"].min(skipna=True)) if valid_mask.any() else None,
            float(df["payback_period"].max(skipna=True)) if valid_mask.any() else None,
        )

        # Keep only JSON-safe numeric payback values for downstream serialization.
        finite_mask = np.isfinite(df["payback_period"].to_numpy(dtype=float, copy=False))
        df.loc[~finite_mask, "payback_period"] = np.nan

        return cast(
            pd.DataFrame,
            df.loc[:, ["cell_id", "centroid_lat", "centroid_lon", "payback_period"]],
        ).reset_index(drop=True)


    def filter_cells_inside_boundary(self,df: pd.DataFrame, field_geojson: dict) -> pd.DataFrame:
        field_polygon = self.get_field_polygon(field_geojson)
        prepared_polygon = prep(field_polygon)

        cell_mask = [
            prepared_polygon.contains(Point(lon, lat))
            for lon, lat in zip(df["centroid_lon"].values, df["centroid_lat"].values)
        ]

        return cast(pd.DataFrame, df.loc[cell_mask].reset_index(drop=True))


    @staticmethod
    def get_field_polygon(field_geojson: dict) -> Polygon:
        for feature in field_geojson.get("features", []):
            geometry = feature.get("geometry")
            if geometry and geometry.get("type") == "Polygon":
                return cast(Polygon, shape(geometry))

        raise ValueError("No Polygon found in field GeoJSON")


    def convert_df_to_geojson_polygons(self,
        payback_period_df: pd.DataFrame,
        cell_size_meters: float,
        biochar_application_rate: float,
    ) -> Dict[str, Any]:
        required_columns = {"cell_id", "centroid_lat", "centroid_lon", "payback_period"}
        if not required_columns.issubset(payback_period_df.columns):
            raise ValueError(f"DataFrame must contain columns {required_columns}")

        features = []
        cell_radius = cell_size_meters / 2.0

        for _, row in payback_period_df.iterrows():
            lat = float(row["centroid_lat"])
            lon = float(row["centroid_lon"])
            raw_payback = pd.to_numeric(row["payback_period"], errors="coerce")
            payback = float(raw_payback) if pd.notna(raw_payback) and np.isfinite(raw_payback) else None

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

        return {
            "type": "FeatureCollection",
            "features": features,
        }


    def parse_and_append_boundary_coordinates(self, 
        grid_geojson_data: Dict[str, Any],
        field_geojson_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        field_polygon = self.get_field_polygon(field_geojson_data)

        boundary_feature = {
            "type": "Feature",
            "geometry": mapping(field_polygon),
            "properties": {
                "featureType": "boundary",
            },
        }

        grid_geojson_data["features"].insert(0, boundary_feature)
        return grid_geojson_data


    @staticmethod
    def _get_prescription_output_dir() -> str:
        output_dir = os.path.join(settings.BASE_DIR, "data", "prescription_maps")
        os.makedirs(output_dir, exist_ok=True)
        return output_dir

    def _write_prescription_json_file(self, field: Field, geojson_data: Dict[str, Any]) -> str:
        output_dir = self._get_prescription_output_dir()
        safe_field_id = field.field_id.replace("/", "_").replace(" ", "_")
        file_name = f"field_{field.user_id}_{safe_field_id}.json"
        absolute_file_path = os.path.join(output_dir, file_name)

        with open(absolute_file_path, "w", encoding="utf-8") as output_file:
            json.dump(geojson_data, output_file)

        return os.path.relpath(absolute_file_path, settings.BASE_DIR)
