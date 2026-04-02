# Backend Setup

This guide outlines how to initialize and manage a Django backend environment using `venv` and `requirements.txt`.

## Authentication System

- Token + Session-based authentication
- SQLite database (`db.sqlite3`)
- User registration, login, logout, user info endpoints
- Password hashing with Django's PBKDF2
- CORS enabled for React frontend

**See `implementation for frontend.md` for full API documentation**

---

## Setup for Backend (Run once to get the requirements in your python)

Windows

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## Initialization

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install django djangorestframework

# Create a new Django project
django-admin startproject <project_name> .
```

---

## Environment Activation

```bash
source .venv/bin/activate
```

To deactivate:

```bash
deactivate
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# .env
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
```

> Add `.env` to your `.gitignore` to keep secrets out of version control.

---

## Database Migrations & Run Server

```bash
python manage.py migrate
python manage.py runserver
```

Visit the local server at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## Freeze Dependencies

To capture the current environment dependencies:

```bash
pip freeze > requirements.txt
```

---

## Summary

- Virtual environment: `.venv`
- Project root: `config/`
- Main commands:
  - `python manage.py migrate`
  - `python manage.py runserver`
  - `pip freeze > requirements.txt`

---
