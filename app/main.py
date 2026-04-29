from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import structlog_config
from app.core.database import Base, engine
from app.core.middleware import LoggingMiddleware

# Create database tables
from app.core.settings import settings
from app.modules.asset.router import assets
from app.modules.audit.router import audit
from app.modules.benchmark.router import benchmark

# Create database tables
Base.metadata.create_all(bind=engine)

structlog_config.setup_structlog()

app = FastAPI(title="aegis", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(LoggingMiddleware)


app.include_router(benchmark.router)
app.include_router(audit.router)
app.include_router(assets.router)


@app.get("/")
def root():
    return {"message": "Welcome to STIG Parser and Scanner API"}
