from sqlalchemy import ARRAY, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, unique=True)
    version = Column(String(50))
    description = Column(Text)
    name = Column(String(255), nullable=True)
    profile = Column(String(255), nullable=True)
    labels = Column(ARRAY(String), nullable=True)
    benchmark_refs = Column(ARRAY(String), nullable=True)

    rules = relationship(
        "Rule", back_populates="benchmark", cascade="all, delete-orphan"
    )


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    benchmark_id = Column(Integer, ForeignKey("benchmarks.id"), index=True)

    type = Column(String(100), index=True)
    index = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    reg_key = Column(Text, nullable=True)
    reg_item = Column(Text, nullable=True)
    reg_option = Column(Text, nullable=True)
    audit_policy_subcategory = Column(Text, nullable=True)
    right_type = Column(Text, nullable=True)
    value_data = Column(Text, nullable=True)

    benchmark = relationship("Benchmark", back_populates="rules")
