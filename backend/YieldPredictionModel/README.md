# Data

## Cook Farm Data

### Crop Data

[Crop Data Information](https://meta.cafltar.org/catalog/datasets/Production/CafPlantGridPointSurvey/CookEastHandHarvest_P3A3_V1)

#### Cook Farm Metadata

##### Cook Farm Polygon Coordinates

| Lat               | Long                |
| ----------------- | ------------------- |
| 46.77863200102642 | -117.0936964616513  |
| 46.77863200102642 | -117.07662800000426 |
| 46.78504435150698 | -117.07662800000426 |
| 46.78504435150698 | -117.0936964616513  |

##### Grid Cell resolution

```py
Latitude resolution (m): 1.1550531642327897
Longitude resolution (m): 2.105384854636277
Approx grid resolution (m): 1.6302190094345332
```

This means that since the finest resolution that we have is 5 x 5 meters, we will just need to pull the id locations of the data that is closest to our points.

#### Raw Dataset Metadata

| Name                     | Description                                                                                                                                                                                                                                                                  | Units     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| HarvestYear              | Year sample was collected in format YYYY.                                                                                                                                                                                                                                    | YYYY      |
| Crop                     | Crop abbreviation of the sample where: Spring wheat = SW, Winter wheat = WW, Spring canola = SC, Winter canola = WC, Spring barley = SB, Spring pea = SP, Winter barley = WB, Winter pea = WP, Winter triticale = WT, Winter lentil = WL, Garbonzo Beans = GB, Alfalfa = AL. | unitless  |
| ID2                      | Number identifier of georeference point near where the biomass sample was collected.                                                                                                                                                                                         | unitless  |
| SampleId                 | Sample identifier of the biomass sample.                                                                                                                                                                                                                                     | unitless  |
| Latitude                 | Latitude of the georeference point near where the biomass sample was collected.                                                                                                                                                                                              | dd        |
| Longitude                | Longitude of the georeference point near where the biomass sample was collected.                                                                                                                                                                                             | dd        |
| QCCoverage               | Percent of metric values in the dataset that had at least one quality control check.                                                                                                                                                                                         | %         |
| QCFlags                  | Percent of metric values with at least one quality control check that failed the check.                                                                                                                                                                                      | %         |
| Comments                 | Comments, aggregated from various columns. '\|' or ',' separates source.                                                                                                                                                                                                     | unitless  |
| CropExists               | Indication whether or not a crop was present at the georeference location: 1 = crop present, 0 = not present. Crop not present due to planting error, failed germination, weeds, etc. A value of 1 without data indicates a missing sample.                                  | unitless  |
| ResidueMassAirDryPerArea | Residue mass on a per area basis. Value is calculated from air dried biomass and grain mass.                                                                                                                                                                                 | g/m²      |
| GrainYieldAirDry         | Grain mass on a per area basis. Sample dried in a greenhouse, threshed, then weighed.                                                                                                                                                                                        | g/m²      |
| GrainMoisture            | Percent of moisture in the grain during analysis for protein, starch, gluten, and/or oil. Value is not necessairly compatible with AirDry or OvenDry masses. Value is from near-infrared instrumentation.                                                                    | %         |
| GrainTestWeight          | Test weight of grain, as an indicator of grain quality.                                                                                                                                                                                                                      | lb/bushel |
| GrainProtein             | Percent of protein in the grain on a dry mass basis. Value is from near-infrared instrumentation.                                                                                                                                                                            | %         |
| GrainStarch              | Percent of starch in the grain on a dry mass basis. Value is from near-infrared instrumentation.                                                                                                                                                                             | %         |
| GrainGluten              | Percent of gluten in the grain on a dry mass basis. Value is from near-infrared instrumentation.                                                                                                                                                                             | %         |
| GrainOil                 | Percent of oil in the grain on a dry mass basis. Value is from near-infrared instrumentation.                                                                                                                                                                                | %         |
| ResidueNitrogen          | Percent of total nitrogen in the residue on a dry mass basis. Value is from combustion analysis.                                                                                                                                                                             | %         |
| ResidueCarbon            | Percent of total carbon in the residue on a dry mass basis. Value is from combustion analysis.                                                                                                                                                                               | %         |
| GrainNitrogen            | Percent of total nitrogen in the grain on a dry mass basis. Value is from combustion analysis.                                                                                                                                                                               | %         |
| GrainCarbon              | Percent of total carbon in the grain on a dry mass basis. Value is from combustion analysis.                                                                                                                                                                                 | %         |
| GrainYieldWet            | Grain mass on a per area basis. Sample weighed prior to drying.                                                                                                                                                                                                              | g/m²      |
| ResidueMassWetPerArea    | Residue mass on a per area basis. Sample weighed prior to drying.                                                                                                                                                                                                            | g/m²      |
| GrainSulfur              | Percent of sulfur in grain.                                                                                                                                                                                                                                                  | %         |
| ResidueSulfur            | Percent of sulfur in the residue                                                                                                                                                                                                                                             | %         |

### Terrain Data

[Geophysical Data Information](https://meta.cafltar.org/catalog/datasets/Production/CookGeospatialTerrainAttributes/CookTerrainAttributes10m2_P3A1_v1)

#### Raw Dataset Metadata

| Name                    | Description                                                                                                                                                                     | Units             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| ID2                     | Number ID of georeference point                                                                                                                                                 | unitless          |
| FieldName               | Name of field where georeference point (ID2) resides, either "CookEast" or "CookWest"                                                                                           | unitless          |
| Latitude                | Latitude of georeference point; WGS84                                                                                                                                           | dd                |
| Longitude               | Longitude of georeference point; WGS84                                                                                                                                          | dd                |
| Elevation               | Height above sea level                                                                                                                                                          | meter             |
| AnalyticalHillshade     | The angle between the surface and the incoming light beams, measured in radians.                                                                                                | radian            |
| ConvergenceIndex        | This module calculates an index of convergence/divergence regarding to overland flow.                                                                                           | unitless          |
| TotalCatchmentArea      | Catchment area, original, run off area of above-situated grid cells                                                                                                             | m²                |
| TopographicWetnessIndex | Calculation of the slope and specific catchment area based Topographic Wetness Index. It shows water accumulation. This can be useful for soil or flood mapping                 | unitless          |
| LengthSlopeFactor       | Length-slope factor accounts for effects of topography on erosion. In the equation, β is slope in degree                                                                        | unitless          |
| ChannelNetworkBaseLevel | Contains the interpolated channel network base level elevations.                                                                                                                | meter             |
| ChannelNetworkDistance  | The altitude above the channel network.                                                                                                                                         | meter             |
| ValleyDepth             | Valley depth is calculated as difference between the elevation and an interpolated ridge level.                                                                                 | meter             |
| RelativeSlopePosition   | Normalized value from 0 (bottom) to 1 (top) for summit positions.                                                                                                               | unitless          |
| Slope                   | Measure the rate of changes of elevation in the direction of steepest descent                                                                                                   | degree            |
| Aspect                  | The orientation of the line of steepest descent and is usually measured in degrees clockwise from North.                                                                        | degree            |
| TRASP                   | A linear transformation of the circular aspect variable, a continuous variable between 0-1. 0: coolest and wetness orientation; 1: hotter and dryer south-southwesterly slopes. | unitless          |
| ProfileCurvature        | Measures the rate of change of slope down a flow line and is important for characterizing changes in flow velocity and sediment transport process.                              | radians per meter |
| PlanCurvature           | Measures the rate of change of aspect along a contour line and is important for characterizing the propensity for water to converge or diverge                                  | radians per meter |
| TangentialCurvature     | It is the curvature in an inclined plane perpendicular to both the direction of flow and the surface. Provides info for studying convergence and divergence                     | radians per meter |

### Combined Data

#### Dataset Metadata

Target Column: "GrainYieldAirDry"

| Name                       | Description                                                                                                                                                                                                                                                                  | Units             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Crop                       | Crop abbreviation of the sample where: Spring wheat = SW, Winter wheat = WW, Spring canola = SC, Winter canola = WC, Spring barley = SB, Spring pea = SP, Winter barley = WB, Winter pea = WP, Winter triticale = WT, Winter lentil = WL, Garbonzo Beans = GB, Alfalfa = AL. | unitless          |
| QCFlags                    | Percent of metric values with at least one quality control check that failed the check.                                                                                                                                                                                      | %                 |
| CropExists                 | Indication whether or not a crop was present at the georeference location: 1 = crop present, 0 = not present. Crop not present due to planting error, failed germination, weeds, etc. A value of 1 without data indicates a missing sample.                                  | unitless          |
| GrainYieldAirDry           | Grain mass on a per area basis. Sample dried in a greenhouse, threshed, then weighed.                                                                                                                                                                                        | g/m²              |
| Elevation                  | Height above sea level                                                                                                                                                                                                                                                       | meter             |
| AnalyticalHillshade        | The angle between the surface and the incoming light beams, measured in radians.                                                                                                                                                                                             | radian            |
| ConvergenceIndex           | This module calculates an index of convergence/divergence regarding to overland flow.                                                                                                                                                                                        | unitless          |
| TotalCatchmentArea         | Catchment area, original, run off area of above-situated grid cells                                                                                                                                                                                                          | m²                |
| TopographicWetnessIndex    | Calculation of the slope and specific catchment area based Topographic Wetness Index. It shows water accumulation. This can be useful for soil or flood mapping                                                                                                              | unitless          |
| LengthSlopeFactor          | Length-slope factor accounts for effects of topography on erosion. In the equation, β is slope in degree                                                                                                                                                                     | unitless          |
| ChannelNetworkBaseLevel    | Contains the interpolated channel network base level elevations.                                                                                                                                                                                                             | meter             |
| ChannelNetworkDistance     | The altitude above the channel network.                                                                                                                                                                                                                                      | meter             |
| ValleyDepth                | Valley depth is calculated as difference between the elevation and an interpolated ridge level.                                                                                                                                                                              | meter             |
| RelativeSlopePosition      | Normalized value from 0 (bottom) to 1 (top) for summit positions.                                                                                                                                                                                                            | unitless          |
| Slope                      | Measure the rate of changes of elevation in the direction of steepest descent                                                                                                                                                                                                | degree            |
| Aspect                     | The orientation of the line of steepest descent and is usually measured in degrees clockwise from North.                                                                                                                                                                     | degree            |
| TRASP                      | A linear transformation of the circular aspect variable, a continuous variable between 0-1. 0: coolest and wetness orientation; 1: hotter and dryer south-southwesterly slopes.                                                                                              | unitless          |
| ProfileCurvature           | Measures the rate of change of slope down a flow line and is important for characterizing changes in flow velocity and sediment transport process.                                                                                                                           | radians per meter |
| PlanCurvature              | Measures the rate of change of aspect along a contour line and is important for characterizing the propensity for water to converge or diverge                                                                                                                               | radians per meter |
| TangentialCurvature        | It is the curvature in an inclined plane perpendicular to both the direction of flow and the surface. Provides info for studying convergence and divergence                                                                                                                  | radians per meter |
| AnnualGlobalSolarRadiation | Annual total global solar radiation at the surface (from terrain/solar radiation product; if you want, you can refine this description to match your source metadata precisely).                                                                                             | (same as source)  |

## List of all Attributes to Fetch

['Crop', 'QCFlags', 'CropExists', 'GrainYieldAirDry', 'Elevation', 'AnalyticalHillshade', 'ConvergenceIndex', 'TotalCatchmentArea', 'TopographicWetnessIndex', 'LengthSlopeFactor', 'ChannelNetworkBaseLevel', 'ChannelNetworkDistance', 'ValleyDepth', 'RelativeSlopePosition', 'Slope', 'Aspect', 'TRASP', 'ProfileCurvature', 'PlanCurvature', 'TangentialCurvature', 'AnnualGlobalSolarRadiation']

## CropSyst Data

[CropSyst Data Link](https://www.quantitative-plant.org/model/CropSyst)

[CropSyst Research Paper](https://www.sciencedirect.com/science/article/abs/pii/S1161030102001090?via%3Dihub)

TODO: Research the differences and similarities between the Cook Crop/Terrain Dataset and CropSyst Input set.

Note: The CropSyst set is a biomass cumulation model, which is not what CharAI will be doing, but it could contain inputs that might lead to improving the model.

## Model Creation Plan

Run a script to get the CharAI data and to splice it into the Cook data

Export to Colab and run a script to train the model.

Import the model into repo

## Model Accuracy Requirements

The training script (`CreateAndTrainYieldCalculatorModel.py`) enforces a minimum
model accuracy on every run. If the trained model does not meet the threshold,
the script exits with a non-zero code, which causes Docker builds and CI
pipelines to fail with a clear error message.

### Current Threshold

| Metric       | Minimum Value | Notes                                        |
| ------------ | ------------- | -------------------------------------------- |
| R-squared    | 0.05          | Measured on 20% held-out test set            |

The threshold is defined as `MIN_R2_THRESHOLD` at the top of the training
script. It can be raised as the model architecture, feature set, or training
data improves.

### Why R-squared?

R-squared (coefficient of determination) measures the proportion of variance in
the target variable (`GrainYieldAirDry`) explained by the model. The current
model uses only four terrain features (`elev_mean_m`, `slope_mean_deg`,
`aspect_eastness`, `aspect_northness`), so R-squared is expected to be modest.
The threshold is a floor to catch broken training runs rather than a quality
target.

### What Happens on Failure

When R-squared falls below the threshold the training script:
1. Logs an `ERROR`-level message with the actual vs. required R-squared.
2. Exits with code 1.
3. The Docker build step in `Dockerfile` detects the non-zero exit and aborts.
4. CI reports the failure in the build logs with a descriptive error.

### How to Update the Threshold

1. Open `CreateAndTrainYieldCalculatorModel.py`.
2. Change `MIN_R2_THRESHOLD` to the new value.
3. Rebuild the Docker image locally (`docker compose build backend`) to verify
   the model still passes.
4. Commit and push -- CI will enforce the new threshold automatically.

### Accuracy Report in Logs

Every training run prints an accuracy report to stdout/stderr:
```
--- Model Accuracy Report ---
  Test Loss (MSE) : <value>
  Test MAE        : <value>
  RMSE            : <value>
  R-squared (R2)  : <value>
  Min R2 Threshold: <value>
  Training rows   : <count>
  Test rows       : <count>
  Features        : elev_mean_m, slope_mean_deg, aspect_eastness, aspect_northness
--- End Accuracy Report ---
```

### Data Quality -- Cook Harvest

The training script cleans the Cook Farm harvest data before training:
- Columns with more than 1000 missing values are dropped (too sparse).
- Rows with any remaining missing values are removed.
- Metadata columns (`SampleID`, `QCCoverage`, `QCFlags`, `CropExists`, `ID2`,
  `HarvestYear`) are dropped.
- **Zero-yield rows are removed.** These represent planting failures or
  unharvested samples and would bias the model toward predicting lower yields.

## Model Artifacts in CI

Model files (`*.keras`) generated by `CreateAndTrainYieldCalculatorModel.py` are
**ephemeral** and must not be committed to the repository. The model is trained
during the Docker image build so that every image ships with an up-to-date model
that stays in sync with the code and training data.

- **Docker build**: The `Dockerfile` runs the training script at build time.
  The `OPENTOPOGRAPHY_API_KEY` is passed as a build arg (defaults to `keykey`).
  A throwaway `SECRET_KEY` satisfies `django.setup()`; no database is needed.
- **CI**: `ci.yaml` passes the real API key via the `docker/bake-action` env so
  builds in GitHub Actions use the correct key. No separate training step is
  needed since the model is already embedded in the image.
- **Local development**: Running `docker compose build` trains the model
  automatically. Set `OPENTOPOGRAPHY_API_KEY` in your environment or `.env` to
  use a real key; otherwise the default `keykey` placeholder is used.
- **Production / curated models**: Managed the same way -- rebuild the image to
  retrain. Do not check model files into version control.
- **`.gitignore`**: `*.keras` is listed in the root `.gitignore` to prevent
  accidental commits of model files.
