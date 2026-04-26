from sqlalchemy.orm import Session

from app.modules.audit.models import AuditInfo, AuditItem


def initialize_audit(
    db: Session, task_id: str, benchmark_id: int, asset_id: int
) -> AuditInfo:
    """
    Initializes an audit record in the database with a RUNNING state.
    """
    audit_info = AuditInfo(
        task_id=task_id,
        benchmark_id=benchmark_id,
        asset_id=asset_id,
        state="RUNNING",
    )
    db.add(audit_info)
    db.flush()
    db.commit()
    return audit_info


def complete_audit(db: Session, audit_info: AuditInfo, items: list[AuditItem]) -> None:
    """
    Saves audit items, associates them with the audit info, and marks the audit as SUCCESS.
    Calculates the success percentage (score).
    """
    passed_count = 0
    total_count = len(items)

    for item in items:
        item.audit_info_id = audit_info.id
        db.add(item)
        if item.passed:
            passed_count += 1
    audit_info.state = "SUCCESS"
    if total_count > 0:
        audit_info.score = (passed_count / total_count) * 100
    else:
        audit_info.score = 0.0
    db.commit()


def fail_audit(db: Session, task_id: str) -> None:
    """
    Marks an audit as FAILURE in the database.
    """
    try:
        audit_info = db.query(AuditInfo).filter(AuditInfo.task_id == task_id).first()
        if audit_info:
            audit_info.state = "FAILURE"
            db.commit()
    except Exception:
        # If we can't update the state, we just log it (logging should be handled by caller)
        raise


def list_audits(
    db: Session, skip: int = 0, limit: int = 100, state: str = None
) -> list[AuditInfo]:
    """
    Retrieves a list of audits from the database.
    """
    query = db.query(AuditInfo)
    if state:
        query = query.filter(AuditInfo.state == state)
    return query.order_by(AuditInfo.created_at.desc()).offset(skip).limit(limit).all()


def get_audit_by_task_id(db: Session, task_id: str) -> AuditInfo:
    """
    Retrieves a single audit record by its task ID.
    """
    return db.query(AuditInfo).filter(AuditInfo.task_id == task_id).first()


def get_audit_items(db: Session, audit_id: int) -> list[AuditItem]:
    """
    Retrieves all audit items for a specific audit info ID.
    """
    return db.query(AuditItem).filter(AuditItem.audit_info_id == audit_id).all()
