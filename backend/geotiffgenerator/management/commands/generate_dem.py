"""
Django management command for DEM generation.

Location: your_app/management/commands/generate_dem.py

Usage examples:
# Single point (uses width/height)
python manage.py generate_dem --coords 45.5,-122.5 --width 1000 --height 1000 --output test.tif

# Two points (creates rectangle)
python manage.py generate_dem --coords 45.5,-122.5 45.6,-122.4 --output test.tif

# Multiple points (creates polygon)
python manage.py generate_dem --coords 45.5,-122.5 45.6,-122.5 45.6,-122.4 45.5,-122.4 --output test.tif

# Palouse area
python manage.py generate_dem --coords 46.7258679056,-117.0708102133 --width 2528 --height 1340 --output palouse.tif
"""

from django.core.management.base import BaseCommand, CommandError
from bmi_topography import Topography
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from datetime import datetime
import os
from scipy.ndimage import zoom
from shapely.geometry import Point, Polygon, box
from shapely.ops import unary_union


class Command(BaseCommand):
    help = 'Generate DEM raster from coordinates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--coords',
            nargs='+',
            required=True,
            help='Coordinates as "lat,lon" pairs (space-separated)'
        )
        parser.add_argument(
            '--width',
            type=float,
            default=None,
            help='Width in meters (for single point)'
        )
        parser.add_argument(
            '--height',
            type=float,
            default=None,
            help='Height in meters (for single point)'
        )
        parser.add_argument(
            '--dem-type',
            type=str,
            default='SRTMGL3',
            help='DEM dataset type (SRTMGL3 or SRTMGL1)'
        )
        parser.add_argument(
            '--output',
            type=str,
            required=True,
            help='Output GeoTIFF file path'
        )
        parser.add_argument(
            '--resolution',
            type=float,
            default=5.0,
            help='Pixel resolution in meters (default: 5.0)'
        )

    def handle(self, *args, **options):
        coords = self.parse_coordinates(options['coords'])
        dem_type = options['dem_type']
        output_file = options['output']
        resolution = options['resolution']

        self.stdout.write(f"Parsed {len(coords)} coordinate(s)")

        # Determine bounding box based on number of coordinates
        if len(coords) == 1:
            # Single point - requires width/height
            if not options['width'] or not options['height']:
                raise CommandError("Width and height required for single coordinate")
            
            bounds = self.calculate_bounds_from_point(
                coords[0], 
                options['width'], 
                options['height']
            )
        elif len(coords) == 2:
            # Two points - create rectangle
            bounds = self.calculate_bounds_from_two_points(coords[0], coords[1])
        else:
            # Multiple points - create polygon
            bounds = self.calculate_bounds_from_polygon(coords)

        south, west, north, east = bounds

        # Calculate dimensions
        width_m = self.calculate_distance(south, west, south, east)
        height_m = self.calculate_distance(south, west, north, west)

        # Calculate grid size
        n_pixels_x = int(np.ceil(width_m / resolution))
        n_pixels_y = int(np.ceil(height_m / resolution))

        self.stdout.write(self.style.SUCCESS(f"\nGenerating DEM raster:"))
        self.stdout.write(f"  Bounding box: ({south:.6f}, {west:.6f}) to ({north:.6f}, {east:.6f})")
        self.stdout.write(f"  Dimensions: {width_m:.1f}m x {height_m:.1f}m")
        self.stdout.write(f"  Pixel resolution: {resolution}m")
        self.stdout.write(f"  Grid size: {n_pixels_x} x {n_pixels_y} pixels")
        self.stdout.write(f"  DEM type: {dem_type}")

        # Generate the DEM
        self.generate_dem(
            south, north, west, east,
            n_pixels_x, n_pixels_y,
            dem_type, output_file
        )

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully created {output_file}"))

    def parse_coordinates(self, coord_strings):
        """Parse coordinate strings into (lat, lon) tuples"""
        coords = []
        for coord_str in coord_strings:
            try:
                parts = coord_str.split(',')
                if len(parts) != 2:
                    raise ValueError(f"Invalid coordinate format: {coord_str}")
                lat, lon = float(parts[0]), float(parts[1])
                coords.append((lat, lon))
            except ValueError as e:
                raise CommandError(f"Error parsing coordinate '{coord_str}': {e}")
        return coords

    def calculate_bounds_from_point(self, coord, width, height):
        """Calculate bounds from center point and dimensions"""
        lat, lon = coord
        
        lat_per_meter = 1.0 / 111320.0
        lon_per_meter = 1.0 / (111320.0 * np.cos(np.radians(lat)))

        half_height_deg = (height / 2.0) * lat_per_meter
        half_width_deg = (width / 2.0) * lon_per_meter

        south = lat - half_height_deg
        north = lat + half_height_deg
        west = lon - half_width_deg
        east = lon + half_width_deg

        return (south, west, north, east)

    def calculate_bounds_from_two_points(self, coord1, coord2):
        """Calculate bounds from two corner points"""
        lats = [coord1[0], coord2[0]]
        lons = [coord1[1], coord2[1]]
        
        south = min(lats)
        north = max(lats)
        west = min(lons)
        east = max(lons)
        
        return (south, west, north, east)

    def calculate_bounds_from_polygon(self, coords):
        """Calculate bounds from polygon vertices"""
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        
        south = min(lats)
        north = max(lats)
        west = min(lons)
        east = max(lons)
        
        return (south, west, north, east)

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance in meters between two points"""
        # Simple approximation
        lat_per_meter = 1.0 / 111320.0
        lon_per_meter = 1.0 / (111320.0 * np.cos(np.radians((lat1 + lat2) / 2)))
        
        dlat = abs(lat2 - lat1)
        dlon = abs(lon2 - lon1)
        
        dist_lat = dlat / lat_per_meter
        dist_lon = dlon / lon_per_meter
        
        return np.sqrt(dist_lat**2 + dist_lon**2)

    def generate_dem(self, south, north, west, east, n_pixels_x, n_pixels_y, dem_type, output_file):
        """Generate DEM raster"""
        
        # Create cache directory
        cache_dir = './dem_cache'
        os.makedirs(cache_dir, exist_ok=True)

        # Initialize Topography
        self.stdout.write("Fetching elevation data...")
        topo = Topography(
            dem_type=dem_type,
            south=south,
            north=north,
            west=west,
            east=east,
            output_format='GTiff',
            cache_dir=cache_dir
        )
        
        # Fetch and load data
        topo.fetch()
        topo.load()
        
        # Get elevation data
        elev = topo.da.values
        
        # Handle band dimension if present
        if elev.ndim == 3:
            elev = elev[0]
        
        # Flip if necessary
        if topo.da.y[0] < topo.da.y[-1]:
            elev = np.flipud(elev)

        self.stdout.write(f"  Original data shape: {elev.shape}")

        # Resample to desired resolution
        zoom_y = n_pixels_y / elev.shape[0]
        zoom_x = n_pixels_x / elev.shape[1]
        
        if zoom_y != 1.0 or zoom_x != 1.0:
            self.stdout.write(f"  Resampling to {n_pixels_y}x{n_pixels_x}...")
            elev = zoom(elev, (zoom_y, zoom_x), order=1)

        # Write output
        self.stdout.write(f"Writing to {output_file}...")

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

        # Statistics
        valid_elev = elev[(elev != -9999) & (elev != 0) & ~np.isnan(elev)]
        if len(valid_elev) > 0:
            self.stdout.write(self.style.SUCCESS("\nStatistics:"))
            self.stdout.write(f"  Min elevation: {valid_elev.min():.2f}m")
            self.stdout.write(f"  Max elevation: {valid_elev.max():.2f}m")
            self.stdout.write(f"  Mean elevation: {valid_elev.mean():.2f}m")
            self.stdout.write(f"  Total relief: {valid_elev.max() - valid_elev.min():.2f}m")
        else:
            self.stdout.write(self.style.WARNING("\nWarning: No valid elevation data found"))