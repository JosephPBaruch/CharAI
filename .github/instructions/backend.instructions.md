---
applyTo: "backend/**"
---

# Backend Instructions — Django + DRF

## Stack

- **Python 3.12**, Django 5.2, Django REST Framework 3.16
- **Auth**: Token-based (`rest_framework.authtoken`)
- **DB**: SQLite (dev), PostgreSQL (prod) via `django-environ`
- **Key libs**: pandas, rasterio, TensorFlow, scikit-learn, shapely, scipy

## Directory Structure

```
backend/
├── config/           # Django project settings, root URL conf, WSGI/ASGI
│   ├── settings.py   # Uses django-environ for .env config
│   └── urls.py       # Mounts core app at /api/
├── core/             # Main Django app
│   ├── models.py     # Field, PrescriptionMap
│   ├── views.py      # Class-based APIViews (not ViewSets)
│   ├── serializers.py# DRF serializers for validation
│   ├── services.py   # Business logic, background threading
│   ├── urls.py       # /api/auth/*, /api/crop-types/, /api/field/*
│   └── crop_types.py # Crop code constants from training CSV
├── modules/          # Standalone processing modules
│   ├── Calculator/       # YieldCalculator — ML yield prediction
│   ├── GeoParser/        # GeoTIFF parsing to DataFrames
│   ├── Geotiffgenerator/ # DEM download & GeoTIFF generation
│   └── PrescriptionMapGenerator/  # Payback period grid computation
├── YieldPredictionModel/ # TensorFlow model training scripts
│   └── Models/           # Saved .keras models
├── data/             # CSV training data, generated prescription JSONs
├── dems/             # Generated DEM GeoTIFF files
└── requirements.txt
```

## Conventions

- **Views**: Use `APIView` subclasses, not `ModelViewSet`. Each view class handles one resource with explicit HTTP method handlers (`get`, `post`, `delete`).
- **Service layer**: Heavy business logic lives in `core/services.py`, not in views. Background work (prescription map generation) runs in `threading.Thread`.
- **Serializers**: Separate serializers for input validation (`FieldDataSerializer`) vs model representation (`FieldModelSerializer`).
- **Logging**: Use `logging.getLogger("charai")` throughout. Never use `print()`.
- **Environment**: All secrets and config via `.env` file parsed by `django-environ`. Never hardcode secrets.
- **Modules are self-contained**: Each module under `backend/modules/` is an independent package with its own `__init__.py` and tests. Import them as `from modules.Calculator import YieldCalculator`.
- **Standalone scripts**: For scripts in `YieldPredictionModel/`, insert `backend/` into `sys.path` and call `django.setup()` before importing from `core` or `modules`.

## API Endpoints

| Method | Path                     | Auth   | Purpose                          |
| ------ | ------------------------ | ------ | -------------------------------- |
| POST   | `/api/auth/register/`    | Public | User registration                |
| POST   | `/api/auth/login/`       | Public | User login, returns token        |
| POST   | `/api/auth/logout/`      | Token  | Logout, deletes token            |
| GET    | `/api/auth/user/`        | Token  | Current user info                |
| GET    | `/api/crop-types/`       | Public | List valid crop type codes       |
| GET    | `/api/field/`            | Token  | List user's fields               |
| POST   | `/api/field/`            | Token  | Create/update field, trigger job |
| DELETE | `/api/field/`            | Token  | Delete a field by field_id       |
| GET    | `/api/field/<field_id>/` | Token  | Get prescription map for field   |

## Data Models

- **Field**: Belongs to User. Stores GeoJSON boundaries, crop type, price, prescription status (`pending`→`started`→`complete`/`failed`), and a path to the generated prescription JSON file.
- **PrescriptionMap**: One-to-one with Field. Stores the computed prescription data as JSON.

## Testing

- Tests use Django `TestCase` in `core/tests.py`.
- Module tests live in each `backend/modules/<Module>/` directory (e.g., `test_calculator.py`).
- Run with: `python manage.py test`

## Helpful Commands

```bash
# Activate virtual environment
source backend/.venv/bin/activate

# Run development server
python manage.py runserver

# Run all tests
python manage.py test

# Run a specific module test
python manage.py test modules.Calculator

# Apply migrations
python manage.py migrate

# Create new migrations after model changes
python manage.py makemigrations

# Install dependencies
pip install -r requirements.txt
```
