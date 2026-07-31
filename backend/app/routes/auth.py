"""
Rutas para autenticación
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str  # "client", "chef", "manager"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

class QRLoginRequest(BaseModel):
    customer_name: str
    table_id: int

class QRLoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    customer_name: str
    table_id: int

# Lista de usuarios simulada con su contraseña y su ROL asignado
valid_users = {
    "client": {"password": "client_pass", "role": "client", "id": 1},
    "chef": {"password": "chef_pass", "role": "chef", "id": 2},
    "manager": {"password": "manager_pass", "role": "manager", "id": 3},
    "camilo": {"password": "camilo_password", "role": "chef", "id": 4},
    "manuel": {"password": "manuel_password", "role": "manager", "id": 5},
    "diego": {"password": "diego_pass", "role": "client", "id": 6},
}

user_counter = 1000

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Login de usuario
    
    Roles disponibles:
    - client: Cliente escaneando QR
    - chef: Cocinero viendo órdenes
    - manager: Manager del restaurant
    """
    if credentials.username not in valid_users:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = valid_users[credentials.username]
    if user_data["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return LoginResponse(
        access_token="fake_jwt_token_" + credentials.username,
        token_type="bearer",
        role=user_data["role"],
        user_id=user_data["id"]
    )

@router.post("/qr-login", response_model=QRLoginResponse)
async def qr_login(request: QRLoginRequest):
    """
    Login de cliente mediante QR para una mesa específica
    """
    global user_counter
    
    # Generar un nombre de usuario único para la sesión (internamente)
    username = f"guest_{request.customer_name.lower().replace(' ', '_')}_{user_counter}"
    
    # Registrar el nuevo usuario en la base de datos en memoria
    valid_users[username] = {
        "password": "qr_password", # No se usará, pero para mantener la estructura
        "role": "client",
        "id": user_counter,
        "customer_name": request.customer_name,
        "table_id": request.table_id
    }
    
    user_counter += 1
    
    return QRLoginResponse(
        access_token="fake_jwt_token_" + username,
        token_type="bearer",
        role="client",
        user_id=valid_users[username]["id"],
        customer_name=request.customer_name,
        table_id=request.table_id
    )

@router.get("/verify")
async def verify_token(token: str = None):
    """Verificar que un token sea válido"""
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    if not token.startswith("fake_jwt_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"valid": True, "username": token.replace("fake_jwt_token_", "")}

@router.post("/logout")
async def logout():
    """Logout (invalidar token)"""
    return {"message": "Logged out successfully"}
