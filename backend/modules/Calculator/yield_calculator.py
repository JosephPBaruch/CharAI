"""
Yield Calculator

Location: backend/core/yield_calculator.py

This calculates crop yield predictions for grid cells based on terrain
and soil characteristics, with and without biochar application.

Usage:
    from yieldcalculator.services.yield_calculator import YieldCalculator
    
    calculator = YieldCalculator()
    result_df = calculator.calculate(grid_df, use_biochar=True)
"""

import numpy as np
import logging
import os
from pathlib import Path


class YieldCalculator:
    """Service for calculating crop yield predictions based on terrain and biochar"""

    MODEL_LOCATION_ENV_VAR = "MODEL_LOCATION"
    MODEL_FEATURE_COLUMNS = [
        "elev_mean_m",
        "slope_mean_deg",
        "aspect_eastness",
        "aspect_northness",
    ]
    
    # Base yield parameters (yield (idk what unit) per acre equivalent per grid cell)
    BASE_YIELD = 50.0
    
    # THESE ARE DUMMY VALUES FOR TESTING, REAL VALUES COME AFTER BIOCHAR RESEARCH IS DONE
    # how yield is calculated is also a dummy formula

    # Biochar impact factors
    BIOCHAR_BASE_BOOST = 1.15
    BIOCHAR_ELEVATION_FACTOR = 0.002
    BIOCHAR_EAST_FACING_BONUS = 0.10
    
    # Terrain factors (without biochar)
    ELEVATION_OPTIMAL = 800.0
    ELEVATION_TOLERANCE = 20.0 
    SLOPE_PENALTY_FACTOR = 0.015 
    EAST_FACING_BONUS = 0.05 
    
    def __init__(self, logger: logging.Logger | None = None, fetch_model: bool = True):
        """Initialize Yield Calculator """
        self.logger = logger or logging.getLogger("charai")
        self.logger.info("YieldCalculator initialized")
        self.model = None

        if fetch_model:
            self.model = self._load_model_from_env()
            
    
    def remove_and_return_unneeded_columns(self, grid_df):
        columns_to_remove = [
            "cell_id",
            "cell_row",
            "cell_col",
            "cell_size_m",
            "requested_cell_size_m",
            "pixel_count",
        ]

        existing_columns = [col for col in columns_to_remove if col in grid_df.columns]
        unneeded = grid_df.loc[:, existing_columns].copy()
        grid_df.drop(columns=existing_columns, inplace=True)

        return unneeded
    
    
    def calculate(self, grid_df):
        """
        Calculate yield predictions for each grid cell
        
        Args:
            grid_df (pd.DataFrame): Grid dataframe with terrain characteristics
                Required columns: elev_mean_m, slope_mean_deg, aspect_eastness, aspect_northness
            
        Returns:
            pd.DataFrame: Input dataframe with added yield columns:
                - yield_without_biochar: Predicted yield without biochar
                - yield_with_biochar: Predicted yield with biochar (if use_biochar=True)
        
        Raises:
            ValueError: If required columns are missing
        """
        try:
            # Validate required columns
            
            removed_columns = self.remove_and_return_unneeded_columns(grid_df)
            
            required_cols = self.MODEL_FEATURE_COLUMNS
            missing_cols = [col for col in required_cols if col not in grid_df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            self.logger.debug(f"Calculating yield for {len(grid_df)} grid cells")
            
            # Create a copy to avoid modifying original
            result_df = grid_df.copy()
            
            # Calculate yield without biochar
            yield_without_biochar = self._calculate_base_yield(result_df)
            
            # Calculate yield with biochar
            yield_with_biochar= self._calculate_biochar_yield(result_df)
            
            result_df['yield_without_biochar'] = yield_without_biochar
            
            # Calculate yield with biochar
            result_df['yield_with_biochar'] = yield_with_biochar
            
            # Calculate improvement percentage
            result_df['biochar_improvement_pct'] = (
                (result_df['yield_with_biochar'] - result_df['yield_without_biochar']) / 
                result_df['yield_without_biochar'] * 100
            ).abs()
            
            # Log summary statistics
            self._log_statistics(result_df)
            
            return removed_columns.join(result_df)
            
        except Exception as e:
            self.logger.error(f"Yield calculation failed: {str(e)}")
            raise
    
    def _calculate_base_yield(self, df):        
        return self._calculate(df)
    
    def _calculate_biochar_yield(self, df):
        biochar_df = df.copy()

        # Simulate impact of biochar in feature-space before prediction.
        # Directions informed by sensitivity analysis on the trained model:
        #   elev_mean_m:     +0.47/unit  -> slight increase
        #   slope_mean_deg:  +0.22/unit  -> slight increase
        #   aspect_eastness: -0.24/unit  -> slight decrease
        #   aspect_northness:-0.03/unit  -> slight decrease
        biochar_df["elev_mean_m"] = biochar_df["elev_mean_m"] * 1.005
        biochar_df["slope_mean_deg"] = (biochar_df["slope_mean_deg"] * 1.10).clip(lower=0)
        biochar_df["aspect_eastness"] = (biochar_df["aspect_eastness"] - 0.10).clip(-1, 1)
        biochar_df["aspect_northness"] = (biochar_df["aspect_northness"] - 0.05).clip(-1, 1)

        return self._calculate(biochar_df)
    
    def _calculate(self, df):
        if self.model is None:
            raise ValueError(
                f"Model not loaded. Set {self.MODEL_LOCATION_ENV_VAR} to a valid model path and initialize with fetch_model=True."
            )

        features = df.loc[:, self.MODEL_FEATURE_COLUMNS].to_numpy(dtype=np.float32)
        expected_dim = self.model.input_shape[-1]
        if expected_dim is not None and features.shape[1] != expected_dim:
            raise ValueError(
                f"Model input mismatch: model expects {expected_dim} features, got {features.shape[1]}"
            )

        predictions = self.model.predict(features, verbose=0)
        return predictions.flatten()

    def _load_model_from_env(self):
        model_location = os.getenv(self.MODEL_LOCATION_ENV_VAR)
        if not model_location:
            self.logger.warning(
                "%s is not set. Yield predictions cannot run without a loaded model.",
                self.MODEL_LOCATION_ENV_VAR,
            )
            return None

        model_path = Path(model_location).expanduser()
        if not model_path.is_absolute():
            model_path = (Path.cwd() / model_path).resolve()

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file from {self.MODEL_LOCATION_ENV_VAR} not found: {model_path}"
            )

        # Import lazily so this module can still be imported in environments
        # that do not need model-backed predictions.
        from tensorflow.keras.models import load_model

        self.logger.info("Loading yield model from %s", model_path)
        return load_model(model_path)
    
    def _log_statistics(self, df):
        """
        Log summary statistics for yield calculations for testing
        
        Args:
            df (pd.DataFrame): Result dataframe with yield columns
            use_biochar (bool): Whether biochar yields were calculated
        """
        self.logger.debug(f"Yield Calculation: Total grid cells: {len(df)}")
        self.logger.debug(f"Yield WITHOUT biochar:  Mean: {df['yield_without_biochar'].mean():.2f}")
        self.logger.debug(f"Yield WITH biochar:  Mean: {df['yield_with_biochar'].mean():.2f}")
        self.logger.debug(f"Biochar improvement:  Mean improvement: {df['biochar_improvement_pct'].mean():.2f}%")
        