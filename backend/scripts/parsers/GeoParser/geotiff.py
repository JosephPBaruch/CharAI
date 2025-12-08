"""Data model and loading utilities for GeoTIFF DEM files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple, Union

import numpy as np
import rasterio
from rasterio.coords import BoundingBox
from rasterio.transform import Affine


Number = Union[int, float]


@dataclass
class GeoTIFFData:
    """Single-band GeoTIFF with elevation data and spatial metadata."""

    path: Path
    data: np.ndarray
    width: int
    height: int
    crs: Optional[str]
    transform: Affine
    bounds: BoundingBox
    nodata: Optional[Number]
    pixel_size: Tuple[float, float]
    min_elevation: Optional[float]
    max_elevation: Optional[float]

    @classmethod
    def from_file(cls, path: Union[str, Path], band: int = 1) -> "GeoTIFFData":
        """Load GeoTIFF from disk. Converts nodata values to NaN and casts to float32."""

        file_path = Path(path).expanduser().resolve()
        if not file_path.exists():
            raise FileNotFoundError(f"GeoTIFF not found at '{file_path}'.")

        with rasterio.open(file_path) as src:
            if band < 1 or band > src.count:
                raise ValueError(f"Requested band {band} not available (count={src.count}).")

            # Read as masked array so nodata is automatically masked, then replace with NaN.
            masked = src.read(band, masked=True).astype("float32")
            data = masked.filled(np.nan)

            nodata_value = None
            if src.nodatavals:
                nodata_value = src.nodatavals[band - 1]

            crs_str = src.crs.to_string() if src.crs else None
            transform = src.transform
            bounds = src.bounds
            pixel_size = (abs(transform.a), abs(transform.e))
            finite = np.isfinite(data)
            min_elevation = float(np.nanmin(data)) if finite.any() else None
            max_elevation = float(np.nanmax(data)) if finite.any() else None

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

    @property
    def shape(self) -> Tuple[int, int]:
        """Raster dimensions (height, width)."""

        return self.data.shape

    def sample_pixel(self, row: int, col: int) -> float:
        """Get elevation at the given pixel coordinate."""

        if row < 0 or col < 0 or row >= self.height or col >= self.width:
            raise IndexError(f"Pixel index ({row}, {col}) is outside raster bounds.")
        return float(self.data[row, col])

    def sample_world(self, x: Number, y: Number) -> float:
        """Get elevation at world coordinates (uses raster CRS)."""

        row, col = ~self.transform * (x, y)
        return self.sample_pixel(int(round(row)), int(round(col)))

    def normalized(self) -> np.ndarray:
        """Returns elevation normalized to [0, 1]. NaNs are ignored."""

        arr = self.data
        finite_mask = np.isfinite(arr)
        if not finite_mask.any():
            return np.full_like(arr, np.nan, dtype="float32")

        min_val = np.nanmin(arr)
        max_val = np.nanmax(arr)
        if np.isclose(max_val, min_val):
            return np.zeros_like(arr, dtype="float32")

        norm = (arr - min_val) / (max_val - min_val)
        return norm.astype("float32")

    def elevation_range(self) -> Tuple[Optional[float], Optional[float]]:
        """Returns (min, max) elevation. Computes and caches if needed."""

        if self.min_elevation is not None and self.max_elevation is not None:
            return self.min_elevation, self.max_elevation

        finite = np.isfinite(self.data)
        if not finite.any():
            return None, None

        self.min_elevation = float(np.nanmin(self.data))
        self.max_elevation = float(np.nanmax(self.data))
        return self.min_elevation, self.max_elevation

    def metadata_dict(self) -> Dict[str, object]:
        """Export metadata as JSON-serializable dict."""

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
