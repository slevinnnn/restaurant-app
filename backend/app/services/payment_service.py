"""
Servicio de pagos - Lógica de negocio
"""
from typing import Optional, Dict, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    """Servicio para gestionar pagos"""
    
    def __init__(self):
        self.payments = {}
        self.payment_counter = 1
    
    def process_payment(self, order_id: int, amount: float, 
                       payment_method: str, table_id: int) -> dict:
        """Procesar pago"""
        try:
            if amount <= 0:
                raise ValueError("Monto debe ser mayor a 0")
            
            payment = {
                "id": self.payment_counter,
                "order_id": order_id,
                "amount": amount,
                "payment_method": payment_method,
                "table_id": table_id,
                "status": "completed",
                "created_at": datetime.now().isoformat()
            }
            
            self.payments[self.payment_counter] = payment
            self.payment_counter += 1
            logger.info(f"Pago procesado: {payment['id']} - ${amount}")
            return payment
        except Exception as e:
            logger.error(f"Error procesando pago: {e}")
            raise
    
    def get_payment(self, payment_id: int) -> Optional[dict]:
        """Obtener pago por ID"""
        return self.payments.get(payment_id)
    
    def get_order_payments(self, order_id: int) -> List[dict]:
        """Obtener pagos de una orden"""
        return [p for p in self.payments.values() if p["order_id"] == order_id]
    
    def get_daily_summary(self) -> Dict:
        """Obtener resumen diario de pagos"""
        total_sales = sum(p["amount"] for p in self.payments.values())
        total_payments = len(self.payments)
        
        by_method = {}
        for payment in self.payments.values():
            method = payment["payment_method"]
            if method not in by_method:
                by_method[method] = 0
            by_method[method] += payment["amount"]
        
        return {
            "date": datetime.now().date().isoformat(),
            "total_sales": total_sales,
            "total_payments": total_payments,
            "average_payment": total_sales / total_payments if total_payments > 0 else 0,
            "by_method": by_method
        }
    
    def validate_payment_method(self, method: str) -> bool:
        """Validar método de pago"""
        valid_methods = ["cash", "card", "mobile"]
        return method in valid_methods

# Instancia global
payment_service = PaymentService()
