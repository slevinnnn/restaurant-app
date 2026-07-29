"""
Servicio de notificaciones - Lógica de negocio
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Servicio para gestionar notificaciones"""
    
    def __init__(self):
        self.notifications = {}
        self.notification_counter = 1
    
    def create_notification(self, user_id: int, title: str, message: str, 
                           notification_type: str = "info") -> dict:
        """Crear notificación"""
        try:
            notification = {
                "id": self.notification_counter,
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": notification_type,
                "read": False,
                "created_at": datetime.now().isoformat()
            }
            
            self.notifications[self.notification_counter] = notification
            self.notification_counter += 1
            logger.info(f"Notificación creada: {notification['id']}")
            return notification
        except Exception as e:
            logger.error(f"Error creando notificación: {e}")
            raise
    
    def get_user_notifications(self, user_id: int, unread_only: bool = False) -> List[dict]:
        """Obtener notificaciones del usuario"""
        notifications = [n for n in self.notifications.values() 
                        if n["user_id"] == user_id]
        if unread_only:
            notifications = [n for n in notifications if not n["read"]]
        return sorted(notifications, key=lambda x: x["created_at"], reverse=True)
    
    def mark_as_read(self, notification_id: int) -> Optional[dict]:
        """Marcar notificación como leída"""
        try:
            if notification_id not in self.notifications:
                return None
            self.notifications[notification_id]["read"] = True
            return self.notifications[notification_id]
        except Exception as e:
            logger.error(f"Error marcando notificación: {e}")
            raise
    
    def notify_order_status(self, user_id: int, order_id: int, status: str) -> dict:
        """Notificar cambio de estado de orden"""
        messages = {
            "preparing": "Tu pedido está siendo preparado 👨‍🍳",
            "ready": "¡Tu pedido está listo! 🍽️",
            "completed": "Pedido completado ✅"
        }
        
        return self.create_notification(
            user_id=user_id,
            title=f"Pedido #{order_id}",
            message=messages.get(status, "Actualización de pedido"),
            notification_type="order"
        )
    
    def notify_payment_processed(self, user_id: int, amount: float) -> dict:
        """Notificar pago procesado"""
        return self.create_notification(
            user_id=user_id,
            title="Pago confirmado",
            message=f"Pago de ${amount:.2f} procesado correctamente 💳",
            notification_type="payment"
        )
    
    def delete_notification(self, notification_id: int) -> bool:
        """Eliminar notificación"""
        try:
            if notification_id not in self.notifications:
                return False
            del self.notifications[notification_id]
            return True
        except Exception as e:
            logger.error(f"Error eliminando notificación: {e}")
            raise

# Instancia global
notification_service = NotificationService()
