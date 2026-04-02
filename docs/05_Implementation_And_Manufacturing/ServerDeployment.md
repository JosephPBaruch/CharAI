# Server Deployment Guide

## Prerequisites

- **Docker Engine** (20.10+)
- **Docker Compose v2** plugin

Verify both:

```bash
docker --version
docker compose version
```

If `docker compose` is not found:

```bash
sudo apt-get update && sudo apt-get install -y docker-compose-plugin
```

## Quick Start

Clone the repository and run the root pipeline script:

```bash
git clone https://github.com/JosephPBaruch/CharAI.git
cd CharAI
./pipeline.sh --hosts your.domain.com
```

This builds all images, starts all containers, runs database migrations, and waits for services to be healthy.

## Configuration

All configuration is done via environment variables. Defaults are set in `docker-compose.yml` and can be overridden at runtime.

| Variable | Default | Description |
|---|---|---|
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,frontend` | Django allowed hosts |
| `SECRET_KEY` | `ci-test-key` | Django secret key (**change in production**) |
| `POSTGRES_DB` | `charai_test` | PostgreSQL database name |
| `POSTGRES_USER` | `charai` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `testpass` | PostgreSQL password (**change in production**) |
| `OPENTOPOGRAPHY_API_KEY` | `keykey` | OpenTopography API key |
| `DEBUG` | `True` | Django debug mode (**set to False in production**) |
| `BACKEND_PORT` | `8000` | Host port for backend |
| `FRONTEND_PORT` | `80` | Host port for frontend |
| `LOG_LEVEL` | `DEBUG` | Caddy log level |

### Option A: Inline environment variables

```bash
SECRET_KEY=your-secret-key \
POSTGRES_PASSWORD=secure-password \
DEBUG=False \
OPENTOPOGRAPHY_API_KEY=your-key \
./pipeline.sh --hosts your.domain.com
```

### Option B: `.env` file

Create a `.env` file in the repository root (next to `docker-compose.yml`):

```env
SECRET_KEY=your-secret-key
POSTGRES_DB=charai
POSTGRES_USER=charai
POSTGRES_PASSWORD=secure-password
OPENTOPOGRAPHY_API_KEY=your-key
DEBUG=False
ALLOWED_HOSTS=your.domain.com
```

Then run:

```bash
./pipeline.sh
```

Docker Compose automatically reads `.env` from the same directory.

## Common Operations

### Start all services

```bash
docker compose up --build -d --wait
```

### Stop all services

```bash
docker compose down
```

### Stop and remove volumes (database data)

```bash
docker compose down -v
```

### View logs

```bash
docker compose logs -f              # all services
docker compose logs -f backend      # backend only
docker compose logs -f frontend     # frontend only
docker compose logs -f postgres     # database only
```

### Run database migrations

```bash
docker exec django-backend python manage.py migrate
```

### Rebuild a single service

```bash
docker compose up --build -d backend
```

### Start individual services

The per-service pipeline scripts still work and delegate to docker compose:

```bash
cd database && ./pipeline.sh    # starts postgres only
cd backend && ./pipeline.sh     # starts postgres + backend
cd frontend && ./pipeline.sh    # starts postgres + backend + frontend
```

## Architecture

```
Host
 |
 |-- :80  -> frontend (Caddy)
 |            |-- serves static React build
 |            |-- reverse proxies /api/* -> backend:8000
 |
 |-- :8000 -> backend (Gunicorn/Django)
 |            |-- connects to postgres:5432
 |
 |-- postgres (internal only, no host port exposed)
```

All three containers share the `charai-net` Docker network. The frontend Caddy server handles reverse proxying `/api/*` requests to the backend.
