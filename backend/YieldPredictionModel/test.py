import sys
import os
import django

from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from modules.Calculator import YieldCalculator
import logging
import pandas as pd
from helpers import encode, save_to_csv
from core.services import create_charai_data

model_path = Path("./Models/yield_model.keras")
test_data_path = Path("./Data/charai.csv")
tiff_file_path = "./Data/tiff.tif"

cook_farm_coords = [
    (46.77863200102642, -117.0936964616513),
    (46.77863200102642, -117.07662800000426),
    (46.78504435150698, -117.07662800000426),
    (46.78504435150698, -117.0936964616513),
]

logger = logging.getLogger("charai")
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(asctime)s %(name)s %(message)s",
)


def _load_or_generate_test_data() -> pd.DataFrame:
    if test_data_path.exists():
        logger.info("Loading existing test data from %s", test_data_path)
        return pd.read_csv(test_data_path)

    logger.info("Test data not found. Generating CharAI test data.")
    generated = create_charai_data(logger, cook_farm_coords, tiff_file_path, crop="WW")
    save_to_csv(str(test_data_path), generated)
    return generated


def main() -> None:
    if not model_path.exists():
        raise FileNotFoundError(
            f"Trained model not found at {model_path}. Run CreateAndTrainYieldCalculatorModel.py first."
        )

    os.environ["MODEL_LOCATION"] = str(model_path.resolve())
    test_data = _load_or_generate_test_data()
    encode(test_data)

    calculator = YieldCalculator(logger=logger, fetch_model=True)
    prediction_df = calculator.calculate(test_data.copy())

    required_output_cols = [
        "yield_without_biochar",
        "yield_with_biochar",
        "biochar_improvement_pct",
    ]
    missing_output_cols = [col for col in required_output_cols if col not in prediction_df.columns]
    if missing_output_cols:
        raise ValueError(f"Prediction output missing required columns: {missing_output_cols}")

    if prediction_df[required_output_cols].isna().any().any():
        raise ValueError("Prediction output contains NaN values.")

    results_path = "./Results/testresults.csv"
    save_to_csv(results_path, prediction_df)
    logger.info("Calculator test passed. Results written to %s", results_path)
    logger.info("Rows tested: %s", len(prediction_df))


if __name__ == "__main__":
    main()