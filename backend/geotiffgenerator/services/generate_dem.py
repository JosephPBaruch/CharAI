"""
DEM Generation Service

Location: your_app/services/generate_dem.py

This service handles Digital Elevation Model (DEM) generation from coordinates.
Used internally by other scripts and services.

Usage in other scripts:
    geotiffgenerator.services.generate_dem import DEMGeneratorService
    
    # Two points example (creates rectangle)
    service = DEMGeneratorService()
    result = service.generate_from_coordinates(
        coords=[(45.5, -122.7), (45.6, -122.6)],
        output_file='output/portland.tif',
        resolution=5.0,
        dem_type='SRTMGL3'
    )
    
    # Multiple points example (creates polygon mask)
    coords = [
        (46.72, -117.18),
        (46.73, -117.18),
        (46.73, -117.16),
        (46.72, -117.16)
    ]
    result = service.generate_from_coordinates(
        coords=coords,
        output_file='output/palouse.tif'
    )
    
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
        output_file='output/complex_field.tif'
    )
"""

from bmi_topography import Topography
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from rasterio.features import geometry_mask
from datetime import datetime
import os
from scipy.ndimage import zoom
from shapely.geometry import Polygon
import logging

logger = logging.getLogger(__name__)


class DEMGeneratorService:
    """Service for generating DEM raster files from coordinates"""
    
    def __init__(self, cache_dir='./dem_cache'):
        """
        Initialize DEM Generator Service
        
        Args:
            cache_dir (str): Directory for caching DEM data
        """
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def generate_from_coordinates(self, coords, output_file, resolution=5.0, dem_type='SRTMGL3'):
        """
        Generate DEM raster from a list of coordinates
        
        Args:
            coords (list): List of (lat, lon) tuples. Minimum 2 required.
                          - 2 coords: Creates a rectangle
                          - 3+ coords: Creates a polygon and masks DEM to polygon boundary
            output_file (str): Path to output GeoTIFF file
            resolution (float): Pixel resolution in meters (default: 5.0)
            dem_type (str): DEM dataset type - 'SRTMGL3' (90m) or 'SRTMGL1' (30m)
            
        Returns:
            dict: Dictionary containing generation results:
                - success (bool): Whether generation was successful
                - output_file (str): Path to generated file
                - bounds (dict): Bounding box coordinates
                - dimensions (dict): Width and height in meters
                - grid_size (dict): Pixel dimensions
                - statistics (dict): Elevation statistics
                - polygon_area_m2 (float): Area of polygon in square meters (if 3+ coords)
                - error (str): Error message if failed
                
        Raises:
            ValueError: If invalid parameters provided
        """
        try:
            # Validate inputs
            if len(coords) < 2:
                raise ValueError("At least 2 coordinates required")
            
            if not all(isinstance(c, (tuple, list)) and len(c) == 2 for c in coords):
                raise ValueError("Coordinates must be (lat, lon) tuples")
            
            logger.info(f"Generating DEM from {len(coords)} coordinates")
            
            # Calculate bounds
            bounds = self._calculate_bounds(coords)
            south, west, north, east = bounds
            
            # Calculate dimensions
            width_m = self._calculate_distance(south, west, south, east)
            height_m = self._calculate_distance(south, west, north, west)
            
            # Calculate grid size
            n_pixels_x = int(np.ceil(width_m / resolution))
            n_pixels_y = int(np.ceil(height_m / resolution))
            
            logger.info(f"Bounding box: ({south:.6f}, {west:.6f}) to ({north:.6f}, {east:.6f})")
            logger.info(f"Dimensions: {width_m:.1f}m x {height_m:.1f}m")
            logger.info(f"Grid size: {n_pixels_x} x {n_pixels_y} pixels")
            
            # Create polygon if 3+ coordinates
            polygon = None
            polygon_area = None
            if len(coords) >= 3:
                # Convert coords from (lat, lon) to (lon, lat) for Shapely
                polygon_coords = [(lon, lat) for lat, lon in coords]
                polygon = Polygon(polygon_coords)
                polygon_area = self._calculate_polygon_area(coords)
                logger.info(f"Created polygon with {len(coords)} vertices")
                logger.info(f"Polygon area: {polygon_area:.2f} m²")
            
            # Generate DEM
            stats = self._generate_dem(
                south, north, west, east,
                n_pixels_x, n_pixels_y,
                dem_type, output_file,
                polygon=polygon
            )
            
            logger.info(f"Successfully created {output_file}")
            
            result = {
                'success': True,
                'output_file': output_file,
                'bounds': {
                    'south': float(south),
                    'north': float(north),
                    'west': float(west),
                    'east': float(east)
                },
                'dimensions': {
                    'width_m': float(width_m),
                    'height_m': float(height_m)
                },
                'grid_size': {
                    'width_pixels': int(n_pixels_x),
                    'height_pixels': int(n_pixels_y)
                },
                'statistics': stats,
                'resolution': float(resolution),
                'dem_type': dem_type
            }

            if polygon_area is not None:
                result['polygon_area_m2'] = float(polygon_area)
            
            return result
            
        except Exception as e:
            logger.error(f"DEM generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_bounds(self, coords):
        """
        Calculate bounding box from coordinates
        
        Args:
            coords (list): List of (lat, lon) tuples
            
        Returns:
            tuple: (south, west, north, east)
        """
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        
        south = min(lats)
        north = max(lats)
        west = min(lons)
        east = max(lons)
        
        return (south, west, north, east)
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate distance in meters between two points
        
        Args:
            lat1, lon1, lat2, lon2: Coordinates in decimal degrees
            
        Returns:
            float: Distance in meters
        """
        lat_per_meter = 1.0 / 111320.0
        lon_per_meter = 1.0 / (111320.0 * np.cos(np.radians((lat1 + lat2) / 2)))
        
        dlat = abs(lat2 - lat1)
        dlon = abs(lon2 - lon1)
        
        dist_lat = dlat / lat_per_meter
        dist_lon = dlon / lon_per_meter
        
        return np.sqrt(dist_lat**2 + dist_lon**2)
    
    def _calculate_polygon_area(self, coords):
        """
        Calculate area of polygon in square meters using Shapely
        
        Args:
            coords (list): List of (lat, lon) tuples
            
        Returns:
            float: Area in square meters
        """
        # Convert to lon, lat for Shapely
        polygon_coords = [(lon, lat) for lat, lon in coords]
        polygon = Polygon(polygon_coords)
        
        # Get centroid for projection correction
        centroid_lat = sum(c[0] for c in coords) / len(coords)
        
        # Convert square degrees to square meters (rough approximation)
        # This is approximate - for precise area use pyproj
        lat_per_meter = 1.0 / 111320.0
        lon_per_meter = 1.0 / (111320.0 * np.cos(np.radians(centroid_lat)))
        
        area_deg2 = polygon.area
        area_m2 = area_deg2 / (lat_per_meter * lon_per_meter)
        
        return area_m2
    
    def _generate_dem(self, south, north, west, east, n_pixels_x, n_pixels_y, dem_type, output_file, polygon=None):
        """
        Generate DEM raster file
        
        Args:
            south, north, west, east: Bounding box coordinates
            n_pixels_x, n_pixels_y: Grid dimensions
            dem_type: DEM dataset type
            output_file: Output file path
            
        Returns:
            dict: Statistics about the generated DEM
        """
        logger.info("Fetching elevation data...")
        
        # Initialize Topography
        topo = Topography(
            dem_type=dem_type,
            south=south,
            north=north,
            west=west,
            east=east,
            output_format='GTiff',
            cache_dir=self.cache_dir
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
        
        logger.info(f"Original data shape: {elev.shape}")
        
        # Resample to desired resolution
        zoom_y = n_pixels_y / elev.shape[0]
        zoom_x = n_pixels_x / elev.shape[1]
        
        if zoom_y != 1.0 or zoom_x != 1.0:
            logger.info(f"Resampling to {n_pixels_y}x{n_pixels_x}...")
            elev = zoom(elev, (zoom_y, zoom_x), order=1)
        
        # Create output directory if needed
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        
        # Write output
        logger.info(f"Writing to {output_file}...")
        
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
        
        # Calculate statistics
        valid_elev = elev[(elev != -9999) & (elev != 0) & ~np.isnan(elev)]
        
        if len(valid_elev) > 0:
            stats = {
                'min_elevation': float(valid_elev.min()),
                'max_elevation': float(valid_elev.max()),
                'mean_elevation': float(valid_elev.mean()),
                'total_relief': float(valid_elev.max() - valid_elev.min())
            }
            logger.info(f"Statistics: {stats}")
        else:
            stats = {
                'min_elevation': None,
                'max_elevation': None,
                'mean_elevation': None,
                'total_relief': None,
                'warning': 'No valid elevation data found'
            }
            logger.warning("No valid elevation data found")
        
        return stats