# app/config.py

from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
from datetime import timedelta

# Load file .env
load_dotenv()

class Settings(BaseSettings):
    # --- FIREBASE / AUTH ---
    FIREBASE_CRED_PATH: str = "serviceAccount.json"  
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")    
    JWT_ALG: str = "HS256"
    JWT_EXPIRES: timedelta = timedelta(days=7)
    
    # --- API CONFIG ---
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["*"]  # Allow all origins for simplicity; adjust in production

    # --- STORAGE CONFIG ---
    LOCAL_STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    MAX_IMAGE_WIDTH: int = int(os.getenv("MAX_IMAGE_WIDTH", "1280"))
    
    # --- MODEL CONFIG ---
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/models/model_final.pth")
    MODEL_CONFIDENCE_THRESHOLD: float = float(os.getenv("MODEL_CONFIDENCE_THRESHOLD", "0.5"))
    MODEL_DEVICE: str = os.getenv("MODEL_DEVICE", "cuda")  # "cuda" or "cpu"
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v1.0")
    
    # --- CELERY CONFIG ---
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: list[str] = ["json"]
    CELERY_TIMEZONE: str = "UTC"
    CELERY_ENABLE_UTC: bool = True
    
    # --- INFERENCE CONFIG ---
    INFERENCE_MAX_WORKERS: int = int(os.getenv("INFERENCE_MAX_WORKERS", "2"))  # Parallel workers

    # Class Config: 
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate settings
settings = Settings()