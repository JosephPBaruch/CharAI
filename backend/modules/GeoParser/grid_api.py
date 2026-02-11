"""Enhanced GeoParser with terrain analysis and metric-based grid cells."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from pyproj import Transformer

from .geotiff import GeoTIFFData
from .geoparser import GeoParser
from .terrain_analysis import calculate_terrain_metrics, create_grid_cells
from .api import _convert_bounds_to_latlon, _convert_point_to_latlon, _generate_coordinate_grids


PathLike = str | Path


def process_geotiff_with_terrain(
    geotiff_path: PathLike,
    *,
    cell_size_meters: float = 5.0,
    output_crs: str = "EPSG:4326"
) -> dict[str, Any]:
    """Process GeoTIFF and generate terrain-analyzed grid cells.
    
    Args:
        geotiff_path: Path to GeoTIFF file (.tif or .tiff).
        cell_size_meters: Grid cell size in meters (default: 5).
        output_crs: Target CRS (default: EPSG:4326 for WGS84 lat/lon).
    
    Returns:
        dict with keys: file, source_crs, bounds, centroid, cell_size_meters, pixel_size_meters, grid, cells.
        Each cell contains: cell_id, row, col, latitude, longitude, elevation, slope_degrees, aspect_degrees.
    
    Raises:
        FileNotFoundError: GeoTIFF file not found.
        ValueError: Invalid GeoTIFF or data.
    """
    parser = GeoParser(geotiff_path)
    geotiff = parser.parse()
    elevation_data = parser.get_elevation_array(normalize=False)
    
    pixel_size_x, pixel_size_y = geotiff.pixel_size
    
    # Convert pixel size to meters (for geographic CRS like EPSG:4326)
    if geotiff.crs and ("4326" in geotiff.crs or "WGS84" in geotiff.crs):
        # 1° lat ≈ 111,320m; 1° lon ≈ 111,320 * cos(lat)m
        centroid_lat = (geotiff.bounds.top + geotiff.bounds.bottom) / 2
        pixel_size_x_meters = pixel_size_x * 111320 * np.cos(np.radians(centroid_lat))
        pixel_size_y_meters = pixel_size_y * 111320
    else:
        pixel_size_x_meters = pixel_size_x
        pixel_size_y_meters = pixel_size_y
    pixel_size_meters = (pixel_size_x_meters + pixel_size_y_meters) / 2
    
    # Calculate terrain metrics
    slope, aspect = calculate_terrain_metrics(elevation_data, pixel_size_x_meters, pixel_size_y_meters)
    latitudes, longitudes = _generate_coordinate_grids(geotiff, sample_rate=1, target_crs=output_crs)
    cells = create_grid_cells(elevation_data, latitudes, longitudes, slope, aspect, cell_size_meters, pixel_size_meters)
    
    # Grid dimensions
    if cells:
        max_row = max(cell["row"] for cell in cells)
        max_col = max(cell["col"] for cell in cells)
        grid_rows, grid_cols = max_row + 1, max_col + 1
    else:
        grid_rows = grid_cols = 0
    
    bounds_latlon = _convert_bounds_to_latlon(geotiff.bounds, geotiff.crs, output_crs)
    centroid_latlon = _convert_point_to_latlon(
        x=(geotiff.bounds.left + geotiff.bounds.right) / 2,
        y=(geotiff.bounds.top + geotiff.bounds.bottom) / 2,
        source_crs=geotiff.crs,
        target_crs=output_crs
    )
    
    return {
        "file": geotiff.path.name,
        "source_crs": geotiff.crs,
        "bounds": {
            "north": bounds_latlon["north"],
            "south": bounds_latlon["south"],
            "east": bounds_latlon["east"],
            "west": bounds_latlon["west"]
        },
        "centroid": {
            "latitude": centroid_latlon["latitude"],
            "longitude": centroid_latlon["longitude"]
        },
        "cell_size_meters": cell_size_meters,
        "pixel_size_meters": pixel_size_meters,
        "grid": {
            "rows": grid_rows,
            "cols": grid_cols,
            "total_cells": len(cells)
        },
        "cells": cells
    }


def get_cell_by_id(data: dict[str, Any], cell_id: str) -> dict[str, Any]:
    """Retrieve a specific cell by its ID (format: "row_col")."""
    for cell in data["cells"]:
        if cell["cell_id"] == cell_id:
            return cell
    return None


def get_cell_by_position(data: dict[str, Any], row: int, col: int) -> dict[str, Any]:
    """Retrieve a specific cell by its grid position (row, col)."""
    return get_cell_by_id(data, f"{row}_{col}")


def filter_cells_by_criteria(
    data: dict[str, Any],
    *,
    min_elevation: float = None,
    max_elevation: float = None,
    min_slope: float = None,
    max_slope: float = None
) -> list[dict[str, Any]]:
    """Filter cells based on terrain criteria (elevation and slope thresholds)."""
    filtered = data["cells"]
    
    if min_elevation is not None:
        filtered = [c for c in filtered if c["elevation"]["mean"] >= min_elevation]
    
    if max_elevation is not None:
        filtered = [c for c in filtered if c["elevation"]["mean"] <= max_elevation]
    
    if min_slope is not None:
        filtered = [c for c in filtered if c["slope_degrees"] >= min_slope]
    
    if max_slope is not None:
        filtered = [c for c in filtered if c["slope_degrees"] <= max_slope]
    
    return filtered
