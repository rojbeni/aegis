import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.benchmark import models
from app.modules.benchmark.dao import save_to_db
from app.modules.benchmark.parser.audit_file_parser import parse
from app.modules.benchmark.schemas import Benchmark

router = APIRouter(prefix="/benchmarks", tags=["benchmarks"])


@router.post("/import", response_model=Benchmark)
async def import_benchmark(file: UploadFile = File(...), db: Session = Depends(get_db)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        parse_result = parse(temp_path)
        if not parse_result:
            raise HTTPException(status_code=400, detail="Invalid audit file format")
        benchmark_info, rules = parse_result
        benchmark = save_to_db(benchmark_info, rules, db)
        return benchmark
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/", response_model=List[Benchmark])
def read_benchmarks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    benchmarks = db.query(models.Benchmark).offset(skip).limit(limit).all()
    return benchmarks


@router.get("/{benchmark_id}", response_model=Benchmark)
def read_benchmark(benchmark_id: int, db: Session = Depends(get_db)):
    benchmark = (
        db.query(models.Benchmark).filter(models.Benchmark.id == benchmark_id).first()
    )
    if benchmark is None:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    return benchmark
