# -*- coding: utf-8 -*-
import sys
import os
import pandas as pd
import django
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.metrics import r2_score, mean_squared_error
import logging
from scipy.spatial.distance import cdist
import numpy as np
from pathlib import Path

# ---------- PREP ----------

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from modules.Calculator import YieldCalculator
from helpers import Create_Model, encode, save_to_csv
from core.services import create_charai_data

# Minimum R-squared the trained model must achieve on the held-out test set.
# If the model scores below this value, the script exits with a non-zero code
# so that Docker builds and CI pipelines fail early with a clear error.
# Adjust this threshold as training data or model architecture improves.
MIN_R2_THRESHOLD = 0.2

harvest_file_name_total = "./Data/CookHandHarvest_HY1999-HY2016_P3A3_20241029(in).csv"
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

# ---------- Cook Harvest Prep ----------
logger.info("Loading harvest data")
harvest = pd.read_csv(harvest_file_name_total)
logger.info("Raw harvest rows: %d, columns: %d", *harvest.shape)

# Drop columns where more than 1000 values are missing -- these columns
# are too sparse to be useful for training.
harvest = harvest.loc[:, harvest.isna().sum() <= 1000]

# Drop unnecessary "SampleID" column
harvest.drop(columns=["SampleID"], inplace=True)

# Drop rows with any remaining missing values (Crop, GrainYieldAirDry, etc.)
harvest = harvest.dropna()

# Drop metadata columns not used for training
harvest.drop(columns=["QCCoverage", "QCFlags", "CropExists", "ID2", "HarvestYear"], inplace=True)

# Remove rows where the crop failed or was not harvested (zero yield).
# These represent planting failures, not valid yield observations, and
# would bias the model toward predicting lower yields.
zero_yield_count = (harvest["GrainYieldAirDry"] <= 0).sum()
if zero_yield_count > 0:
    logger.info("Removing %d rows with zero/negative yield (failed crops)", zero_yield_count)
    harvest = harvest[harvest["GrainYieldAirDry"] > 0]

logger.info("Cleaned harvest rows: %d", len(harvest))

# ---------- Get CharAI Generated Data ----------

charai = create_charai_data(logger, cook_farm_coords, tiff_file_path)

save_to_csv(path="./Data/charai.csv", df=charai)

# ---------- Join Cook Harvest and CharAI Data ---------- 

harvest_coords = harvest[['Latitude', 'Longitude']].values
charai_coords = charai[['centroid_lat', 'centroid_lon']].values

# Calculate all pairwise distances
distances = cdist(harvest_coords, charai_coords, metric='euclidean')

# Find the index of the closest charai point for each harvest point
closest_charai_indices = np.argmin(distances, axis=1)

# Select the corresponding charai rows
# Using .iloc to select rows by integer index
closest_charai_data = charai.iloc[closest_charai_indices]

# Reset index of harvest to ensure clean concatenation
harvest_reset = harvest.reset_index(drop=True)

# Select relevant columns from closest_charai_data to merge.
# Keep harvest's Crop column as the single source of truth.
charai_cols_to_merge = [
    col
    for col in charai.columns
    if col not in ["FieldName", "Latitude", "Longitude", "Crop"]
]
charai_attributes_to_add = closest_charai_data[charai_cols_to_merge].reset_index(drop=True)

# Concatenate the harvest DataFrame with the selected charai attributes
harvest = pd.concat([harvest_reset, charai_attributes_to_add], axis=1)

harvest.drop(columns=["Longitude", "Latitude"], inplace=True)

#  ---------- Create Model ----------

# Remove the same columns when using model
calculator = YieldCalculator(logger=logger, fetch_model=False)
removed_columns = calculator.remove_and_return_unneeded_columns(harvest)

# ---------- prepare and split data ----------

encode(harvest)

target_column = "GrainYieldAirDry"

# Train with the same features used by YieldCalculator.calculate().
X = harvest.loc[:, YieldCalculator.MODEL_FEATURE_COLUMNS].copy()
y = harvest[target_column]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create model with correct input dimension
input_dim = X_train.shape[1]
model = Create_Model(input_dim)

# Early stopping (you already imported EarlyStopping)
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)

# Train
history = model.fit(
    X_train, y_train,
    validation_split=0.2,   # use part of training data for validation
    epochs=200,
    batch_size=32,
    callbacks=[early_stop],
    verbose=0                # change to 1 to see progress
)

# Evaluate on test set
test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)

# Predictions for extra metrics
y_pred = model.predict(X_test).flatten()

mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

# ---------- Accuracy Report ----------
logger.info("--- Model Accuracy Report ---")
logger.info("  Test Loss (MSE) : %.4f", test_loss)
logger.info("  Test MAE        : %.4f", test_mae)
logger.info("  RMSE            : %.4f", rmse)
logger.info("  R-squared (R2)  : %.4f", r2)
logger.info("  Min R2 Threshold: %.4f", MIN_R2_THRESHOLD)
logger.info("  Training rows   : %d", len(X_train))
logger.info("  Test rows       : %d", len(X_test))
logger.info("  Features        : %s", ", ".join(YieldCalculator.MODEL_FEATURE_COLUMNS))
logger.info("--- End Accuracy Report ---")

# ---------- Accuracy Gate ----------
if r2 < MIN_R2_THRESHOLD:
    logger.error(
        "ACCURACY CHECK FAILED: R2=%.4f is below the minimum threshold of %.4f. "
        "The model does not meet the required accuracy for deployment. "
        "Review training data, feature engineering, or model architecture. "
        "To adjust the threshold, update MIN_R2_THRESHOLD in this script.",
        r2,
        MIN_R2_THRESHOLD,
    )
    sys.exit(1)

logger.info("Accuracy check passed (R2=%.4f >= %.4f)", r2, MIN_R2_THRESHOLD)

Path("./Models").mkdir(parents=True, exist_ok=True)
model.save("./Models/yield_model.keras")
logger.info("Model saved to ./Models/yield_model.keras")

