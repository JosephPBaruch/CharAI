"""GeoTIFF parsing API: elevation grids with coordinates for backend integration."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from pyproj import Transformer

from .geotiff import GeoTIFFData
from .geoparser import GeoParser


PathLike = str | Path


def process_geotiff(
    geotiff_path: PathLike,
    *,
    normalize_elevation: bool = False,
    sample_rate: int = 1,
    output_crs: str = "EPSG:4326"
) -> dict[str, Any]:
    """Extract elevation grid with lat/lon coordinates and metadata.
    
    Args:
        geotiff_path: Path to GeoTIFF file (.tif or .tiff).
        normalize_elevation: If True, normalize elevation to [0, 1].
        sample_rate: Downsample factor (1 = full resolution).
        output_crs: Target CRS (default: EPSG:4326 for WGS84 lat/lon).
    
    Returns:
        dict with keys: file, dimensions, source_crs, bounds, centroid, elevation, coordinates, grid_points, metadata.
        See implementation for full structure.
    
    Raises:
        FileNotFoundError: GeoTIFF file not found.
        ValueError: Invalid GeoTIFF or data.
    """
    
    parser = GeoParser(geotiff_path)
    geotiff = parser.parse()
    elevation_data = parser.get_elevation_array(normalize=normalize_elevation)
    
    # Downsample if needed
    if sample_rate > 1:
        elevation_data = elevation_data[::sample_rate, ::sample_rate]
    sampled_height, sampled_width = elevation_data.shape
    
    # Convert to target CRS
    bounds_latlon = _convert_bounds_to_latlon(geotiff.bounds, geotiff.crs, output_crs)
    latitudes, longitudes = _generate_coordinate_grids(geotiff, sample_rate, output_crs)
    
    # Centroid at bounds center
    centroid_latlon = _convert_point_to_latlon(
        x=(geotiff.bounds.left + geotiff.bounds.right) / 2,
        y=(geotiff.bounds.top + geotiff.bounds.bottom) / 2,
        source_crs=geotiff.crs,
        target_crs=output_crs
    )
    grid_points = _create_grid_points(latitudes, longitudes, elevation_data)
    elevation_unit = "normalized" if normalize_elevation else "meters"
    
    return {
        "file": geotiff.path.name,
        "dimensions": {
            "width": geotiff.width,
            "height": geotiff.height,
            "sampled_width": sampled_width,
            "sampled_height": sampled_height
        },
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
        "elevation": {
            "data": elevation_data.tolist(),
            "min": float(np.nanmin(elevation_data)),
            "max": float(np.nanmax(elevation_data)),
            "normalized": normalize_elevation,
            "unit": elevation_unit
        },
        "coordinates": {
            "latitudes": latitudes.tolist(),
            "longitudes": longitudes.tolist()
        },
        "grid_points": grid_points,
        "metadata": {
            "pixel_size": {
                "x": geotiff.pixel_size[0],
                "y": geotiff.pixel_size[1]
            },
            "nodata": geotiff.nodata
        }
    }


def _convert_bounds_to_latlon(
    bounds: Any,
    source_crs: str,
    target_crs: str = "EPSG:4326"
) -> dict[str, float]:
    """Convert bounding box from source CRS to target CRS (default WGS84 lat/lon)."""
    if source_crs is None:
        raise ValueError("Source CRS is not defined in GeoTIFF")
    
    if source_crs == target_crs:
        return {
            "north": bounds.top,
            "south": bounds.bottom,
            "east": bounds.right,
            "west": bounds.left
        }
    
    transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
    west, south = transformer.transform(bounds.left, bounds.bottom)
    east, north = transformer.transform(bounds.right, bounds.top)
    
    return {
        "north": north,
        "south": south,
        "east": east,
        "west": west
    }


def _convert_point_to_latlon(
    x: float,
    y: float,
    source_crs: str,
    target_crs: str = "EPSG:4326"
) -> dict[str, float]:
    """Convert a single point from source CRS to target CRS."""
    
    if source_crs is None:
        raise ValueError("Source CRS is not defined in GeoTIFF")
    
    if source_crs == target_crs:
        return {"longitude": x, "latitude": y}
    
    transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
    lon, lat = transformer.transform(x, y)
    
    return {"latitude": lat, "longitude": lon}


def _generate_coordinate_grids(
    geotiff: GeoTIFFData,
    sample_rate: int,
    target_crs: str = "EPSG:4326"
) -> tuple[np.ndarray, np.ndarray]:
    """Generate 2D lat/lon grids at sampled pixels."""
    cols = np.arange(0, geotiff.width, sample_rate)
    rows = np.arange(0, geotiff.height, sample_rate)
    col_grid, row_grid = np.meshgrid(cols, rows)
    
    # Pixel to world coordinates via affine transform
    transform = geotiff.transform
    x_coords = transform.c + col_grid * transform.a + row_grid * transform.b
    y_coords = transform.f + col_grid * transform.d + row_grid * transform.e
    
    # Transform to target CRS if needed
    if geotiff.crs and geotiff.crs != target_crs:
        transformer = Transformer.from_crs(geotiff.crs, target_crs, always_xy=True)
        longitudes, latitudes = transformer.transform(x_coords.flatten(), y_coords.flatten())
        latitudes = latitudes.reshape(x_coords.shape)
        longitudes = longitudes.reshape(x_coords.shape)
    else:
        longitudes = x_coords
        latitudes = y_coords
    
    return latitudes, longitudes


def _create_grid_points(
    latitudes: np.ndarray,
    longitudes: np.ndarray,
    elevations: np.ndarray
) -> list[dict[str, float]]:
    """Flatten coordinate grids into list of {lat, lon, elevation, row, col} dicts."""
    points = []
    height, width = elevations.shape
    
    for i in range(height):
        for j in range(width):
            elevation = elevations[i, j]
            if not np.isnan(elevation):  # Skip invalid values
                points.append({
                    "latitude": float(latitudes[i, j]),
                    "longitude": float(longitudes[i, j]),
                    "elevation": float(elevation),
                    "row": i,
                    "col": j
                })
    
    return points


def get_geotiff_summary(geotiff_path: PathLike) -> dict[str, Any]:
    """Extract metadata without loading full elevation data."""
    parser = GeoParser(geotiff_path)
    geotiff = parser.parse()
    
    return geotiff.metadata_dict()
