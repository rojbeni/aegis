"""
celery_app.py
-------------
Celery application factory for Aegis.

Start a worker (Windows requires --pool=solo):
    celery -A app.core.celery_app:celery_app worker --loglevel=info --pool=solo
"""

import logging

from celery import Celery

from app.core.settings import settings

logging.getLogger("pypsexec").setLevel(logging.WARNING)
logging.getLogger("smbprotocol").setLevel(logging.WARNING)

celery_app = Celery(
    "aegis",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.modules.audit.executor.tasks"],
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
