"""
Modelo de Orden
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class OrderStatus(str, Enum):
    """Estados posibles de una orden"""
    PENDING = "pending"           # Pendiente
    CONFIRMED = "confirmed"       # Confirmado por cocina
    PREPARING = "preparing"       # En preparación
    READY = "ready"               # Listo para recoger
    COMPLETED = "completed"       # Entregado
    PAID = "paid"                 # Pagado
    CANCELLED = "cancelled"       # Cancelado

class OrderItemRequest(BaseModel):
    """Item en una orden (request)"""
    menu_item_id: int
    quantity: int = Field(gt=0)
    special_instructions: Optional[str] = None

class OrderItem(BaseModel):
    """Item en una orden (response)"""
    id: int
    menu_item_id: int
    name: str
    price: float
    quantity: int
    subtotal: float
    special_instructions: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreateRequest(BaseModel):
    """Request para crear nueva orden"""
    table_id: int
    items: List[OrderItemRequest] = Field(min_items=1)
    customer_name: Optional[str] = None
    special_notes: Optional[str] = None
    payment_method: Optional[str] = "google_pay"  # "google_pay", "apple_pay", "card"

class OrderUpdate(BaseModel):
    """Request para actualizar estado de orden"""
    status: OrderStatus
    chef_notes: Optional[str] = None

class OrderResponse(BaseModel):
    """Response de orden"""
    id: int
    table_id: int
    table_number: str
    status: OrderStatus
    items: List[OrderItem]
    total_price: float
    created_at: datetime
    updated_at: datetime
    estimated_time: Optional[int] = None  # minutos
    customer_name: Optional[str] = None
    special_notes: Optional[str] = None
    payment_status: Optional[str] = "paid"
    payment_method: Optional[str] = "google_pay"
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderDetailResponse(OrderResponse):
    """Response detallado de orden"""
    created_by: str  # Nombre de quien creó la orden
    chef_notes: Optional[str] = None
    completed_at: Optional[datetime] = None
