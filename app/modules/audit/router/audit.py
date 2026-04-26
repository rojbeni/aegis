from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.audit import repository, schemas
from app.modules.audit.executor.tasks import run_scan_task

router = APIRouter(prefix="/audits", tags=["audits"])


@router.post("/", response_model=str)
def audit(audit: schemas.AuditCreate):
    task = run_scan_task.delay(audit.benchmark_id, audit.asset_id)
    return task.id


@router.get("/", response_model=List[schemas.AuditInfoOut])
def list_audits(
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100, state: str = None
):
    return repository.list_audits(db, skip=skip, limit=limit, state=state)


@router.get("/{task_id}", response_model=schemas.AuditInfoOut)
def get_audit(task_id: str, db: Session = Depends(get_db)):
    audit = repository.get_audit_by_task_id(db, task_id)
    if not audit:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.get("/{audit_id}/items", response_model=List[schemas.AuditItemOut])
def get_audit_items(audit_id: int, db: Session = Depends(get_db)):
    return repository.get_audit_items(db, audit_id)
