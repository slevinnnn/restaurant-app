"""
Esquemas (DTOs) para menú
"""
from pydantic import BaseModel, Field
from typing import Optional, List

class MenuItemDTO(BaseModel):
    """DTO de item de menú"""
    id: int
    name: str
    description: Optional[str]
    price: float
    category: str
    image_url: Optional[str]
    available: bool
    preparation_time: int

class MenuItemCreateDTO(BaseModel):
    """DTO para crear item de menú"""
    name: str = Field(min_length=3)
    description: Optional[str] = None
    price: float = Field(gt=0)
    category: str
    image_url: Optional[str] = None
    available: bool = True
    preparation_time: int = Field(default=15, ge=1)

class MenuItemUpdateDTO(BaseModel):
    """DTO para actualizar item de menú"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None
    preparation_time: Optional[int] = None

class MenuCategoryGroupDTO(BaseModel):
    """DTO para menú agrupado por categoría"""
    category: str
    items: List[MenuItemDTO]

class MenuResponseDTO(BaseModel):
    """DTO para respuesta del menú"""
    id: int
    restaurant_id: str
    items: List[MenuItemDTO]
    updated_at: str
