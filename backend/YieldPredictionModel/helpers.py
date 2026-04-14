from pathlib import Path
import pandas as pd
import numpy as np
import keras 

def save_to_csv(path: str, df: pd.DataFrame):
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
  
def encode(df):
    """Encode the Crop column to integers using the fixed mapping from YieldCalculator."""
    from modules.Calculator import YieldCalculator

    crop_values = df["Crop"]

    # Handle duplicate "Crop" columns by using the first one.
    if isinstance(crop_values, pd.DataFrame):
        crop_values = crop_values.iloc[:, 0]

    df["Crop"] = crop_values.astype(str).map(YieldCalculator.CROP_ENCODING)
    
def Create_Model(input_dim):
    model = keras.models.Sequential()

    # Input layer
    model.add(keras.layers.Input(shape=(input_dim,)))

    # Normalize features so the network sees approximately zero-mean,
    # unit-variance inputs regardless of original scale (e.g. elevation
    # ~750-800 vs aspect ~-1..1).  The learned statistics are stored in
    # the .keras file so inference applies the same normalization.
    model.add(keras.layers.BatchNormalization())

    # Hidden layers
    model.add(keras.layers.Dense(
        units=128,
        activation='relu',
        kernel_initializer='he_normal'
    ))
    model.add(keras.layers.Dense(
        units=64,
        activation='relu',
        kernel_initializer='he_normal'
    ))
    model.add(keras.layers.Dense(
        units=32,
        activation='relu',
        kernel_initializer='he_normal'
    ))

    # Output layer for regression (one continuous value)
    model.add(keras.layers.Dense(
        units=1,
        activation='linear',
        kernel_initializer='glorot_uniform'
    ))

    # Compile for regression
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='mse',
        metrics=['mae']
    )

    return model