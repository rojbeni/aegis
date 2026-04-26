import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.core.settings import settings
from app.modules.asset.router import assets
from app.modules.audit.router import audit
from app.modules.benchmark.router import benchmark

# Create database tables
Base.metadata.create_all(bind=engine)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",  # Vector will handle the timestamping
    stream=sys.stdout,
)
logging.getLogger("pypsexec").setLevel(logging.WARNING)
logging.getLogger("smbprotocol").setLevel(logging.WARNING)

app = FastAPI(title="aegis", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


app.include_router(benchmark.router)
app.include_router(audit.router)
app.include_router(assets.router)


@app.get("/")
def root():
    return {"message": "Welcome to STIG Parser and Scanner API"}
