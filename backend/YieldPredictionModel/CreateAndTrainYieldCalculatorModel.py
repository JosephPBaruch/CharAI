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
logger.info("getting harvest")
harvest = pd.read_csv(harvest_file_name_total)

# print(harvest["Crop"].unique())

# drop any columns that are more than 1000 missing values
harvest = harvest.loc[:, harvest.isna().sum() <= 1000]

# Drop unnecessary "SampleID" Column
harvest.drop(columns=["SampleID"], inplace=True)

# Drop rows with missing "Crop" or "GrainYieldAirDry" Values
harvest = harvest.dropna()
harvest.isna().sum()

# Drop columns: QCCoverage, QCFlags, CropExists
harvest.drop(columns=["QCCoverage", "QCFlags", "CropExists", "ID2", "HarvestYear"], inplace=True)

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

#drop the year column
cols_to_drop = [c for c in ["year"] if c in harvest.columns]
if cols_to_drop:
    harvest.drop(columns=cols_to_drop, inplace=True)
    logger.info(f"Dropped pre-training helper columns: {cols_to_drop}")

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

# date = date
# time = time

Path("./Models").mkdir(parents=True, exist_ok=True)
model.save("./Models/yield_model.keras")
logger.info("Model saved to ./Models/yield_model.keras")

# model.save("./Models/yield_model{date}_{time}.keras")

# ---------- Feature Sensitivity Analysis ----------
# For each feature, perturb it by a small delta and measure how predicted
# yield changes.  This tells us the direction and magnitude of each
# feature's influence, which informs the biochar feature adjustments in
# _calculate_biochar_yield.

logger.info("--- Feature Sensitivity Analysis ---")

feature_columns = YieldCalculator.MODEL_FEATURE_COLUMNS
baseline_features = X_test.to_numpy(dtype=np.float32)
baseline_preds = model.predict(baseline_features, verbose=0).flatten()

# Use 1 % of each feature's standard deviation as the perturbation step.
# For features with zero std (constant), fall back to 1 % of the mean or 0.01.
PERTURBATION_FRACTION = 0.01

for i, col in enumerate(feature_columns):
    std = X_test[col].std()
    mean = X_test[col].mean()
    delta = std * PERTURBATION_FRACTION if std > 0 else abs(mean) * PERTURBATION_FRACTION or 0.01

    perturbed = baseline_features.copy()
    perturbed[:, i] += delta

    perturbed_preds = model.predict(perturbed, verbose=0).flatten()
    mean_yield_change = (perturbed_preds - baseline_preds).mean()
    sensitivity = mean_yield_change / delta  # yield change per unit feature change

    direction = "INCREASE" if sensitivity > 0 else "DECREASE"

    logger.info(
        f"  {col:25s} | std={std:.4f} mean={mean:.4f} delta={delta:.6f} "
        f"| avg yield Δ = {mean_yield_change:+.4f} | sensitivity = {sensitivity:+.4f}/unit "
        f"| To boost yield: {direction} this feature"
    )

logger.info("--- End Sensitivity Analysis ---")

