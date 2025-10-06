# Project Requirements — Biochar Placement Optimization Tool

## Table of Contents

- [Project Requirements — Biochar Placement Optimization Tool](#project-requirements--biochar-placement-optimization-tool)
  - [Table of Contents](#table-of-contents)
  - [Functional Requirements](#functional-requirements)
    - [User-Facing Input/Output](#user-facing-inputoutput)
    - [Yield Prediction System Inputs/Outputs](#yield-prediction-system-inputsoutputs)
  - [System Requirements](#system-requirements)
    - [Yield Prediction System](#yield-prediction-system)
    - [Accessibility](#accessibility)
  - [Budget Requirements](#budget-requirements)
  - [Schedule Requirements](#schedule-requirements)

**Note:** Update the [Table of Contents](#table-of-contents) with the *Markdown All in One* extension.

---

## Functional Requirements

See functional requirements represented in Gherkin in [CharAI.feature](CharAI.feature).

### User-Facing Input/Output

The user shall input the coordinate information of their land and obtain a biochar prescription map. 

The land coordinate information shall be input manually within the system using an interactive map or by uploading a file containing the relevant information. 

Biochar Prescription Maps shall represent return on investment (ROI) data for biochar placement on a field. These maps shall not represent the amount of biochar that should be placed on the section of the field.

### Yield Prediction System Inputs/Outputs

The yield prediction system shall have the following inputs: 
  - Land Coordinates
  - Soil properties
  - Slope directions
  - Elevation
  - Moisture
  - Climate
  - Biochar

The yield prediction system shall output a prediction of crop yield.

**Note:** The input *Biochar* shall alter soil properties and moisture. This calculation shall happen before the inputs are entered into the yield prediction model/equation. 

## System Requirements

### Yield Prediction System

The yield prediction system shall be designed to easily use a yield prediction equation or a yield prediction model. The yield prediction model is to be determined. Options include:
- Machine learning model
- Convolutional neural network
- Other

### Accessibility

The system shall be publicly hosted and accessed using authentication. 

## Budget Requirements

The total budget of the product shall not exceed $1000.

## Schedule Requirements

The following schedule outline shall be followed:

- Approval of Requirements — Sept. 30, 2025
- Concept Design Review — Nov. 30, 2025
- EPO of long lead parts — Dec. 8, 2025
- Detailed Design Review — Feb. 9, 2026
- ER of drawing package — Mar. 2, 2026
- Complete Prototype Build — Apr. 5, 2026
- UI Design EXPO — Apr. 26, 2026
- Final Report / Drawings — May 4, 2026