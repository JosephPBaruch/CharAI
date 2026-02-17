"""
Test script for Yield Calculator

Location: test_calculator.py

Run with: python test_calculator.py
"""

import sys
import traceback
import pandas as pd
import numpy as np

try:
    from yield_calculator import YieldCalculator
    
    print("=" * 70)
    print("YIELD CALCULATOR TEST")
    print("=" * 70)
    
    # This is a 10x10 grid of 5m x 5m cells
    
    np.random.seed(42)  # For reproducibility
    
    # Generate grid coordinates
    rows = 10
    cols = 10
    
    data = []
    # just random values for testing
    for row in range(rows):
        for col in range(cols):
            cell_id = f"{row}_{col}"
            

            base_elevation = 785
            elevation_variation = (row * 3) + (col * 2) + np.random.normal(0, 5)
            elev_mean = base_elevation + elevation_variation
            
            slope_mean = np.random.uniform(0, 12)
        
            aspect_angle = np.random.uniform(0, 360)
            aspect_northness = np.cos(np.radians(aspect_angle))
            aspect_eastness = np.sin(np.radians(aspect_angle))
            
            centroid_lat = 46.730 + (row * 0.00005)
            centroid_lon = -117.087 + (col * 0.00013)
            
            data.append({
                'cell_id': cell_id,
                'cell_row': row,
                'cell_col': col,
                'cell_size_m': 9.997974,
                'requested_cell_size_m': 5.0,
                'centroid_lat': centroid_lat,
                'centroid_lon': centroid_lon,
                'pixel_count': 4,
                'elev_mean_m': elev_mean,
                'elev_min_m': elev_mean - 1,
                'elev_max_m': elev_mean + 1,
                'elev_range_m': 2.0,
                'elev_std_m': 0.5,
                'slope_mean_deg': slope_mean,
                'slope_std_deg': slope_mean * 0.3,
                'slope_max_deg': slope_mean * 1.5,
                'aspect_mean_deg': aspect_angle,
                'aspect_northness': aspect_northness,
                'aspect_eastness': aspect_eastness
            })
    
    # Create DataFrame
    grid_df = pd.DataFrame(data)
    
    print(f"\nCreated test grid: {rows}x{cols} = {len(grid_df)} cells")
    print(f"\nSample data (first 5 rows):")
    print(grid_df[['cell_id', 'elev_mean_m', 'slope_mean_deg', 'aspect_eastness', 'aspect_northness']].head())
    
    print("\n" + "=" * 70)
    print("TEST 1: Calculate WITHOUT biochar")
    print("=" * 70)
    
    calculator = YieldCalculator()
    result_no_biochar = calculator.calculate(grid_df, use_biochar=False)
    
    print("\nResult columns:", result_no_biochar.columns.tolist())
    print("\nYield results (first 5 rows):")
    print(result_no_biochar[['cell_id', 'elev_mean_m', 'slope_mean_deg', 'yield_without_biochar']].head())
    
    print("\n" + "=" * 70)
    print("TEST 2: Calculate WITH biochar")
    print("=" * 70)
    
    result_with_biochar = calculator.calculate(grid_df, use_biochar=True)
    
    print("\nResult columns:", result_with_biochar.columns.tolist())
    print("\nYield comparison (first 20 rows):")
    print(result_with_biochar[['cell_id', 'elev_mean_m', 'slope_mean_deg', 
                                 'yield_without_biochar', 'yield_with_biochar', 
                                 'biochar_improvement_pct']].head(20))
    
    print("\n" + "=" * 70)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    
except Exception as e:
    print(f"\nERROR: {type(e).__name__}: {str(e)}", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)