import logging

from app.core.database import SessionLocal
from app.modules.asset.models import Asset
from app.modules.audit import repository
from app.modules.audit.executor import remote_audit_executor
from app.modules.benchmark.models import Benchmark
from app.worker import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="audits.run")
def run_scan_task(self, benchmark_id: int, asset_id: int):
    db = SessionLocal()
    try:
        benchmark = db.query(Benchmark).filter(Benchmark.id == benchmark_id).first()
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not benchmark or not asset:
            raise ValueError("benchmark or asset not found")
        logger.info(f"executing task with id: {self.request.id}")
        audit_info = repository.initialize_audit(
            db, self.request.id, benchmark.id, asset.id
        )
        audit_items = remote_audit_executor.execute(benchmark=benchmark, asset=asset)
        repository.complete_audit(db, audit_info, audit_items)
        logger.info("scan %s finished successfully", self.request.id)
    except Exception as ex:
        db.rollback()
        logger.exception("scan %s failed in worker", self.request.id)
        try:
            repository.fail_audit(db, self.request.id)
        except Exception:
            logger.error("Could not update task state to FAILURE")
        raise ex
    finally:
        db.close()
