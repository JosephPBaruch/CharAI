"""Quick manual test runner for GeoTIFF parsing.

Usage:
    py test.py path/to/file.tif
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Optional

import numpy as np

from geoparser import GeoParser
from geotiff import GeoTIFFData


def describe(tiff: GeoTIFFData, elevation: np.ndarray) -> None:
    """Print basic metadata and stats."""

    print(f"File: {tiff.path}")
    print(f"Size: {tiff.width} x {tiff.height}")
    print(f"CRS: {tiff.crs}")
    print(f"Bounds: {tiff.bounds}")
    print(f"Nodata: {tiff.nodata}")
    print(f"Pixel size: {tiff.pixel_size}")
    min_el, max_el = tiff.elevation_range()
    print(f"Stored elevation min/max: {min_el} / {max_el}")

    finite = np.isfinite(elevation)
    if finite.any():
        print(f"Elevation min: {np.nanmin(elevation):.3f}")
        print(f"Elevation max: {np.nanmax(elevation):.3f}")
    else:
        print("Elevation data contains only NaNs.")


def show_image(tiff: GeoTIFFData, elevation: np.ndarray, use_feet: bool = False) -> None:
    """Display the elevation raster if matplotlib is available."""

    try:
        import matplotlib.pyplot as plt  # type: ignore
    except ImportError:
        print("matplotlib not installed; skipping image display.")
        return

    # Use distance from dataset origin (0,0) in native units (typically meters).
    px_size_x, px_size_y = tiff.pixel_size
    width_dist = tiff.width * px_size_x
    height_dist = tiff.height * px_size_y

    axis_label_unit = "meters"
    if use_feet:
        feet_factor = 3.28084
        width_dist *= feet_factor
        height_dist *= feet_factor
        axis_label_unit = "feet"

    extent = [0, width_dist, height_dist, 0]  # origin at top-left; origin="upper" keeps orientation

    plt.figure(figsize=(8, 6))
    img = plt.imshow(
        elevation,
        cmap="terrain",
        extent=extent,
        origin="upper",
    )
    plt.colorbar(img, label="Elevation")
    plt.title(f"GeoTIFF: {Path(tiff.path).name}")
    plt.xlabel(f"X ({axis_label_unit})")
    plt.ylabel(f"Y ({axis_label_unit})")
    plt.tight_layout()
    plt.show()


def main() -> None:
    parser = argparse.ArgumentParser(description="GeoTIFF test runner")
    parser.add_argument("path", type=Path, help="Path to a GeoTIFF (.tif/.tiff)")
    parser.add_argument(
        "--normalize",
        action="store_true",
        help="Display normalized elevation (0..1) instead of raw values.",
    )
    parser.add_argument(
        "--no-show",
        action="store_true",
        help="Skip image display (always shown when matplotlib is available unless set).",
    )
    parser.add_argument(
        "--feet",
        action="store_true",
        help="Display axes in feet instead of CRS units (meters for most projected DEMs).",
    )
    args = parser.parse_args()

    geo_parser = GeoParser(args.path)
    tiff = geo_parser.parse()
    elevation = geo_parser.get_elevation_array(normalize=args.normalize)

    describe(tiff, elevation)

    if not args.no_show:
        show_image(tiff, elevation, use_feet=args.feet)


if __name__ == "__main__":
    main()
