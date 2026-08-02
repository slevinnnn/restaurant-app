"""
Rutas para gestión de mesas
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.table import TableCreateRequest, TableResponse

router = APIRouter()

# Mesas simuladas en memoria
from datetime import datetime

tables_db = {
    1: {"id": 1, "table_number": "Mesa 1", "seats": 4, "location": "Interior", "is_smoking": False, "active_orders_count": 0, "created_at": datetime.now()},
    2: {"id": 2, "table_number": "Mesa 2", "seats": 6, "location": "Interior", "is_smoking": False, "active_orders_count": 0, "created_at": datetime.now()},
    3: {"id": 3, "table_number": "Mesa 3", "seats": 2, "location": "Terraza", "is_smoking": True, "active_orders_count": 0, "created_at": datetime.now()},
    4: {"id": 4, "table_number": "Mesa 4", "seats": 8, "location": "Interior", "is_smoking": False, "active_orders_count": 0, "created_at": datetime.now()},
    5: {"id": 5, "table_number": "Mesa 5", "seats": 4, "location": "Terraza", "is_smoking": True, "active_orders_count": 0, "created_at": datetime.now()},
    6: {"id": 6, "table_number": "Mesa 6", "seats": 2, "location": "Interior", "is_smoking": False, "active_orders_count": 0, "created_at": datetime.now()},
    7: {"id": 7, "table_number": "Mesa 7", "seats": 6, "location": "Terraza", "is_smoking": True, "active_orders_count": 0, "created_at": datetime.now()},
    8: {"id": 8, "table_number": "Mesa 8", "seats": 10, "location": "Interior VIP", "is_smoking": False, "active_orders_count": 0, "created_at": datetime.now()},
}

@router.get("/", response_model=List[TableResponse])
async def list_tables():
    """Listar todas las mesas"""
    return list(tables_db.values())

@router.get("/{table_id}", response_model=TableResponse)
async def get_table(table_id: int):
    """Obtener detalles de una mesa específica"""
    if table_id not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    return tables_db[table_id]

@router.post("/", response_model=TableResponse)
async def create_table(table_request: TableCreateRequest):
    """Crear nueva mesa"""
    new_id = max(tables_db.keys(), default=0) + 1
    
    new_table = {
        "id": new_id,
        "table_number": table_request.table_number,
        "seats": table_request.seats,
        "location": table_request.location,
        "is_smoking": table_request.is_smoking,
        "active_orders_count": 0,
        "created_at": datetime.now()
    }
    
    tables_db[new_id] = new_table
    return new_table

@router.put("/{table_id}", response_model=TableResponse)
async def update_table(table_id: int, table_request: TableCreateRequest):
    """Actualizar información de mesa"""
    if table_id not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    tables_db[table_id].update({
        "table_number": table_request.table_number,
        "seats": table_request.seats,
        "location": table_request.location,
        "is_smoking": table_request.is_smoking,
    })
    
    return tables_db[table_id]

@router.delete("/{table_id}")
async def delete_table(table_id: int):
    """Eliminar mesa"""
    if table_id not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    del tables_db[table_id]
    return {"message": "Table deleted successfully"}
