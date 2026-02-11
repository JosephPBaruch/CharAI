"""Terrain analysis: slope, aspect, and aggregate metrics from elevation data."""

from __future__ import annotations

import numpy as np


def calculate_slope(
    elevation_data: np.ndarray,
    pixel_size_x: float,
    pixel_size_y: float,
    degrees: bool = True
) -> np.ndarray:
    """Slope in degrees (rise/run normalized by pixel spacing)."""
    if np.isnan(elevation_data).any():
        fill_value = float(np.nanmean(elevation_data))
        data = np.where(np.isfinite(elevation_data), elevation_data, fill_value)
    else:
        data = elevation_data

    dy, dx = np.gradient(data, pixel_size_y, pixel_size_x)
    slope = np.sqrt(dx**2 + dy**2)
    
    if degrees:
        slope = np.degrees(np.arctan(slope))
    
    return slope


def calculate_aspect(
    elevation_data: np.ndarray,
    pixel_size_x: float,
    pixel_size_y: float
) -> np.ndarray:
    """Aspect in degrees (0-360 from North), -1 for flat areas."""
    if np.isnan(elevation_data).any():
        fill_value = float(np.nanmean(elevation_data))
        data = np.where(np.isfinite(elevation_data), elevation_data, fill_value)
    else:
        data = elevation_data

    dy, dx = np.gradient(data, pixel_size_y, pixel_size_x)
    
    # arctan2(dy, dx) from -π to π; convert to compass bearing (0-360 from North)
    aspect = np.degrees(np.arctan2(-dy, dx))
    aspect = 90 - aspect  # Mathematical to compass conversion
    aspect = np.where(aspect < 0, aspect + 360, aspect)
    aspect = np.where(aspect >= 360, aspect - 360, aspect)
    
    # Flat areas (slope < 0.001) marked as -1
    slope_magnitude = np.sqrt(dx**2 + dy**2)
    aspect = np.where(slope_magnitude < 0.001, -1, aspect)
    
    return aspect


def calculate_terrain_metrics(
    elevation_data: np.ndarray,
    pixel_size_x: float,
    pixel_size_y: float
) -> tuple[np.ndarray, np.ndarray]:
    """Returns (slope_degrees, aspect_degrees)."""
    slope = calculate_slope(elevation_data, pixel_size_x, pixel_size_y, degrees=True)
    aspect = calculate_aspect(elevation_data, pixel_size_x, pixel_size_y)
    return slope, aspect


def create_grid_cells(
    elevation_data: np.ndarray,
    latitudes: np.ndarray,
    longitudes: np.ndarray,
    slope: np.ndarray,
    aspect: np.ndarray,
    cell_size_meters: float,
    pixel_size_meters: float
) -> list:
    """Aggregate pixels into grid cells with mean values."""
    pixels_per_cell = int(np.ceil(cell_size_meters / pixel_size_meters))
    pixels_per_cell = max(pixels_per_cell, 1)
    
    height, width = elevation_data.shape
    cells = []
    
    cell_row = 0
    for i in range(0, height, pixels_per_cell):
        cell_col = 0
        for j in range(0, width, pixels_per_cell):
            i_end = min(i + pixels_per_cell, height)
            j_end = min(j + pixels_per_cell, width)
            
            elev_window = elevation_data[i:i_end, j:j_end]
            lat_window = latitudes[i:i_end, j:j_end]
            lon_window = longitudes[i:i_end, j:j_end]
            slope_window = slope[i:i_end, j:j_end]
            aspect_window = aspect[i:i_end, j:j_end]
            
            if np.all(np.isnan(elev_window)):
                cell_col += 1
                continue
            
            mean_elevation = float(np.nanmean(elev_window))
            mean_latitude = float(np.nanmean(lat_window))
            mean_longitude = float(np.nanmean(lon_window))
            mean_slope = float(np.nanmean(slope_window))
            
            # Circular mean for aspect (exclude -1 flat areas)
            valid_aspects = aspect_window[aspect_window >= 0]
            if len(valid_aspects) > 0:
                sin_sum = np.nanmean(np.sin(np.radians(valid_aspects)))
                cos_sum = np.nanmean(np.cos(np.radians(valid_aspects)))
                mean_aspect = float(np.degrees(np.arctan2(sin_sum, cos_sum)))
                if mean_aspect < 0:
                    mean_aspect += 360
            else:
                mean_aspect = -1
            min_elevation = float(np.nanmin(elev_window))
            max_elevation = float(np.nanmax(elev_window))
            
            cells.append({
                "cell_id": f"{cell_row}_{cell_col}",
                "row": cell_row,
                "col": cell_col,
                "latitude": mean_latitude,
                "longitude": mean_longitude,
                "elevation": {
                    "mean": mean_elevation,
                    "min": min_elevation,
                    "max": max_elevation
                },
                "slope_degrees": mean_slope,
                "aspect_degrees": mean_aspect,
                "cell_size_meters": cell_size_meters,
                "pixel_count": int((i_end - i) * (j_end - j))
            })
            
            cell_col += 1
        cell_row += 1
    
    return cells
