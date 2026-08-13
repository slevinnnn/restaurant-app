"""
Modelo de Menú y Items del menú
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class MenuCategory(str, Enum):
    """Categorías de menú"""
    APPETIZERS = "appetizers"
    MAIN_COURSE = "main_course"
    DESSERTS = "desserts"
    BEVERAGES = "beverages"
    ALCOHOLIC = "alcoholic"
    COCKTAILS = "cocktails"

class MenuItemCreateRequest(BaseModel):
    """Request para crear item de menú"""
    name: str
    description: Optional[str] = None
    price: float = Field(gt=0)
    category: MenuCategory
    image_url: Optional[str] = None
    available: bool = True
    preparation_time: int = Field(15, description="Tiempo estimado en minutos")

class MenuItemResponse(BaseModel):
    """Response de item de menú"""
    id: int
    name: str
    description: Optional[str]
    price: float
    category: MenuCategory
    image_url: Optional[str]
    available: bool
    preparation_time: int

    class Config:
        from_attributes = True

class MenuResponse(BaseModel):
    """Response del menú completo"""
    id: int
    restaurant_id: str
    items: List[MenuItemResponse]
    updated_at: str

    class Config:
        from_attributes = True

class MenuCategoryGroup(BaseModel):
    """Items agrupados por categoría"""
    category: MenuCategory
    items: List[MenuItemResponse]
