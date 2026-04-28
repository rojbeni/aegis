FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY app/ ./app/
COPY alembic.ini .
COPY migrations/ ./migrations/

# Install dependencies
RUN pip install --no-cache-dir .

COPY entrypoint.sh .
RUN sed -i 's/\r$//' entrypoint.sh
RUN chmod +x entrypoint.sh

# Expose port (for aegis service)
EXPOSE 8000

# Default command
CMD ["./entrypoint.sh"]
