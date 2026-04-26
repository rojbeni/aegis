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


class RuleCreate(RuleBase):
    pass


class Rule(RuleBase):
    id: int
    benchmark_id: int

    class Config:
        from_attributes = True


class BenchmarkBase(BaseModel):
    title: str
    version: str
    description: str
    name: Optional[str] = None
    profile: Optional[str] = None
    labels: Optional[List[str]] = None
    benchmark_refs: Optional[List[str]] = None


class BenchmarkCreate(BenchmarkBase):
    pass


class Benchmark(BenchmarkBase):
    id: int
    rules: List[Rule] = []

    class Config:
        from_attributes = True


class ScanResultOut(BaseModel):
    rule_id: str
    passed: bool
    details: str
