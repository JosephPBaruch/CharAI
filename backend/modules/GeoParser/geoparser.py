"""GeoTIFF parser entry-point for backend ingestion pipeline."""

from __future__ import annotations

from pathlib import Path

from .geotiff import GeoTIFFData


PathLike = str | Path


class GeoParser:
    """Parser for GeoTIFF DEM files."""

    SUPPORTED_EXTENSIONS = {".tif", ".tiff"}

    def __init__(self, path: PathLike):
        self.path = Path(path).expanduser().resolve()
        self._geotiff: GeoTIFFData | None = None

    def parse(self) -> GeoTIFFData:
        """Load the GeoTIFF and return the data model."""

        self._validate_path()
        self._geotiff = GeoTIFFData.from_file(self.path)
        return self._geotiff

    def _validate_path(self) -> None:
        if not self.path.exists():
            raise FileNotFoundError(f"File does not exist: {self.path}")

        suffix = self.path.suffix.lower()
        if suffix not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file extension '{suffix}'. "
                f"Supported extensions: {sorted(self.SUPPORTED_EXTENSIONS)}"
            )
