from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# In-memory database for bill requests
bill_requests_db = []
bill_request_counter = 1

class BillRequestCreate(BaseModel):
    table_id: int
    table_number: str
    request_type: str # 'individual' or 'mesa_completa'
    customer_name: Optional[str] = None

class BillRequestResponse(BaseModel):
    id: int
    table_id: int
    table_number: str
    request_type: str
    customer_name: Optional[str] = None
    created_at: str

@router.post("/", response_model=BillRequestResponse)
async def create_bill_request(request: BillRequestCreate):
    global bill_request_counter
    
    # Comprobar si ya existe una petición igual pendiente
    for req in bill_requests_db:
        if req["table_id"] == request.table_id and req["request_type"] == request.request_type and req["customer_name"] == request.customer_name:
            # Return existing request to avoid duplicates
            return req
            
    new_request = {
        "id": bill_request_counter,
        "table_id": request.table_id,
        "table_number": request.table_number,
        "request_type": request.request_type,
        "customer_name": request.customer_name,
        "created_at": datetime.now().isoformat()
    }
    
    bill_requests_db.append(new_request)
    bill_request_counter += 1
    
    return new_request

@router.get("/", response_model=List[BillRequestResponse])
async def get_bill_requests():
    return bill_requests_db

@router.delete("/{request_id}")
async def delete_bill_request(request_id: int):
    global bill_requests_db
    
    original_len = len(bill_requests_db)
    bill_requests_db = [req for req in bill_requests_db if req["id"] != request_id]
    
    if len(bill_requests_db) == original_len:
        raise HTTPException(status_code=404, detail="Bill request not found")
        
    return {"message": "Bill request deleted successfully"}

@router.delete("/table/{table_id}")
async def clear_table_bill_requests(table_id: int):
    global bill_requests_db
    bill_requests_db = [req for req in bill_requests_db if req["table_id"] != table_id]
    return {"message": f"Bill requests for table {table_id} cleared"}
