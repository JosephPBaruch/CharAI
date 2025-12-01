"""
Standalone script to generate a DEM raster without Django.

Dependencies:
pip install bmi-topography rasterio scipy numpy

Tests:
# 1. Small test (1km x 1km) - Portland, OR area
python generator.py --lat 45.5 --lon -122.5 --width 1000 --height 1000 --output test_1km.tif

# 2. Minimum size (10m x 10m)
python generator.py --lat 45.5 --lon -122.5 --width 10 --height 10 --output test_min.tif

# 3. Medium farm (500m x 500m)
python generator.py --lat 45.5 --lon -122.5 --width 500 --height 500 --output test_500m.tif

# 4. Large farm (3km x 2km)
python generator.py --lat 45.5 --lon -122.5 --width 3000 --height 2000 --output test_farm.tif

# 5. Mountainous area - Colorado Rockies
python generator.py --lat 39.9 --lon -105.3 --width 2000 --height 2000 --output rockies.tif

# 6. Higher resolution dataset (30m instead of 90m)
python generator.py --lat 45.5 --lon -122.5 --width 1000 --height 1000 --dem-type SRTMGL1 --output highres.tif

# 7. Palouse area
python generator.py --lat 46.7258679056 --lon -117.0708102133 --width 2528 --height 1340 --output palouse_test.tif

"""

import argparse
from bmi_topography import Topography
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from datetime import datetime
import os
from scipy.ndimage import zoom

# Pixel resolution in meters
PIXEL_RESOLUTION = 5.0


def generate_dem(lat, lon, width, height, dem_type, output_file):

    # Calculate number of pixels
    n_pixels_x = int(np.ceil(width / PIXEL_RESOLUTION))
    n_pixels_y = int(np.ceil(height / PIXEL_RESOLUTION))

    print(f"Generating DEM raster:")
    print(f"  Center: ({lat}, {lon})")
    print(f"  Dimensions: {width}m x {height}m")
    print(f"  Pixel resolution: {PIXEL_RESOLUTION}m")
    print(f"  Grid size: {n_pixels_x} x {n_pixels_y} pixels")
    print(f"  DEM type: {dem_type}")

    # Convert meters → degrees
    lat_per_meter = 1.0 / 111320.0
    lon_per_meter = 1.0 / (111320.0 * np.cos(np.radians(lat)))

    half_height_deg = (height / 2.0) * lat_per_meter
    half_width_deg = (width / 2.0) * lon_per_meter

    south = lat - half_height_deg
    north = lat + half_height_deg
    west = lon - half_width_deg
    east = lon + half_width_deg

    print(f"  Bounding box: ({south}, {west}) to ({north}, {east})")

    # Create cache directory
    cache_dir = './dem_cache'
    os.makedirs(cache_dir, exist_ok=True)

    # Initialize Topography with all required parameters
    print("Fetching elevation data...")
    topo = Topography(
        dem_type=dem_type,
        south=south,
        north=north,
        west=west,
        east=east,
        output_format='GTiff',
        cache_dir=cache_dir
    )
    
    # Fetch the data
    topo.fetch()
    
    # Load into xarray DataArray
    topo.load()
    
    # Get elevation data from the DataArray
    elev = topo.da.values
    
    # Handle band dimension if present
    if elev.ndim == 3:
        elev = elev[0]  # Get first band
    
    # Flip so north is at top (xarray typically has correct orientation)
    # Check if we need to flip by comparing coordinates
    if topo.da.y[0] < topo.da.y[-1]:
        elev = np.flipud(elev)

    print(f"  Original data shape: {elev.shape}")

    # Resample to desired resolution
    zoom_y = n_pixels_y / elev.shape[0]
    zoom_x = n_pixels_x / elev.shape[1]
    
    if zoom_y != 1.0 or zoom_x != 1.0:
        print(f"  Resampling to {n_pixels_y}x{n_pixels_x}...")
        elev = zoom(elev, (zoom_y, zoom_x), order=1)

    # Create output file
    if output_file is None:
        output_file = f"dem_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tif"

    print(f"Writing to {output_file}...")

    transform = from_bounds(west, south, east, north, n_pixels_x, n_pixels_y)

    with rasterio.open(
        output_file,
        "w",
        driver="GTiff",
        height=n_pixels_y,
        width=n_pixels_x,
        count=1,
        dtype=elev.dtype,
        crs="EPSG:4326",
        transform=transform,
        nodata=-9999,
    ) as dst:
        dst.write(elev, 1)

    # Get statistics (filter out nodata values)
    valid_elev = elev[(elev != -9999) & (elev != 0) & ~np.isnan(elev)]
    if len(valid_elev) > 0:
        print(f"\nStatistics:")
        print(f"  Min elevation: {valid_elev.min():.2f}m")
        print(f"  Max elevation: {valid_elev.max():.2f}m")
        print(f"  Mean elevation: {valid_elev.mean():.2f}m")
        print(f"  Total relief: {valid_elev.max() - valid_elev.min():.2f}m")
    else:
        print("\nWarning: No valid elevation data found")

    print("Done!")


# Entry point
if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--lat", type=float, required=True, help="Center latitude")
    parser.add_argument("--lon", type=float, required=True, help="Center longitude")
    parser.add_argument("--width", type=float, required=True, help="Width in meters")
    parser.add_argument("--height", type=float, required=True, help="Height in meters")
    parser.add_argument("--dem-type", type=str, default="SRTMGL3", help="DEM dataset type")
    parser.add_argument("--output", type=str, default=None, help="Output file path")

    args = parser.parse_args()

    generate_dem(
        args.lat, args.lon, args.width, args.height, args.dem_type, args.output
    )