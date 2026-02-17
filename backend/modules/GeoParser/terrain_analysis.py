"""Terrain analysis: slope, aspect, and aggregate metrics from elevation data."""

from __future__ import annotations

import numpy as np


def fill_nans_neighbor_based(
    data: np.ndarray,
    max_iterations: int = 5
) -> np.ndarray:
    """Fill NaN values using iterative 4-neighbor averaging.
    
    Args:
        data: Input array with potential NaN values
        max_iterations: Maximum number of fill iterations
    
    Returns:
        Array with NaN values filled from surrounding neighbors
    """
    if not np.any(np.isnan(data)):
        return data
    
    filled = data.copy()
    for _ in range(max_iterations):
        if not np.any(np.isnan(filled)):
            break
        temp = filled.copy()
        for i in range(filled.shape[0]):
            for j in range(filled.shape[1]):
                if np.isnan(filled[i, j]):
                    neighbors = []
                    for (di, dj) in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        ni, nj = i + di, j + dj
                        if 0 <= ni < filled.shape[0] and 0 <= nj < filled.shape[1]:
                            if np.isfinite(filled[ni, nj]):
                                neighbors.append(filled[ni, nj])
                    if neighbors:
                        temp[i, j] = np.mean(neighbors)
        filled = temp
    return filled


def calculate_slope(
    elevation_data: np.ndarray,
    pixel_size_x: float,
    pixel_size_y: float,
    degrees: bool = True
) -> np.ndarray:
    """Slope in degrees (rise/run normalized by pixel spacing)."""
    if np.isnan(elevation_data).any():
        data = fill_nans_neighbor_based(elevation_data)
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
        data = fill_nans_neighbor_based(elevation_data)
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
