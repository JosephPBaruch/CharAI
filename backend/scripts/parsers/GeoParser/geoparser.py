"""GeoTIFF parser entry-point used by the backend ingestion pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np

try:
    from .geotiff import GeoTIFFData
except ImportError:  # pragma: no cover - allows running as a script without package context
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
        """Return the elevation array, optionally normalized to [0, 1]."""

        geotiff = self._ensure_loaded()
        return geotiff.normalized() if normalize else geotiff.data

    def to_backend_payload(self, include_data: bool = False) -> dict:
        """Return a JSON-serializable payload with metadata (and optionally data)."""

        geotiff = self._ensure_loaded()

        payload = {
            "metadata": geotiff.metadata_dict(),
        }

        if include_data:
            payload["data"] = geotiff.data.ravel().tolist()

        return payload

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


def parse_geotiff(path: PathLike, *, normalize: bool = False, include_data: bool = False) -> dict:
    """Convenience helper to load a GeoTIFF and return a backend-ready payload."""

    parser = GeoParser(path)
    parser.parse()
    payload = parser.to_backend_payload(include_data=include_data)
    if include_data and normalize:
        payload["data"] = parser.get_elevation_array(normalize=True).ravel().tolist()
    return payload


if __name__ == "__main__":
    # Simple sanity check example for local runs.
    default_path = Path(__file__).resolve().parent / "palouse_test.tif"
    parser = GeoParser(default_path)
    tiff = parser.parse()

    print(f"Loaded GeoTIFF: {tiff.path}")
    print(f"Size: {tiff.width} x {tiff.height}")
    print(f"CRS: {tiff.crs}")
    print(f"Bounds: {tiff.bounds}")
    finite = np.isfinite(tiff.data)
    if finite.any():
        print(f"Elevation min/max: {np.nanmin(tiff.data):.2f} / {np.nanmax(tiff.data):.2f}")
    else:
        print("Elevation data contains only NaNs.")
