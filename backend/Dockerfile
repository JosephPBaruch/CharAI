# Use an official Python image
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set environment variables from .env
ENV DEBUG=True \
    SECRET_KEY=change-me \
    ALLOWED_HOSTS=127.0.0.1,localhost,192.168.254.93 \
    DATABASE_URL=sqlite:///db.sqlite3

# Set work directory inside the container
WORKDIR /app

# Copy requirements first (better layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the project
COPY . .

# Run database migrations to initialize the database
RUN python manage.py migrate

# Expose port Django will run on
EXPOSE 8000

# Default command: run Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
