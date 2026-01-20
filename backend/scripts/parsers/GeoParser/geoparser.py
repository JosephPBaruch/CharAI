"""GeoTIFF parser entry-point used by the backend ingestion pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
from geotiff import GeoTIFFData


PathLike = Path | str


class GeoParser:
    """Parser for GeoTIFF DEM files."""

    SUPPORTED_EXTENSIONS = {".tif", ".tiff"}

    def __init__(self, path: PathLike):
        self.path = Path(path).expanduser().resolve()
        self._geotiff: Optional[GeoTIFFData] = None

    def parse(self) -> GeoTIFFData:
        """Load the GeoTIFF and return the data model."""

        self._validate_path()
        self._geotiff = GeoTIFFData.from_file(self.path)
        return self._geotiff

    def get_elevation_array(self, normalize: bool = False) -> np.ndarray:
        geotiff = self._ensure_loaded()
        data = geotiff.normalized() if normalize else geotiff.data
        
        if not np.isfinite(data).any():
            raise ValueError("Elevation data contains no valid values (all NaN/Inf)")
        
        return data

    def to_backend_response(self, include_data: bool = False) -> Dict[str, Any]:
        geotiff = self._ensure_loaded()

        response = {
            "metadata": geotiff.metadata_dict(),
        }

        if include_data:
            data_size = geotiff.data.size
            max_size = 100_000_000  # 100M elements
            if data_size > max_size:
                raise ValueError(
                    f"Data array too large: {data_size} elements (max: {max_size})"
                )
            response["data"] = geotiff.data.ravel().tolist()

        return response

    def _validate_path(self) -> None:
        if not self.path.exists():
            raise FileNotFoundError(f"File does not exist: {self.path}")

        suffix = self.path.suffix.lower()
        if suffix not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file extension '{suffix}'. "
                f"Supported extensions: {sorted(self.SUPPORTED_EXTENSIONS)}"
            )

    def _ensure_loaded(self) -> GeoTIFFData:
        if self._geotiff is None:
            return self.parse()
        return self._geotiff


def parse_geotiff(path: PathLike, *, normalize: bool = False, include_data: bool = False) -> Dict[str, Any]:
    parser = GeoParser(path)
    parser.parse()
    response = parser.to_backend_response(include_data=include_data)
    if include_data and normalize:
        response["data"] = parser.get_elevation_array(normalize=True).ravel().tolist()
    return response
