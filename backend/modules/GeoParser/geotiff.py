"""Data model and loading utilities for GeoTIFF DEM files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import rasterio
from pyproj import Transformer
from rasterio.coords import BoundingBox
from rasterio.transform import Affine

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


Number = int | float


@dataclass
class GeoTIFFData:
    """Single-band GeoTIFF with elevation data and spatial metadata."""

    path: Path
    data: np.ndarray
    width: int
    height: int
    crs: str | None
    transform: Affine
    bounds: BoundingBox
    nodata: Number | None
    pixel_size: tuple[float, float]
    min_elevation: float | None
    max_elevation: float | None

    @classmethod
    def from_file(cls, path: str | Path, band: int = 1) -> "GeoTIFFData":
        file_path = Path(path).expanduser().resolve()
        if not file_path.exists():
            raise FileNotFoundError(f"GeoTIFF not found at '{file_path}'.")
        
        if not file_path.is_file():
            raise ValueError(f"Path is not a file: '{file_path}'")

        try:
            with rasterio.open(file_path) as src:
                if band < 1 or band > src.count:
                    raise ValueError(f"Requested band {band} not available (count={src.count}).")
                
                if src.width == 0 or src.height == 0:
                    raise ValueError(f"Invalid raster dimensions: {src.width}x{src.height}")

                masked: np.ma.MaskedArray = src.read(band, masked=True).astype("float32")
                data: np.ndarray = masked.filled(np.nan)

                nodata_value: Number | None = None
                if src.nodatavals:
                    nodata_value = src.nodatavals[band - 1]

                crs_str: str | None = src.crs.to_string() if src.crs else None
                transform: Affine = src.transform
                bounds: BoundingBox = src.bounds
                pixel_size: tuple[float, float] = (abs(transform.a), abs(transform.e))
                finite: np.ndarray = np.isfinite(data)
                min_elevation: float | None = float(np.nanmin(data)) if finite.any() else None
                max_elevation: float | None = float(np.nanmax(data)) if finite.any() else None

                return cls(
                    path=file_path,
                    data=data,
                    width=src.width,
                    height=src.height,
                    crs=crs_str,
                    transform=transform,
                    bounds=bounds,
                    nodata=nodata_value,
                    pixel_size=pixel_size,
                    min_elevation=min_elevation,
                    max_elevation=max_elevation,
                )
        except rasterio.errors.RasterioIOError as e:
            raise ValueError(f"Failed to read GeoTIFF '{file_path}': {e}") from e

    @property
    def shape(self) -> tuple[int, int]:
        """Raster dimensions (height, width)."""

        return self.data.shape

    def sample_pixel(self, row: int, col: int) -> float:
        """Get elevation at the given pixel coordinate."""

        if row < 0 or col < 0 or row >= self.height or col >= self.width:
            raise IndexError(
                f"Pixel index ({row}, {col}) is outside raster bounds "
                f"(0-{self.height-1}, 0-{self.width-1})."
            )
        return float(self.data[row, col])

    def sample_world(self, x: Number, y: Number) -> float:
        row: float
        col: float
        row, col = ~self.transform * (x, y)
        return self.sample_pixel(int(round(row)), int(round(col)))

    def normalized(self) -> np.ndarray:
        """Returns elevation normalized to [0, 1]. NaNs are ignored."""

        arr: np.ndarray = self.data
        finite_mask: np.ndarray = np.isfinite(arr)
        if not finite_mask.any():
            return np.full_like(arr, np.nan, dtype="float32")

        min_val: float = np.nanmin(arr)
        max_val: float = np.nanmax(arr)
        if np.isclose(max_val, min_val):
            return np.zeros_like(arr, dtype="float32")

        norm: np.ndarray = (arr - min_val) / (max_val - min_val)
        return norm.astype("float32")

    def metadata_dict(self) -> dict[str, Any]:
        return {
            "path": str(self.path),
            "width": self.width,
            "height": self.height,
            "shape": {"height": self.height, "width": self.width},
            "crs": self.crs,
            "transform": list(self.transform),
            "bounds": {
                "left": self.bounds.left,
                "bottom": self.bounds.bottom,
                "right": self.bounds.right,
                "top": self.bounds.top,
            },
            "nodata": self.nodata,
            "pixel_size": {"x": self.pixel_size[0], "y": self.pixel_size[1]},
            "elevation": {
                "min": self.min_elevation,
                "max": self.max_elevation,
            },
            "centroid": {
                "x": (self.bounds.left + self.bounds.right) / 2,
                "y": (self.bounds.top + self.bounds.bottom) / 2,
            },
        }


    def to_dataframe(
        self,
        cell_size_meters: float = 5.0,
        output_crs: str = "EPSG:4326",
        remove_nodata: bool = True,
        debug: bool = False,
    ):
        """
        Returns a cell-level dataframe (one row per management cell) with all required features for ML.
        """
        if not HAS_PANDAS:
            raise ImportError("pandas is required for to_dataframe(). Install with: pip install pandas")

        # Create coordinate grids
        rows, cols = np.meshgrid(
            np.arange(self.height),
            np.arange(self.width),
            indexing="ij",
        )
        xs, ys = self.transform * (cols, rows)

        # CRS transform for centroid calculation
        if self.crs is None:
            raise ValueError("CRS is not defined; cannot build grid dataframe.")
        if self.crs == output_crs:
            lons = xs
            lats = ys
        else:
            transformer = Transformer.from_crs(self.crs, output_crs, always_xy=True)
            lons, lats = transformer.transform(xs, ys)

        # Pixel size in meters with accurate geographic conversion
        pixel_size_x, pixel_size_y = self.pixel_size
        if "4326" in str(self.crs) or "WGS84" in str(self.crs):
            centroid_lat_deg = (self.bounds.top + self.bounds.bottom) / 2
            lat_rad = np.radians(centroid_lat_deg)
            # Accurate latitude-dependent conversion formulas
            meters_per_deg_lat = 111132.92 - 559.82 * np.cos(2 * lat_rad) + 1.175 * np.cos(4 * lat_rad)
            meters_per_deg_lon = 111412.84 * np.cos(lat_rad) - 93.5 * np.cos(3 * lat_rad)
            pixel_size_x_meters = pixel_size_x * meters_per_deg_lon
            pixel_size_y_meters = pixel_size_y * meters_per_deg_lat
        else:
            pixel_size_x_meters = pixel_size_x
            pixel_size_y_meters = pixel_size_y
        pixel_size_meters = (pixel_size_x_meters + pixel_size_y_meters) / 2

        # Iterative NaN fill using nearest 4-neighbors
        elev_for_grad = self.data.copy()
        for _ in range(5):
            if not np.any(np.isnan(elev_for_grad)):
                break
            filled = elev_for_grad.copy()
            for i in range(elev_for_grad.shape[0]):
                for j in range(elev_for_grad.shape[1]):
                    if np.isnan(elev_for_grad[i, j]):
                        neighbors = []
                        for (di, dj) in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            ni, nj = i + di, j + dj
                            if 0 <= ni < elev_for_grad.shape[0] and 0 <= nj < elev_for_grad.shape[1]:
                                if np.isfinite(elev_for_grad[ni, nj]):
                                    neighbors.append(elev_for_grad[ni, nj])
                        if neighbors:
                            filled[i, j] = np.mean(neighbors)
            elev_for_grad = filled

        # Compute terrain metrics from filled elevation
        from .terrain_analysis import calculate_terrain_metrics
        slope, aspect = calculate_terrain_metrics(
            elev_for_grad,
            pixel_size_x_meters,
            pixel_size_y_meters
        )
        # Mask metrics to NaN where original data is NaN
        mask = ~np.isfinite(self.data)
        slope[mask] = np.nan
        aspect[mask] = np.nan

        # Grid aggregation with accurate cell sizing
        pixels_per_cell = int(np.ceil(cell_size_meters / pixel_size_meters))
        pixels_per_cell = max(pixels_per_cell, 1)
        effective_cell_size_m = pixels_per_cell * pixel_size_meters
        if debug:
            print(f"[DEBUG] pixel_size_x_meters={pixel_size_x_meters:.6f}, pixel_size_y_meters={pixel_size_y_meters:.6f}")
            print(f"[DEBUG] pixel_size_meters={pixel_size_meters:.6f}, pixels_per_cell={pixels_per_cell}, effective_cell_size_m={effective_cell_size_m:.6f}")
        height, width = self.data.shape
        cells = []
        cell_row = 0
        for i in range(0, height, pixels_per_cell):
            cell_col = 0
            for j in range(0, width, pixels_per_cell):
                i_end = min(i + pixels_per_cell, height)
                j_end = min(j + pixels_per_cell, width)
                elev_window = self.data[i:i_end, j:j_end]
                lat_window = lats[i:i_end, j:j_end]
                lon_window = lons[i:i_end, j:j_end]
                slope_window = slope[i:i_end, j:j_end]
                aspect_window = aspect[i:i_end, j:j_end]
                if np.all(np.isnan(elev_window)):
                    cell_col += 1
                    continue
                # Use mean of valid pixels for cell centroid
                valid_mask = np.isfinite(elev_window)
                if valid_mask.any():
                    centroid_lat = float(np.nanmean(lat_window[valid_mask]))
                    centroid_lon = float(np.nanmean(lon_window[valid_mask]))
                else:
                    centroid_lat = np.nan
                    centroid_lon = np.nan
                # Elevation statistics
                elev_vals = elev_window[valid_mask]
                elev_mean = float(np.nanmean(elev_vals))
                elev_min = float(np.nanmin(elev_vals))
                elev_max = float(np.nanmax(elev_vals))
                elev_range = elev_max - elev_min
                elev_std = float(np.nanstd(elev_vals))
                # Slope statistics
                slope_vals = slope_window[valid_mask]
                slope_mean = float(np.nanmean(slope_vals))
                slope_std = float(np.nanstd(slope_vals))
                slope_max = float(np.nanmax(slope_vals))
                # Circular mean for aspect (0° and 360° are same)
                aspect_vals = aspect_window[valid_mask]
                aspect_valid = aspect_vals[np.isfinite(aspect_vals) & (aspect_vals >= 0)]
                if len(aspect_valid) > 0:
                    sin_sum = np.nanmean(np.sin(np.radians(aspect_valid)))
                    cos_sum = np.nanmean(np.cos(np.radians(aspect_valid)))
                    aspect_mean = float(np.degrees(np.arctan2(sin_sum, cos_sum)))
                    if aspect_mean < 0:
                        aspect_mean += 360
                    aspect_northness = float(np.cos(np.radians(aspect_mean)))
                    aspect_eastness = float(np.sin(np.radians(aspect_mean)))
                else:
                    aspect_mean = np.nan
                    aspect_northness = 0.0
                    aspect_eastness = 0.0
                cell = {
                    "cell_id": f"{cell_row}_{cell_col}",
                    "cell_row": cell_row,
                    "cell_col": cell_col,
                    "cell_size_m": float(effective_cell_size_m),
                    "requested_cell_size_m": float(cell_size_meters),
                    "centroid_lat": centroid_lat,
                    "centroid_lon": centroid_lon,
                    "pixel_count": int(valid_mask.sum()),
                    "elev_mean_m": elev_mean,
                    "elev_min_m": elev_min,
                    "elev_max_m": elev_max,
                    "elev_range_m": elev_range,
                    "elev_std_m": elev_std,
                    "slope_mean_deg": slope_mean,
                    "slope_std_deg": slope_std,
                    "slope_max_deg": slope_max,
                    "aspect_mean_deg": aspect_mean,
                    "aspect_northness": aspect_northness,
                    "aspect_eastness": aspect_eastness,
                }
                cells.append(cell)
                cell_col += 1
            cell_row += 1
        import pandas as pd
        df = pd.DataFrame(cells)
        if remove_nodata and not df.empty:
            df = df[np.isfinite(df["elev_mean_m"])].reset_index(drop=True)
        
        # Round values for ML-friendly output
        if not df.empty:
            df["aspect_northness"] = df["aspect_northness"].round(6)
            df["aspect_eastness"] = df["aspect_eastness"].round(6)
            df["slope_mean_deg"] = df["slope_mean_deg"].round(3)
            df["slope_std_deg"] = df["slope_std_deg"].round(3)
            df["slope_max_deg"] = df["slope_max_deg"].round(3)
            df["elev_mean_m"] = df["elev_mean_m"].round(2)
            df["elev_min_m"] = df["elev_min_m"].round(2)
            df["elev_max_m"] = df["elev_max_m"].round(2)
            df["elev_range_m"] = df["elev_range_m"].round(2)
            df["elev_std_m"] = df["elev_std_m"].round(3)
        
        return df

    def to_pixel_dataframe(self, output_crs: str = "EPSG:4326", remove_nodata: bool = True):
        """
        Returns a pixel-level dataframe for debugging (optional).
        """
        if not HAS_PANDAS:
            raise ImportError("pandas is required for to_pixel_dataframe(). Install with: pip install pandas")
        rows, cols = np.meshgrid(
            np.arange(self.height),
            np.arange(self.width),
            indexing="ij",
        )
        xs, ys = self.transform * (cols, rows)
        if self.crs is None:
            raise ValueError("CRS is not defined; cannot build pixel dataframe.")
        if self.crs == output_crs:
            lons = xs
            lats = ys
        else:
            transformer = Transformer.from_crs(self.crs, output_crs, always_xy=True)
            lons, lats = transformer.transform(xs, ys)
        df = pd.DataFrame({
            "row": rows.ravel(),
            "col": cols.ravel(),
            "lat": lats.ravel(),
            "lon": lons.ravel(),
            "elev_m": self.data.ravel(),
        })
        if remove_nodata:
            df = df[np.isfinite(df["elev_m"])].reset_index(drop=True)
        return df
