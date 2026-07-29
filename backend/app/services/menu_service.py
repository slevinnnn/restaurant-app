"""
Servicio de menú - Lógica de negocio
"""
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class MenuService:
    """Servicio para gestionar menú"""
    
    def __init__(self):
        self.menu_items = {
            1: {"id": 1, "name": "Hamburguesa", "price": 9.99, "category": "main_course", "available": True},
            2: {"id": 2, "name": "Pasta", "price": 12.99, "category": "main_course", "available": True},
        }
        self.item_counter = 3
    
    def get_all_items(self) -> List[dict]:
        """Obtener todos los items del menú"""
        return list(self.menu_items.values())
    
    def get_item(self, item_id: int) -> Optional[dict]:
        """Obtener item específico"""
        return self.menu_items.get(item_id)
    
    def create_item(self, item_data: dict) -> dict:
        """Crear nuevo item"""
        try:
            new_item = {**item_data, "id": self.item_counter}
            self.menu_items[self.item_counter] = new_item
            self.item_counter += 1
            logger.info(f"Item creado: {new_item['name']}")
            return new_item
        except Exception as e:
            logger.error(f"Error creando item: {e}")
            raise
    
    def update_item(self, item_id: int, item_data: dict) -> Optional[dict]:
        """Actualizar item"""
        try:
            if item_id not in self.menu_items:
                return None
            self.menu_items[item_id].update(item_data)
            logger.info(f"Item {item_id} actualizado")
            return self.menu_items[item_id]
        except Exception as e:
            logger.error(f"Error actualizando item: {e}")
            raise
    
    def delete_item(self, item_id: int) -> bool:
        """Eliminar item"""
        try:
            if item_id not in self.menu_items:
                return False
            del self.menu_items[item_id]
            logger.info(f"Item {item_id} eliminado")
            return True
        except Exception as e:
            logger.error(f"Error eliminando item: {e}")
            raise
    
    def toggle_availability(self, item_id: int, available: bool) -> Optional[dict]:
        """Cambiar disponibilidad de item"""
        try:
            if item_id not in self.menu_items:
                return None
            self.menu_items[item_id]["available"] = available
            logger.info(f"Item {item_id} disponibilidad: {available}")
            return self.menu_items[item_id]
        except Exception as e:
            logger.error(f"Error actualizando disponibilidad: {e}")
            raise
    
    def get_by_category(self, category: str) -> List[dict]:
        """Obtener items por categoría"""
        return [item for item in self.menu_items.values() 
                if item.get("category") == category]

# Instancia global
menu_service = MenuService()
