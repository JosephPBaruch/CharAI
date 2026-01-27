# Production-ready Django container
FROM python:3.12-slim

# Keep bytecode out of the image and stdout unbuffered
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system build deps only if needed for Python packages
RUN apt-get update
#  \
    # && apt-get install -y --no-install-recommends build-essential 
    # \
    # && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copy project code
COPY . .

# Drop root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Runtime configuration is passed via environment (DEBUG, SECRET_KEY, ALLOWED_HOSTS, DATABASE_URL)
ENV PORT=8000
EXPOSE 8000

# Serve with gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
