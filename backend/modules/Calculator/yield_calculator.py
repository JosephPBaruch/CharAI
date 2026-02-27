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


class YieldCalculator:
    """Service for calculating crop yield predictions based on terrain and biochar"""
    
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
    
    def __init__(self, logger: logging.Logger ):
        """Initialize Yield Calculator """
        self.logger = logger
        self.logger.info("YieldCalculator initialized")
    
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
            required_cols = ['elev_mean_m', 'slope_mean_deg', 'aspect_eastness', 'aspect_northness']
            missing_cols = [col for col in required_cols if col not in grid_df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            self.logger.debug(f"Calculating yield for {len(grid_df)} grid cells")
            
            # Create a copy to avoid modifying original
            result_df = grid_df.copy()
            
            # Calculate yield without biochar
            result_df['yield_without_biochar'] = self._calculate_base_yield(result_df)
            
            # Calculate yield with biochar
            result_df['yield_with_biochar'] = self._calculate_biochar_yield(result_df)
            
            # Calculate improvement percentage
            result_df['biochar_improvement_pct'] = (
                (result_df['yield_with_biochar'] - result_df['yield_without_biochar']) / 
                result_df['yield_without_biochar'] * 100
            )
            
            # Log summary statistics
            self._log_statistics(result_df)
            
            return result_df
            
        except Exception as e:
            self.logger.error(f"Yield calculation failed: {str(e)}")
            raise
    
    def _calculate_base_yield(self, df):
        """
        Calculate base yield without biochar. DUMMY FORMULA
        
        Args:
            df (pd.DataFrame): Grid dataframe
            
        Returns:
            pd.Series: Yield predictions without biochar
        """
        # Start with base yield
        yield_values = np.full(len(df), self.BASE_YIELD)
        
        elevation_diff = np.abs(df['elev_mean_m'] - self.ELEVATION_OPTIMAL)
        elevation_factor = 1.0 - (elevation_diff / self.ELEVATION_TOLERANCE).clip(0, 1) * 0.20
        yield_values *= elevation_factor        
        slope_factor = 1.0 - (df['slope_mean_deg'] * self.SLOPE_PENALTY_FACTOR).clip(0, 0.30)
        yield_values *= slope_factor
        east_bonus = (df['aspect_eastness'].clip(0, 1) * self.EAST_FACING_BONUS)
        yield_values *= (1.0 + east_bonus)
        np.random.seed(42) 
        natural_variation = np.random.normal(1.0, 0.05, len(df))
        yield_values *= natural_variation
        
        return yield_values
    
    def _calculate_biochar_yield(self, df):
        """
        Calculate yield with biochar application. DUMMY FORMULA
        
        Args:
            df (pd.DataFrame): Grid dataframe
            
        Returns:
            pd.Series: Yield predictions with biochar
        """
        # Start with base yield
        yield_values = np.full(len(df), self.BASE_YIELD * self.BIOCHAR_BASE_BOOST)
        elevation_normalized = (df['elev_mean_m'] - df['elev_mean_m'].min()) / \
                               (df['elev_mean_m'].max() - df['elev_mean_m'].min())
        biochar_elevation_boost = 1.0 + (elevation_normalized * self.BIOCHAR_ELEVATION_FACTOR)
        yield_values *= biochar_elevation_boost
        slope_factor = 1.0 - (df['slope_mean_deg'] * self.SLOPE_PENALTY_FACTOR * 0.6)  # 40% reduction in penalty
        yield_values *= slope_factor.clip(0.70, 1.0)
        east_bonus = (df['aspect_eastness'].clip(0, 1) * self.BIOCHAR_EAST_FACING_BONUS)
        yield_values *= (1.0 + east_bonus)
        north_penalty = df['aspect_northness'].clip(0, 1) * 0.03  # Small penalty for north-facing
        yield_values *= (1.0 - north_penalty)
        np.random.seed(42)  # Same seed for comparison
        natural_variation = np.random.normal(1.0, 0.03, len(df))  # Reduced variability
        yield_values *= natural_variation
        
        return yield_values
    
    def _log_statistics(self, df):
        """
        Log summary statistics for yield calculations for testing
        
        Args:
            df (pd.DataFrame): Result dataframe with yield columns
            use_biochar (bool): Whether biochar yields were calculated
        """
        self.logger.debug("\n=== Yield Calculation Summary ===")
        self.logger.debug(f"Total grid cells: {len(df)}")
        
        # Base yield stats
        self.logger.debug("\nYield WITHOUT biochar:")
        self.logger.debug(f"  Mean: {df['yield_without_biochar'].mean():.2f}")
        
        self.logger.debug("\nYield WITH biochar:")
        self.logger.debug(f"  Mean: {df['yield_with_biochar'].mean():.2f}")
        
        self.logger.debug("\nBiochar improvement:")
        self.logger.debug(f"  Mean improvement: {df['biochar_improvement_pct'].mean():.2f}%")
        