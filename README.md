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

All services are orchestrated with Docker Compose. A **persistent named volume** (`postgres-data`) keeps PostgreSQL data across container restarts, so redeploying the application does not destroy the database.

#### First Deploy

Build and start all services (database, backend, frontend) and run migrations:

```sh
./pipeline.sh --hosts HOST
# or
make deploy
```

Replace `HOST` with the hostname or IP address to bind the services to.

#### Upgrading (Redeploying Frontend/Backend)

To deploy new code without losing database state, use the `--upgrade` flag. This stops and recreates **only** the frontend and backend containers while the database volume remains intact:

```sh
./pipeline.sh --upgrade --hosts HOST
# or
make upgrade
```

Django migrations are applied automatically after every deploy or upgrade.

#### Makefile Targets

| Target     | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `deploy`   | First-time deploy: build all services and run migrations      |
| `upgrade`  | Rebuild frontend/backend only, preserve database              |
| `migrate`  | Run Django migrations on the running backend container        |
| `status`   | Show running container status                                 |
| `logs`     | Tail logs for all services                                    |
| `stop`     | Stop all containers (database volume is preserved)            |
| `clean`    | Remove all containers **and** the database volume (destructive) |

Makefile targets use environment variables from the shell. Set `ALLOWED_HOSTS` (and any other overrides) before running:

```sh
ALLOWED_HOSTS=your.domain.com make deploy
```

> **Warning:** `make clean` (or `docker compose down -v`) destroys the database volume and all stored data. Use only when you want a fresh start.

#### Running Individual Services

```sh
# Start only the database
cd database && ./pipeline.sh

# Start only the backend (and its dependency: postgres)
cd backend && ./pipeline.sh --hosts HOST
```
