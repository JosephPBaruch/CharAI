# Stages

Here are the known and proposed stages of the project lifecycle:

## Stage 1: Init and Auth System

- Initialize the frontend and the backend system
- create the authentication system for both and integrated the services

## Stage 2: File Inputs and Outputs

### Inputs

- provide a solution for inputting FILES for the following (research and understand what the formats are):
  - Yield
  - Coordinates
- input the other components
  - Biochar (amount and cost)
  - Crop (type and rate of return)

### Ouputs

Retrieve the prescription map, display and allow for downloading

### Frontend

Provide an interface for the above input/ouputs

### Backend

Include inputs/outputs to API.

Store all of the required information. On a volume/or DB:

### Data

Using the Cook Dataset, create a model to predict yield on a given coordinate. This does not need to be very accurate and should not contain many attributes.

## Stage 3: End-to-End #1

Backend needs to use the inputs created in Stage 2, to fetch the required data.

Temporarily store this data in a organized matter for future preparation.

The goal by the end of this stage is to have a fully functioning product. It doesn't need to be accuracte but needs to function.

Model pipeline?

## Stage 4: Input and Output refinements

Instead of providing input via a coordinate file and output, just yeild data:

- Allow the user to draw their coordinates for their land (needs to be converted to the correct format)
- The output needs to be ROI data (which gets rendered in the frontend)

## Stage 3: End-to-End #2

Improve the model and the inputs to the model. For instance, take in weather data, etc.
