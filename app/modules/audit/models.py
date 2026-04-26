from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AuditInfo(Base):
    __tablename__ = "audit_infos"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(255), unique=True, index=True)
    benchmark_id = Column(Integer, ForeignKey("benchmarks.id"), index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    state = Column(String(50), nullable=False, default="PENDING")
    score = Column(Float, nullable=True)

    items = relationship(
        "AuditItem", back_populates="audit_info", cascade="all, delete-orphan"
    )
    asset = relationship("Asset", lazy="joined")
    benchmark = relationship("Benchmark", lazy="joined")

    @property
    def asset_ip(self):
        return self.asset.ip_address if self.asset else None


class AuditItem(Base):
    __tablename__ = "audit_items"

    id = Column(Integer, primary_key=True, index=True)
    audit_info_id = Column(Integer, ForeignKey("audit_infos.id"), index=True)
    rule_id = Column(Integer, ForeignKey("rules.id"), index=True)
    passed = Column(Boolean, nullable=True)
    actual_value = Column(String(500), nullable=True)

    audit_info = relationship("AuditInfo", back_populates="items")
    rule = relationship("Rule", lazy="joined")
