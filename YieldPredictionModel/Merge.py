import numpy as np
import pandas as pd

terrain_file_name = './Data/CookTerrainAttributes10m2_P3A1_20210119.csv'

terrain = pd.read_csv(terrain_file_name)

lats = terrain["Latitude"]
lons = terrain["Longitude"]

min_lat = np.min(lats)
max_lat = np.max(lats)
min_lon = np.min(lons)
max_lon = np.max(lons)

bounding_polygon = [
    (min_lat, min_lon),  # SW
    (min_lat, max_lon),  # SE
    (max_lat, max_lon),  # NE
    (max_lat, min_lon),  # NW
    (min_lat, min_lon)   # close polygon
]

print(bounding_polygon)

# Given the dataframe terrain get the LD2, Latitude, and Long
# find the average distance between the lat and long to know the grid resolution. Conver this to meters. 

lats = np.sort(terrain["Latitude"].unique())
lons = np.sort(terrain["Longitude"].unique())

lat_spacing_deg = np.mean(np.diff(lats))
lon_spacing_deg = np.mean(np.diff(lons))

mean_lat = np.mean(lats)

meters_per_deg_lat = 111320
meters_per_deg_lon = 111320 * np.cos(np.radians(mean_lat))

lat_spacing_m = lat_spacing_deg * meters_per_deg_lat
lon_spacing_m = lon_spacing_deg * meters_per_deg_lon

print("Latitude resolution (m):", lat_spacing_m)
print("Longitude resolution (m):", lon_spacing_m)

grid_resolution = (lat_spacing_m + lon_spacing_m) / 2
print("Approx grid resolution (m):", grid_resolution)