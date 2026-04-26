from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class RuleBase(BaseModel):
    type: str
    index: Optional[str] = None
    description: Optional[str] = None
    solution: Optional[str] = None
    reg_key: Optional[str] = None
    reg_item: Optional[str] = None
    reg_option: Optional[str] = None
    audit_policy_subcategory: Optional[str] = None
    right_type: Optional[str] = None
    value_data: Optional[str] = None


class AuditCreate(BaseModel):
    benchmark_id: int
    asset_id: int


class Rule(RuleBase):
    id: int
    benchmark_id: int

    class Config:
        from_attributes = True


class Audit(BaseModel):
    rule: Rule
    check_data: str
    actual_value: Optional[str] = None
    passed: Optional[bool] = None


class BenchmarkBase(BaseModel):
    title: str
    version: str
    description: str


class BenchmarkCreate(BenchmarkBase):
    pass


class Benchmark(BenchmarkBase):
    id: int
    rules: List[Rule] = []

    class Config:
        from_attributes = True


class ScanResultOut(BaseModel):
    benchmark_id: Optional[int] = None
    asset_id: Optional[int] = None
    rule_id: str
    passed: bool
    details: str


class AuditItemOut(BaseModel):
    id: int
    rule: Rule
    passed: Optional[bool]
    actual_value: Optional[str]

    class Config:
        from_attributes = True


class AuditInfoOut(BaseModel):
    id: int
    task_id: str
    benchmark_id: int
    asset_id: int
    asset_ip: Optional[str] = None
    created_at: Optional[datetime]
    state: str
    score: Optional[float] = None
    items: List[AuditItemOut] = []

    class Config:
        from_attributes = True
