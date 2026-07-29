"""
Esquemas (DTOs) para órdenes
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItemDTO(BaseModel):
    """DTO de item en orden"""
    id: int
    menu_item_id: int
    name: str
    price: float
    quantity: int
    subtotal: float
    special_instructions: Optional[str] = None

class OrderCreateDTO(BaseModel):
    """DTO para crear orden"""
    table_id: int
    items: List[dict] = Field(min_items=1)
    customer_name: Optional[str] = None
    special_notes: Optional[str] = None

class OrderResponseDTO(BaseModel):
    """DTO para respuesta de orden"""
    id: int
    table_id: int
    table_number: str
    status: str
    items: List[OrderItemDTO]
    total_price: float
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None

class OrderStatusUpdateDTO(BaseModel):
    """DTO para actualizar estado de orden"""
    status: str
    chef_notes: Optional[str] = None

class OrderListDTO(BaseModel):
    """DTO para listar órdenes"""
    id: int
    table_number: str
    status: str
    total_price: float
    created_at: datetime
    items_count: int
