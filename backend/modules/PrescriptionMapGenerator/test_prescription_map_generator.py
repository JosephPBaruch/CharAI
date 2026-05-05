import logging
import unittest

import pandas as pd

from modules.PrescriptionMapGenerator import PrescriptionMapGenerator


class PrescriptionMapGeneratorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.generator = PrescriptionMapGenerator(logging.getLogger("charai"))

    def test_compute_payback_period_grid_maps_high_elevation_to_fast_roi(self) -> None:
        df = pd.DataFrame(
            {
                "cell_id": [1, 2, 3, 4, 5],
                "centroid_lat": [46.7] * 5,
                "centroid_lon": [-117.0, -116.9, -116.8, -116.7, -116.6],
                "elev_mean_m": [100.0, 125.0, 150.0, 175.0, 200.0],
            }
        )

        result = self.generator.compute_payback_period_grid(
            yield_prediction_df=df,
            crop_sales_price=7.25,
            biochar_cost_per_cell=3.5,
        )

        payback_periods = result["payback_period"].tolist()

        self.assertEqual(payback_periods[0], 10.0)
        self.assertEqual(payback_periods[-1], 1.0)
        self.assertTrue(all(1.0 <= value <= 10.0 for value in payback_periods))
        self.assertTrue(all(left > right for left, right in zip(payback_periods, payback_periods[1:])))

    def test_compute_payback_period_grid_uses_midpoint_for_flat_elevation(self) -> None:
        df = pd.DataFrame(
            {
                "cell_id": [1, 2],
                "centroid_lat": [46.7, 46.7],
                "centroid_lon": [-117.0, -116.9],
                "elev_mean_m": [150.0, 150.0],
            }
        )

        result = self.generator.compute_payback_period_grid(
            yield_prediction_df=df,
            crop_sales_price=7.25,
            biochar_cost_per_cell=3.5,
        )

        self.assertEqual(result["payback_period"].tolist(), [5.5, 5.5])


if __name__ == "__main__":
    unittest.main()