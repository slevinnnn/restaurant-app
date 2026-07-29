"""
Servicio de órdenes - Lógica de negocio
"""
from typing import List, Optional
from app.models.order import OrderStatus
import logging

logger = logging.getLogger(__name__)

class OrderService:
    """Servicio para gestionar órdenes"""
    
    def __init__(self):
        self.orders = {}
        self.order_counter = 1
    
    def create_order(self, table_id: int, items: List[dict], customer_name: Optional[str] = None) -> dict:
        """Crear nueva orden"""
        try:
            order = {
                "id": self.order_counter,
                "table_id": table_id,
                "status": OrderStatus.PENDING,
                "items": items,
                "customer_name": customer_name,
                "created_at": "2024-01-01T10:00:00"
            }
            self.orders[self.order_counter] = order
            self.order_counter += 1
            logger.info(f"Orden creada: {order['id']}")
            return order
        except Exception as e:
            logger.error(f"Error creando orden: {e}")
            raise
    
    def get_order(self, order_id: int) -> Optional[dict]:
        """Obtener orden por ID"""
        return self.orders.get(order_id)
    
    def list_orders(self, status: Optional[str] = None) -> List[dict]:
        """Listar órdenes con filtro opcional"""
        orders = list(self.orders.values())
        if status:
            orders = [o for o in orders if o["status"] == status]
        return orders
    
    def update_order_status(self, order_id: int, new_status: str) -> Optional[dict]:
        """Actualizar estado de orden"""
        try:
            if order_id not in self.orders:
                return None
            self.orders[order_id]["status"] = new_status
            logger.info(f"Orden {order_id} actualizada a {new_status}")
            return self.orders[order_id]
        except Exception as e:
            logger.error(f"Error actualizando orden: {e}")
            raise
    
    def cancel_order(self, order_id: int) -> bool:
        """Cancelar orden"""
        try:
            if order_id not in self.orders:
                return False
            order = self.orders[order_id]
            if order["status"] == OrderStatus.COMPLETED:
                return False
            order["status"] = OrderStatus.CANCELLED
            logger.info(f"Orden {order_id} cancelada")
            return True
        except Exception as e:
            logger.error(f"Error cancelando orden: {e}")
            raise
    
    def get_order_total(self, order_id: int) -> Optional[float]:
        """Obtener total de una orden"""
        order = self.get_order(order_id)
        if not order:
            return None
        return sum(item.get("price", 0) * item.get("quantity", 0) 
                   for item in order.get("items", []))

# Instancia global
order_service = OrderService()
