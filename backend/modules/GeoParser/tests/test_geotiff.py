"""Unit tests for GeoTIFFData utilities."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

import numpy as np

try:
    import pandas as pd  # noqa: F401
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

# Allow module imports when running tests directly
sys.path.insert(0, str(Path(__file__).parent.parent))

from geotiff import GeoTIFFData  # noqa: E402


class TestGeoTIFFData(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.test_file = Path(__file__).parent / "palouse_test.tif"
        if not cls.test_file.exists():
            raise FileNotFoundError(f"Test GeoTIFF not found: {cls.test_file}")
        cls.tiff = GeoTIFFData.from_file(cls.test_file)

    def test_metadata_basic(self) -> None:
        self.assertGreater(self.tiff.width, 0)
        self.assertGreater(self.tiff.height, 0)
        self.assertEqual(self.tiff.shape, (self.tiff.height, self.tiff.width))
        self.assertIsNotNone(self.tiff.bounds)

    def test_elevation_range(self) -> None:
        finite = np.isfinite(self.tiff.data)
        self.assertTrue(finite.any())
        min_val = np.nanmin(self.tiff.data)
        max_val = np.nanmax(self.tiff.data)
        self.assertLessEqual(min_val, max_val)

    def test_normalized_range(self) -> None:
        norm = self.tiff.normalized()
        finite = np.isfinite(norm)
        self.assertTrue(finite.any())
        self.assertGreaterEqual(np.nanmin(norm), 0.0)
        self.assertLessEqual(np.nanmax(norm), 1.0)

    @unittest.skipUnless(HAS_PANDAS, "pandas not installed")
    def test_to_dataframe_grid(self) -> None:
        df = self.tiff.to_dataframe()
        # Required columns
        for col in [
            "cell_id", "cell_row", "cell_col", "cell_size_m", "requested_cell_size_m", 
            "centroid_lat", "centroid_lon", "pixel_count",
            "elev_mean_m", "elev_min_m", "elev_max_m", "elev_range_m", "elev_std_m",
            "slope_mean_deg", "slope_std_deg", "slope_max_deg",
            "aspect_mean_deg", "aspect_northness", "aspect_eastness"
        ]:
            self.assertIn(col, df.columns)
        self.assertGreater(len(df), 0)
        # Verify cell_size_m >= requested_cell_size_m (effective is always >= requested)
        self.assertTrue((df["cell_size_m"] >= df["requested_cell_size_m"] * 0.99).all())  # 0.99 for float tolerance


if __name__ == "__main__":
    unittest.main()
