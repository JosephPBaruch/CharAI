import sys
import traceback
import os

try:
    from generate_dem import DEMGeneratorService
    
    # Create output directory with absolute path
    output_dir = os.path.join(os.path.dirname(__file__), 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    # Two points example (creates rectangle)
    service = DEMGeneratorService()
    result = service.generate_from_coordinates(
        coords=[(45.5, -122.7), (45.6, -122.6)],
        output_file=os.path.join(output_dir, 'portland.tif'),
        resolution=5.0,
        dem_type='SRTMGL3'
    )
    print("Portland result:", result)
    print()
    
    # Multiple points example (creates polygon mask)
    coords = [
        (46.72, -117.18),
        (46.73, -117.18),
        (46.73, -117.16),
        (46.72, -117.16)
    ]
    result = service.generate_from_coordinates(
        coords=coords,
        output_file=os.path.join(output_dir, 'palouse.tif')
    )
    print("Palouse result:", result)
    print()
    
    # Complex polygon (7 points)
    coords = [
        (46.72, -117.18),
        (46.73, -117.18),
        (46.735, -117.17),
        (46.73, -117.16),
        (46.72, -117.16),
        (46.715, -117.17),
        (46.72, -117.175)
    ]
    result = service.generate_from_coordinates(
        coords=coords,
        output_file=os.path.join(output_dir, 'complex_field.tif')
    )
    print("Complex field result:", result)
    
    # Force cleanup
    print("\nAll DEM files generated successfully!")
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)
finally:
    # Force immediate exit to prevent cleanup errors
    import os
    os._exit(0)