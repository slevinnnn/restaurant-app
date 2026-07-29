"""
Rutas para gestión de pagos
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class PaymentRequest(BaseModel):
    order_id: int
    amount: float
    payment_method: str  # "cash", "card", "mobile"
    table_id: int
    discount: Optional[float] = 0.0

class PaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    amount: float
    payment_method: str
    status: str
    timestamp: str

# Pagos simulados en memoria
payments_db = {}
payment_counter = 1

@router.post("/process", response_model=PaymentResponse)
async def process_payment(payment: PaymentRequest):
    """Procesar un pago de una orden"""
    global payment_counter
    
    if payment.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    # Validar método de pago
    if payment.payment_method not in ["cash", "card", "mobile"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    
    payment_data = {
        "payment_id": payment_counter,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "status": "completed",
        "timestamp": "2024-01-01T10:10:00"
    }
    
    payments_db[payment_counter] = payment_data
    payment_counter += 1
    
    return payment_data

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: int):
    """Obtener detalles de un pago"""
    if payment_id not in payments_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payments_db[payment_id]

@router.get("/order/{order_id}")
async def get_order_payments(order_id: int):
    """Obtener pagos de una orden"""
    payments = [p for p in payments_db.values() if p["order_id"] == order_id]
    return {"order_id": order_id, "payments": payments}

@router.get("/daily-summary")
async def get_daily_summary():
    """Obtener resumen de pagos del día"""
    total_sales = sum(p["amount"] for p in payments_db.values())
    total_payments = len(payments_db)
    
    return {
        "date": "2024-01-01",
        "total_sales": total_sales,
        "total_payments": total_payments,
        "average_payment": total_sales / total_payments if total_payments > 0 else 0,
        "by_method": {}
    }
