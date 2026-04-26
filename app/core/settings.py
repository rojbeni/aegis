from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    FRONTEND_ORIGIN: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
