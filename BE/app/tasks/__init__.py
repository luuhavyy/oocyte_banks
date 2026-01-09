# app/tasks/__init__.py

from app.tasks.celery_app import celery_app

# Import tasks to register them with Celery
from app.tasks import inference_tasks  # noqa: F401

__all__ = ["celery_app"]