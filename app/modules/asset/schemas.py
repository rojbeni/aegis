from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class AssetBase(BaseModel):
    hostname: str
    ip_address: Optional[str] = None
    os: Optional[str] = None
    active: bool = True
    auto_scan: bool = False


class AssetCreate(AssetBase):
    pass


class Asset(AssetBase):
    id: int
    last_seen_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssetPaginated(BaseModel):
    items: List[Asset]
    total: int
