import json
import logging
import math
import os
from threading import Thread
from datetime import datetime
from typing import Any, Dict
import math
from typing import Dict, Any
from django.conf import settings
from django.db import close_old_connections
from .models import Field, PrescriptionMap
from modules.GeoParser import GeoParser
from modules.Geotiffgenerator import DEMGeneratorService
from modules.Calculator import YieldCalculator
from modules.PrescriptionMapGenerator import PrescriptionMapGenerator

def create_charai_data(logger: logging.Logger, coords, tiff_file_path, crop: str = "WW"):
    if not isinstance(coords, list):
        raise TypeError("coords must be a list of (lat, lon) tuples")

    logger.info("Generating GeoTif")
    logger.info(coords)
    result = DEMGeneratorService(logger=logger).generate_from_coordinates(coords, tiff_file_path)
    if result.get("success") is False:
        error_message = result.get("error", "Unknown DEM generation error")
        raise ValueError(error_message)

    logger.info("Parsing GeoTif")
    geotiff_data = GeoParser(logger=logger, path=tiff_file_path).parse()
    terrain_df = geotiff_data.to_dataframe(cell_size_meters=5.0)
        
    # Temporary fallback crop code until full crop pipeline is finalized.
    terrain_df["Crop"] = crop or "WW"
        
    return terrain_df

def create_prescription_map_for_field(logger: logging.Logger, field: Field) -> Dict[str, Any]:
    field.prescription_map_status = Field.STATUS_STARTED
    field.save(update_fields=["prescription_map_status", "updated_at"])

    try:
        coords = []
        for feature in field.geojson_data.get("features", []):
            geometry = feature.get("geometry", {})
            if geometry.get("type") != "Polygon":
                continue

            ring = geometry.get("coordinates", [[]])[0]
            coords.extend([(lat, lon) for lon, lat in ring])

        if not coords:
            raise ValueError("No polygon coordinates found in field GeoJSON")

        dem_dir = os.path.join(settings.BASE_DIR, "dems")
        os.makedirs(dem_dir, exist_ok=True)

        tiff_file_path = os.path.join(
            dem_dir,
            f"field_{field.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tif",
        )
        
        # crop = field.custom_crop or field.crop_type or "WW"
        crop = "WW"
        terrain_df = create_charai_data(logger, coords, tiff_file_path, crop)

        logger.info("Calculating Yield")
        calculator = YieldCalculator(logger=logger)
        yield_results_df = calculator.calculate(terrain_df.copy())

        logger.info("Generating Presciption Map")
        pmg = PrescriptionMapGenerator(logger=logger)

        payback_period_df = pmg.compute_payback_period_grid(
            yield_prediction_df=yield_results_df,
            crop_sales_price=float(field.price),
            biochar_cost_per_cell=100,
        )

        filtered_data_df = pmg.filter_cells_inside_boundary(
            df=payback_period_df,
            field_geojson=field.geojson_data,
        )

        prescription_data_geojson = pmg.convert_df_to_geojson_polygons(
            payback_period_df=filtered_data_df,
            cell_size_meters=10.0,
            biochar_application_rate=10.0,
        )

        prescription_data_geojson_with_boundary = pmg.parse_and_append_boundary_coordinates(
            grid_geojson_data=prescription_data_geojson,
            field_geojson_data=field.geojson_data,
        )

        prescription_map, created = PrescriptionMap.objects.get_or_create(
            field=field,
            defaults={"prescription_data": prescription_data_geojson_with_boundary},
        )
        if not created:
            prescription_map.prescription_data = prescription_data_geojson_with_boundary
            prescription_map.save(update_fields=["prescription_data", "updated_at"])

        relative_file_path = pmg._write_prescription_json_file(
            field=field,
            geojson_data=prescription_data_geojson_with_boundary,
        )

        field.prescription_map_file = relative_file_path
        field.prescription_map_status = Field.STATUS_COMPLETE
        field.save(
            update_fields=[
                "prescription_map_file",
                "prescription_map_status",
                "updated_at",
            ]
        )

        logger.info("Prescription map generated for field_id=%s", field.field_id)
        return {
            "success": True,
            "stage": "complete",
            "prescription_data": prescription_data_geojson_with_boundary,
        }

    except Exception as e:
        field.prescription_map_status = Field.STATUS_FAILED
        field.save(update_fields=["prescription_map_status", "updated_at"])
        logger.exception("Failed to generate prescription map for field_id=%s", field.field_id)
        return {
            "success": False,
            "stage": "unexpected_exception",
            "error": str(e),
        }

def _run_prescription_job(logger: logging.Logger, field_pk: int) -> None:
    close_old_connections()
    try:
        field = Field.objects.get(pk=field_pk)
        result = create_prescription_map_for_field(logger, field)
        if not result.get("success", False):
            logger.warning(
                "Prescription background job completed with handled failure for field pk=%s (stage=%s, error=%s)",
                field_pk,
                result.get("stage", "unknown"),
                result.get("error", "unknown error"),
            )
    except Field.DoesNotExist:
        logger.error("Prescription job failed: field pk=%s not found", field_pk)
    except Exception:
        logger.exception("Unhandled error in prescription background job for field pk=%s", field_pk)
    finally:
        close_old_connections()

def enqueue_prescription_map_job(logger: logging.Logger, field: Field) -> None:
    Thread(target=_run_prescription_job, args=(logger, field.pk,), daemon=True).start()
