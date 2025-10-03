# Project Requirements — Biochar Placement Optimization Tool

## Table of Contents

- [Objective](#objective)
- [Scope](#scope)
- [References](#references)
  - [Cited Documents](#cited-documents)
- [Acronyms](#acronyms)
- [Functional Requirements](#functional-requirements)
  - [User Interface Requirements](#user-interface-requirements)
  - [What it should do](#what-it-should-do)
  - [System Requirements](#system-requirements)
    - [Performance Requirements](#performance-requirements)
    - [Compatibility Requirements](#compatibility-requirements)
    - [Interface Requirements](#interface-requirements)
    - [Appearance Requirements](#appearance-requirements)
    - [Reliability Requirements](#reliability-requirements)
- [Technical Platform Requirements](#technical-platform-requirements)
  - [Runtime Environment](#runtime-environment)
  - [Data Capacity](#data-capacity)
  - [Data Storage](#data-storage)
- [Software Requirements](#software-requirements)
  - [Functionality (Developer-facing)](#functionality-developer-facing)
- [Training Data Requirements](#training-data-requirements)
  - [Data Needs](#data-needs)
  - [Inputs and Outputs](#inputs-and-outputs)
  - [Data Sources](#data-sources)
  - [Data Quality](#data-quality)
  - [Data Volume](#data-volume)
  - [Data Privacy](#data-privacy)
- [Regulatory Requirements](#regulatory-requirements)
  - [Data Regulatory Requirements](#data-regulatory-requirements)
- [Cost Requirements](#cost-requirements)
  - [Prototype Cost](#prototype-cost)
- [Schedule Requirements](#schedule-requirements)

---

## Objective

This document defines the requirements of the Biochar Placement Optimization Tool and will be used to evaluate the project upon completion.

## Scope

Define the requirements to design and build a biochar optimization tool that is effective, easy to use, robust, and inexpensive. This document does not include design decisions; it only documents application/product requirements.

## References

### Cited Documents

- Azure Documentation — https://learn.microsoft.com/en-us/azure

## Acronyms

- EPO — Engineering Purchase Order
- ER — Engineering Release
- POC — Proof of Concept
- AI — Artificial Intelligence
- ML — Machine Learning
- ROI — Return on Investment
- API — Application Programming Interface
- UI — User Interface

## Functional Requirements

### User Interface Requirements

The user should be able to easily enter yield data and field boundaries and clearly view biochar placement prescription maps. The user should also be able to view the biochar’s ROI over different time periods.

### What it should do

The optimization tool should properly implement the user interface requirements, combine input data layers, run the data through an ML model, and clearly convey the ML output to the user.

### System Requirements

#### Performance Requirements

- The application will generate predictions in under 10 seconds for datasets up to 10,000 rows.
- The web interface will load within three seconds on a stable internet connection.

#### Compatibility Requirements

- Supported browsers: Chrome, Firefox, Edge, Safari, and Brave (latest stable versions).
- Supported device screen sizes: smartphones, tablets, and computers.
- Supported platforms: Windows 11 (client) and Linux (server-side hosting).

#### Interface Requirements

- CSV upload interface for yield data.
- Prescription map download interface.
- Frontend communicates with the backend via REST API endpoints.

#### Appearance Requirements

- Apply branding with consistent color schemes and styles.

#### Reliability Requirements

- The trained model shall achieve ≥ X% accuracy on validation data.
- Expected uptime, autosave features, login system, and browser storage will be provided.  
  (Exact targets to be finalized.)

## Technical Platform Requirements

### Runtime Environment

- Frontend: React.js (JavaScript framework)
- Backend: Django (Python framework)
- ML models: TensorFlow
- Cloud: Microsoft Azure — Azure App Service (web hosting), Azure Database for PostgreSQL (structured data storage), Azure Machine Learning (model training and inference)

### Data Capacity

- Training: datasets up to 1,000,000 rows.
- Storage: up to 5 GB of structured data in the database.
- Inference: up to 50 concurrent requests to the prediction model.

### Data Storage

- Microsoft Azure Database for PostgreSQL.

## Software Requirements

### Functionality (Developer-facing)

- Data preprocessing module for cleaning and normalizing input data.
- Model training module capable of training multiple ML architectures.
- Inference module exposing the trained model via an API.
- Results module that formats predictions into tables and downloadable prescription maps.

## Training Data Requirements

### Data Needs

The model will be trained on the following types of data: climate, elevation, soil, field orientation, and yield.

### Inputs and Outputs

- Inputs (x): climate, elevation, soil, field orientation
- Output (y): yield

### Data Sources

- Climate: NOAA  
- Elevation: USGS  
- Soil: NRCS  
- Field orientation: NGS  
- Yield: provided by the user

### Data Quality

The system requires high-quality agricultural data to ensure reliable predictions. Data must be:

- Complete: contain all necessary attributes
- Accurate: verified, from reliable sources
- Consistent: standardized units and formats across datasets

Automated validation and cleaning steps will be used to maintain these standards and ensure high-quality data.

### Data Volume

- Minimum dataset size needed to train (e.g., 5 years of all data types, etc.).  
  (To be refined as data profiling progresses.)

### Data Privacy

Any user-provided data will be erased after use unless a user claims their data; in that case, the data will be anonymized and may be used to train the model.

## Regulatory Requirements

### Data Regulatory Requirements

All datasets used in development will comply with applicable open-data licensing agreements. Any farmer-provided or proprietary data will be erased after use unless claimed. If claimed, data will be anonymized before storage or use in training. The system will comply with general data-protection principles.

## Cost Requirements

### Prototype Cost

The prototype will be developed using Azure cloud services. The cost of hosting, storage, and compute resources on Azure shall not exceed $50/month during the capstone project.

## Schedule Requirements

The following are the major project milestones:

- Approval of Requirements — Sept. 30, 2025
- Concept Design Review — Nov. 30, 2025
- EPO of long lead parts — Dec. 8, 2025
- Detailed Design Review — Feb. 9, 2026
- ER of drawing package — Mar. 2, 2026
- Complete Prototype build — Apr. 5, 2026
- UI Design EXPO — Apr. 26, 2026
- Final Report / Drawings — May 4, 2026