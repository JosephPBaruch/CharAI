"""Data model and loading utilities for GeoTIFF DEM files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

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

                nodata_value: Optional[Number] = None
                if src.nodatavals:
                    nodata_value = src.nodatavals[band - 1]

                crs_str: Optional[str] = src.crs.to_string() if src.crs else None
                transform: Affine = src.transform
                bounds: BoundingBox = src.bounds
                pixel_size: Tuple[float, float] = (abs(transform.a), abs(transform.e))
                finite: np.ndarray = np.isfinite(data)
                min_elevation: Optional[float] = float(np.nanmin(data)) if finite.any() else None
                max_elevation: Optional[float] = float(np.nanmax(data)) if finite.any() else None

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
    def shape(self) -> Tuple[int, int]:
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

    def metadata_dict(self) -> Dict[str, Any]:
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
