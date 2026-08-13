"""
Rutas para gestión de órdenes
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from app.models.order import (
    OrderCreateRequest,
    OrderResponse,
    OrderDetailResponse,
    OrderUpdate,
    OrderStatus
)
from app.routes.menus import menu_items_db

router = APIRouter()

# Simulación de base de datos en memoria
# En producción, esto vendrá de una BD real
orders_db = {}
order_counter = 1

@router.post("/", response_model=OrderResponse)
async def create_order(order_request: OrderCreateRequest):
    """
    Crear una nueva orden
    
    - **table_id**: ID de la mesa
    - **items**: Lista de items a ordenar
    - **customer_name**: Nombre del cliente (opcional)
    """
    global order_counter
    
    if not order_request.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    
    formatted_items = []
    total_price = 0.0
    
    for idx, item_req in enumerate(order_request.items):
        menu_item = menu_items_db.get(item_req.menu_item_id, {})
        name = menu_item.get("name", f"Plato {item_req.menu_item_id}")
        price = menu_item.get("price", 12.99)
        subtotal = round(price * item_req.quantity, 2)
        total_price += subtotal
        
        formatted_items.append({
            "id": idx + 1,
            "menu_item_id": item_req.menu_item_id,
            "name": name,
            "price": price,
            "quantity": item_req.quantity,
            "subtotal": subtotal,
            "special_instructions": item_req.special_instructions,
        })
    
    now = datetime.now()
    payment_method = order_request.payment_method or "google_pay"
    
    order = {
        "id": order_counter,
        "table_id": order_request.table_id,
        "table_number": f"Mesa {order_request.table_id}",
        "status": OrderStatus.PENDING,
        "items": formatted_items,
        "total_price": round(total_price, 2),
        "created_at": now,
        "updated_at": now,
        "customer_name": order_request.customer_name,
        "special_notes": order_request.special_notes,
        "payment_status": "paid",
        "payment_method": payment_method,
        "paid_at": now,
    }
    
    orders_db[order_counter] = order
    order_counter += 1
    
    return order

@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[OrderStatus] = Query(None),
    table_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Listar todas las órdenes con filtros opcionales
    
    - **status**: Filtrar por estado
    - **table_id**: Filtrar por mesa
    """
    orders = list(orders_db.values())
    
    # Ordenar por fecha de actualización descendente (los más recientes primero)
    orders.sort(key=lambda x: x["updated_at"], reverse=True)
    
    if status:
        orders = [o for o in orders if o["status"] == status]
    if table_id:
        orders = [o for o in orders if o["table_id"] == table_id]
    
    return orders[skip : skip + limit]

@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(order_id: int):
    """Obtener detalles de una orden específica"""
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    return {**order, "created_by": "Sistema"}

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(order_id: int, update: OrderUpdate):
    """
    Actualizar estado de una orden
    
    - **status**: Nuevo estado (pending, confirmed, preparing, ready, completed, cancelled)
    """
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    order["status"] = update.status
    order["updated_at"] = datetime.now()
    
    if update.chef_notes:
        order["chef_notes"] = update.chef_notes
    
    return order

@router.delete("/{order_id}")
async def cancel_order(order_id: int):
    """Cancelar una orden"""
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    if order["status"] == OrderStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a completed order"
        )
    
    order["status"] = OrderStatus.CANCELLED
    return {"message": "Order cancelled successfully", "order_id": order_id}

@router.get("/status/{table_id}")
async def get_table_active_orders(table_id: int):
    """Obtener órdenes activas de una mesa"""
    active_orders = [
        o for o in orders_db.values()
        if o["table_id"] == table_id and o["status"] != OrderStatus.PAID and o["status"] != OrderStatus.CANCELLED
    ]
    return {"table_id": table_id, "active_orders": active_orders}
