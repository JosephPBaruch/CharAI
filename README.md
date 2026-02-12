# AI for Agriculture

A full-stack web application built to support **precision agriculture** in the Palouse region and beyond. This project helps farmers optimize their use of **biochar** by combining on-farm yield data with public datasets (soil, weather, elevation) to generate actionable **prescription maps** powered by AI.

---

## Table of Contents

- [AI for Agriculture](#ai-for-agriculture)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Tech Stack (**proposed**)](#tech-stack-proposed)
  - [Getting Started](#getting-started)
    - [Locally](#locally)
      - [Frontend](#frontend)
      - [Backend](#backend)
    - [Docker](#docker)
  - [Contact](#contact)

## Project Overview

Traditional unirrigated hill farming in the Pacific Northwest faces challenges such as:

- Highly variable terrain
- Differences in water availability and snow accumulation
- Topsoil erosion on slopes

This USDA-funded project explores how **biochar** can improve long-term soil productivity and farmer ROI. Our web application provides a data-driven decision support tool to make biochar adoption practical and profitable.

---

## Features

- **Secure farmer login** system
- **File uploads** for field boundaries and harvester yield data
- **AI-powered models** trained on integrated datasets
- **Prescription map generation** to maximize benefits and ROI

---

## Tech Stack (**proposed**)

- **Frontend:** React + Vite (TypeScript), MUI
- **Backend:** Django (Python)
- **Database:** PostgreSQL
- **Cloud Platform:** Microsoft Azure

---

## Getting Started

Follow these steps to run the project locally or with Docker.

### Locally

#### Frontend

Install dependencies and start the development server:

```sh
cd frontend
npm install
npm run dev
```

#### Backend

Create and activate a Python virtual environment, install dependencies, apply migrations, and start the development server:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Docker

Pipeline scripts are provided to build and run services with Docker. From the repository root (or from an individual service directory) run the pipeline script:

```sh
# Run all pipelines from the repository root
./pipeline.sh --hosts HOST

# Or run the backend pipeline from the backend directory
cd backend
./pipeline.sh --hosts HOST
```

Replace `HOST` with the hostname or IP address to bind the services to.

## Contact

For questions, partnership inquiries, or to report issues, email `engr-ai4agriculture@uidaho.edu`. Please include "CharAI" in the subject line.
