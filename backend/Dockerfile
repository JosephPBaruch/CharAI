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
# The training script enforces a minimum R-squared threshold and will exit
# non-zero if the model does not meet the required accuracy.
# CACHEBUST: pass a unique value (e.g. git SHA, timestamp) to force
# retraining even when no source files have changed.
ARG OPENTOPOGRAPHY_API_KEY=keykey
ARG EARTH_DATA_API_KEY
ARG CACHEBUST
RUN cd YieldPredictionModel \
    && SECRET_KEY=build-only-key \
       OPENTOPOGRAPHY_API_KEY=${OPENTOPOGRAPHY_API_KEY} \
       EARTH_DATA_API_KEY=${EARTH_DATA_API_KEY} \
       python -u CreateAndTrainYieldCalculatorModel.py \
    && test -f Models/yield_model.keras \
    || { echo "ERROR: Model training failed - check accuracy report above for details"; exit 1; }

# Drop root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Runtime configuration is passed via environment (DEBUG, SECRET_KEY, ALLOWED_HOSTS, DATABASE_URL)
ENV PORT=8000
EXPOSE 8000

# Serve with gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "300"]
