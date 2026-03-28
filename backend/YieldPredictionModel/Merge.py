import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

terrain_file_name = './Data/CookTerrainAttributes10m2_P3A1_20210119.csv'
harvest_file_name = './Data/CookHandHarvest_HY1999-HY2016_P3A3_20241029(in).csv'
charai_cook_data_file_name = './Data/CharAI_Cook.csv'

terrain = pd.read_csv(terrain_file_name)

cook_charai = pd.read_csv(charai_cook_data_file_name)

harvest = pd.read_csv(harvest_file_name)

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

# Hmm, this doesn't seem quite write. We need to explore the dataset more to determine is the CookHadHarvest is sufficient enough of data to train a NN or program of some sort. 
# This needs to be spliced into the CharAI Cook dataframe. I'm not sure if the Cook Harvest reall contains a grid of yield for a range of years



# # Find the closest terrain point (by lat/lon) for each cook_charai row and assign its ID2
# terrain_coords = np.deg2rad(terrain[["Latitude", "Longitude"]].values)
# charai_coords = np.deg2rad(cook_charai[["centroid_lat", "centroid_lon"]].values)

# tree = cKDTree(terrain_coords)
# _, indices = tree.query(charai_coords)
# cook_charai["ID2"] = terrain.loc[indices, "ID2"].values

# print(f"Assigned ID2 to {len(cook_charai)} cook_charai rows")

# # Merge cook_charai attributes with harvest yield data on ID2
# # Each harvest row has a HarvestYear + ID2; merge replicates cook_charai rows for every year
# harvest_subset = harvest[["HarvestYear", "ID2", "GrainYieldAirDry"]].copy()
# merged = cook_charai.merge(harvest_subset, on="ID2", how="inner")

# print(f"Merged dataset: {len(merged)} rows, {len(merged.columns)} columns")
# print(f"Years covered: {sorted(merged['HarvestYear'].unique())}")

# merged.to_csv('./Data/CharAI_Cook_Merged.csv', index=False)
# print("Saved to ./Data/CharAI_Cook_Merged.csv")