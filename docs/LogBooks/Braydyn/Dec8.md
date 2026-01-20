# Engineering Log - December 8, 2025

## Summary
Built GeoTIFF parser for DEM file ingestion pipeline.

## What I Did

**GeoTIFF Data Model (`Geotiff.py`)**
- `GeoTIFFData` dataclass with rasterio loader
- Handles nodata → NaN conversion automatically
- Methods: `sample_pixel()`, `sample_world()`, `normalized()`, `metadata_dict()`
- Stores CRS, transform, bounds, pixel size

**Parser (`geoparser.py`)**
- `GeoParser` class for backend integration
- Validates .tif/.tiff extensions
- `to_backend_payload()` outputs JSON-serializable dict
- Lazy loading pattern

## Tech Notes
- Used float32 for memory/precision tradeoff
- Rasterio masked arrays handle nodata cleanly
- Metadata-only vs full-data export modes for flexibility

## Dependencies
- `rasterio`, `numpy`

## TODO
- Wire up to Django upload endpoint
- Unit tests (nogo for this other functional tests are better)
- Multi-band support if needed