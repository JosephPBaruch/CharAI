# Production-ready Django container
FROM python:3.12-slim

# Keep bytecode out of the image and stdout unbuffered
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update

# Install Python deps
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copy project code
COPY . .

# Train the yield prediction model at build time so it is always embedded in
# the image and stays in sync with the code/data.  SECRET_KEY is a throwaway
# value used only to satisfy django.setup(); no database is needed.
ARG OPENTOPOGRAPHY_API_KEY=keykey
RUN SECRET_KEY=build-only-key \
    OPENTOPOGRAPHY_API_KEY=${OPENTOPOGRAPHY_API_KEY} \
    python -u YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py \
    && test -f YieldPredictionModel/Models/yield_model.keras \
    || { echo "ERROR: Model training failed - yield_model.keras not created"; exit 1; }

# Drop root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Runtime configuration is passed via environment (DEBUG, SECRET_KEY, ALLOWED_HOSTS, DATABASE_URL)
ENV PORT=8000
EXPOSE 8000

# Serve with gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "300"]
