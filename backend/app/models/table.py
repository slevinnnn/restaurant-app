"""
Modelo de Mesas/Mesas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TableCreateRequest(BaseModel):
    """Request para crear mesa"""
    table_number: str
    seats: int = Field(1, ge=1, le=20)
    location: Optional[str] = None  # ej: "Terraza", "Interior"
    is_smoking: bool = False

class TableResponse(BaseModel):
    """Response de mesa"""
    id: int
    table_number: str
    seats: int
    location: Optional[str]
    is_smoking: bool = False
    active_orders_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class TableDetailResponse(TableResponse):
    """Response detallado de mesa"""
    last_order_time: Optional[datetime] = None
    total_today_orders: int = 0
