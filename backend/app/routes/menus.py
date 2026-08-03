"""
Rutas para gestión de menús
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.menu import (
    MenuItemResponse,
    MenuItemCreateRequest,
    MenuCategoryGroup,
    MenuCategory
)

router = APIRouter()

# Menú simulado en memoria
menu_items_db = {
    1: {
        "id": 1,
        "name": "Hamburguesa Clásica",
        "description": "Hamburguesa con queso, lechuga, tomate",
        "price": 9.99,
        "category": MenuCategory.MAIN_COURSE,
        "image_url": "/images/burger.png",
        "available": True,
        "preparation_time": 15
    },
    2: {
        "id": 2,
        "name": "Pasta Carbonara",
        "description": "Pasta italiana con salsa de huevo y tocino",
        "price": 12.99,
        "category": MenuCategory.MAIN_COURSE,
        "image_url": "/images/pasta.png",
        "available": True,
        "preparation_time": 20
    },
    3: {
        "id": 3,
        "name": "Coca Cola",
        "description": "Refresco clásico",
        "price": 2.99,
        "category": MenuCategory.BEVERAGES,
        "image_url": "/images/cola.png",
        "available": True,
        "preparation_time": 1
    },
    4: {
        "id": 4,
        "name": "Tiramisú",
        "description": "Postre italiano tradicional",
        "price": 6.99,
        "category": MenuCategory.DESSERTS,
        "image_url": "/images/tiramisu.png",
        "available": True,
        "preparation_time": 5
    },
}

@router.get("/", response_model=List[MenuItemResponse])
async def get_menu():
    """Obtener menú completo"""
    return list(menu_items_db.values())

@router.get("/grouped")
async def get_menu_grouped() -> List[MenuCategoryGroup]:
    """Obtener menú agrupado por categoría"""
    categories = {}
    
    for item in menu_items_db.values():
        cat = item["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    return [
        MenuCategoryGroup(category=cat, items=items)
        for cat, items in categories.items()
    ]

@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: int):
    """Obtener detalle de un item del menú"""
    if item_id not in menu_items_db:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    return menu_items_db[item_id]

@router.post("/", response_model=MenuItemResponse)
async def create_menu_item(item_request: MenuItemCreateRequest):
    """Crear nuevo item en el menú (solo admin)"""
    new_id = max(menu_items_db.keys(), default=0) + 1
    
    new_item = {
        "id": new_id,
        **item_request.dict()
    }
    
    menu_items_db[new_id] = new_item
    return new_item

@router.put("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: int, item_request: MenuItemCreateRequest):
    """Actualizar item del menú (solo admin)"""
    if item_id not in menu_items_db:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    menu_items_db[item_id] = {
        "id": item_id,
        **item_request.dict()
    }
    
    return menu_items_db[item_id]

@router.delete("/{item_id}")
async def delete_menu_item(item_id: int):
    """Eliminar item del menú (solo admin)"""
    if item_id not in menu_items_db:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    del menu_items_db[item_id]
    return {"message": "Menu item deleted successfully"}

@router.patch("/{item_id}/availability")
async def toggle_item_availability(item_id: int, available: bool):
    """Cambiar disponibilidad de un item"""
    if item_id not in menu_items_db:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    menu_items_db[item_id]["available"] = available
    return {"message": "Availability updated", "item_id": item_id, "available": available}
