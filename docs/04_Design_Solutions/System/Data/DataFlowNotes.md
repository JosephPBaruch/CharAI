# Data Flow

This document describes the flow of data from the users input, to the systems output.

## Diagram

![Data Flow Diagram](/docs/04_Design_Solutions/System/Data/DataFlowNew.drawio.png)

## Inputs

The user will be required to enter their farm coordinates, the amount of Biochar they will be willing to use/want to test, the crop they are using/want to test and optionally, they will be able to enter in their Yield Data

## System

The system has three to four processes to complete the task in determining the biochar prescription map: data gathering and preprocessing, pretraining model, prediction, and data postprocessing.

### Data Gathering and Preprocessing

After the famer inputs their farm coordinates, the system will need to be able to gather all necessary data about the land being tested, this includes gathering the following data:

- soil type
- weather (average precipitation, temp, sun, etc)
- elevation
- slope face direction

**Note:** The set of datapoints are subject to change

Next, once the data is gathered it will need to be place in the expected format for the model/equation.

Lastly, the system will compare land which has biochar and land that will not. How this will be done is, depending on the about of Biochar entered, one copy of the land data will be altered. For instance, biochar alters the soil type and soil moisture retention (increasing it). So, this will be altered.

### Pretraining Model

Optionally, the user will be able to enter in previous yield data to inprove the performance of the model. Before the predictions are made, the previous yield data will be use to train the base model.

### Prediction

The Biochar altered land data and the non-altered land data will be fed through the model/equation, predicting yeild for the upcoming year. The model will be trained to predict yield based on previous years data.

### Data Postprocessing

After the predictions are created, the yield predictions will be compared against each other. This will produce the net increase in yeild. ROI can be calculated the following way:

```md
ROI = (Biochar_Rate _ Biochar_Amount) / ((Yield _ Crop_Rate) - Production_Costs )
```

**Note**: ROI will be evaluated for every cell on the farmers land.

Lastly, the `Biochar Precription Map` will be computed by creating a heatmap based on the ROI. A lower ROI will be depicted with the color green and a higher ROI will be represented with the color red.

## Outputs

The system will produce a heatmap style prescription map depicting ROI for using Biochar on their land. Optimally, this will be able to be entered into a conbine which is used to place and til biochar.
