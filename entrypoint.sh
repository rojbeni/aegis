#!/bin/bash

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A app.worker:celery_app worker --loglevel=info &

# Start Uvicorn in the foreground
echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
