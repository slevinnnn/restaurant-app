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
    5: {
        "id": 5,
        "name": "Mojito Clásico",
        "description": "Ron blanco, menta fresca, lima, azúcar de caña y soda",
        "price": 7.99,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 4
    },
    6: {
        "id": 6,
        "name": "Mojito de Sabores",
        "description": "Mojito artesanal a elección: Maracuyá, Frutilla o Mango con ron blanco",
        "price": 8.50,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 5
    },
    7: {
        "id": 7,
        "name": "Cuba Libre",
        "description": "Ron añejo premium, Coca-Cola y rodajas de limón fresco",
        "price": 6.99,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 3
    },
    8: {
        "id": 8,
        "name": "Piscola (Piscula)",
        "description": "Pisco chileno reservado con bebida cola y abundante hielo",
        "price": 6.50,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 3
    },
    9: {
        "id": 9,
        "name": "Clavo Oxidado",
        "description": "Whisky Escocés y Licor Drambuie en las rocas con piel de naranja",
        "price": 9.50,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 4
    },
    10: {
        "id": 10,
        "name": "Caipirinha",
        "description": "Cachaça brasileña, lima fresca macerada con azúcar de caña",
        "price": 7.50,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1587223075270-3d1850727457?auto=format&fit=crop&w=600&q=80",
        "available": True,
        "preparation_time": 4
    },
    11: {
        "id": 11,
        "name": "Piña Colada",
        "description": "Ron blanco, crema de coco batida y jugo natural de piña recién batido",
        "price": 8.00,
        "category": MenuCategory.COCKTAILS,
        "image_url": "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=600&q=80",
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
