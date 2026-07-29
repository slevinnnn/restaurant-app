"""
Esquemas (DTOs) para mesas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TableCreateDTO(BaseModel):
    """DTO para crear mesa"""
    table_number: str = Field(min_length=1)
    seats: int = Field(ge=1, le=20)
    location: Optional[str] = None

class TableDTO(BaseModel):
    """DTO de mesa"""
    id: int
    table_number: str
    seats: int
    location: Optional[str]
    active_orders_count: int = 0
    created_at: datetime

class TableDetailDTO(TableDTO):
    """DTO detallado de mesa"""
    last_order_time: Optional[datetime] = None
    total_today_orders: int = 0

class TableUpdateDTO(BaseModel):
    """DTO para actualizar mesa"""
    table_number: Optional[str] = None
    seats: Optional[int] = None
    location: Optional[str] = None
