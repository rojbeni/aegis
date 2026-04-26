from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(255), index=True)
    ip_address = Column(String(50), index=True, nullable=True)
    os = Column(String(100), nullable=True)
    active = Column(Boolean, default=True)
    auto_scan = Column(Boolean, default=False)
