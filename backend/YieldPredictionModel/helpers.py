from pathlib import Path
import pandas as pd
import numpy as np
import keras 
from sklearn.preprocessing import LabelEncoder

def save_to_csv(path: str, df: pd.DataFrame):
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
  
def encode(df):
    le = LabelEncoder()
    crop_values = df["Crop"]

    # Handle duplicate "Crop" columns by using the first one.
    if isinstance(crop_values, pd.DataFrame):
        crop_values = crop_values.iloc[:, 0]

    df["Crop"] = le.fit_transform(crop_values.astype(str))
    
def Create_Model(input_dim):
    model = keras.models.Sequential()

    # Input layer
    model.add(keras.layers.Input(shape=(input_dim,)))

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
    # Optional regularization (uncomment if you see overfitting)
    # model.add(keras.layers.Dropout(0.2))

    # Output layer for regression (one continuous value)
    model.add(keras.layers.Dense(
        units=1,
        activation='linear',          # << no activation = regression
        kernel_initializer='glorot_uniform'
    ))

    # Compile for regression
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='mse',                   # mean squared error
        metrics=['mae']               # mean absolute error
    )

    return model