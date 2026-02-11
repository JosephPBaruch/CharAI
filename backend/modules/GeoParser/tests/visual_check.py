"""Visual sanity check for GeoTIFF grid-based dataframe output.

Usage:
    python visual_check.py path/to/file.tif [--debug]

This will:
- Parse the GeoTIFF
- Build the grid-based dataframe (cell aggregates)
- Plot elevation mean, slope mean, and aspect mean as heatmaps
- Print detailed stats (use --debug for additional pixel sizing info)
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt

# Allow package imports when running directly
modules_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(modules_dir))

from GeoParser.geoparser import GeoParser  # noqa: E402


def _grid_from_df(df, value_col: str) -> np.ndarray:
    rows = df["cell_row"].to_numpy(dtype=int)
    cols = df["cell_col"].to_numpy(dtype=int)
    values = df[value_col].to_numpy(dtype=float)

    max_row = rows.max()
    max_col = cols.max()
    grid = np.full((max_row + 1, max_col + 1), np.nan, dtype=float)
    grid[rows, cols] = values
    return grid


def main() -> int:
    debug = "--debug" in sys.argv
    if len(sys.argv) < 2 or (len(sys.argv) == 2 and "--debug" in sys.argv):
        print("Usage: python visual_check.py <path/to/geotiff> [--debug]")
        return 1

    tiff_path = Path(sys.argv[1]).expanduser().resolve()
    if not tiff_path.exists():
        print(f"File not found: {tiff_path}")
        return 1

    parser = GeoParser(tiff_path)
    tiff = parser.parse()

    df = tiff.to_dataframe(cell_size_meters=5.0, debug=debug)

    print("Grid dataframe summary:")
    print(f"Cell size (effective): {df['cell_size_m'].iloc[0]:.6f} m")
    print(f"Cell size (requested): {df['requested_cell_size_m'].iloc[0]:.6f} m")
    print("\nElevation, Slope, Aspect Stats:")
    print(df[["elev_mean_m", "slope_mean_deg", "aspect_mean_deg", "elev_range_m", "elev_std_m", "slope_std_deg", "aspect_northness", "aspect_eastness"]].describe())
    print("\nFull dataframe:")
    print(df.to_string(index=False))

    elev_grid = _grid_from_df(df, "elev_mean_m")
    slope_grid = _grid_from_df(df, "slope_mean_deg")
    aspect_grid = _grid_from_df(df, "aspect_mean_deg")

    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    im0 = axes[0].imshow(elev_grid, cmap="terrain", origin="upper")
    axes[0].set_title("Elevation Mean (m)")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)

    im1 = axes[1].imshow(slope_grid, cmap="magma", origin="upper")
    axes[1].set_title("Slope Mean (deg)")
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)

    im2 = axes[2].imshow(aspect_grid, cmap="twilight", origin="upper")
    axes[2].set_title("Aspect Mean (deg)")
    fig.colorbar(im2, ax=axes[2], fraction=0.046, pad=0.04)

    for ax in axes:
        ax.set_xlabel("Grid Column")
        ax.set_ylabel("Grid Row")

    plt.tight_layout()
    plt.show()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
