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

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Login de usuario
    
    Roles disponibles:
    - client: Cliente escaneando QR
    - chef: Cocinero viendo órdenes
    - manager: Manager del restaurant
    """
    
    # Lista de usuarios simulada con su contraseña y su ROL asignado
    valid_users = {
        "client": {"password": "client_pass", "role": "client", "id": 1},
        "chef": {"password": "chef_pass", "role": "chef", "id": 2},
        "manager": {"password": "manager_pass", "role": "manager", "id": 3},
        "camilo": {"password": "camilo_password", "role": "chef", "id": 4},
        "manuel": {"password": "manuel_password", "role": "manager", "id": 5},
        "diego": {"password": "diego_pass", "role": "client", "id": 6},
    }
    
    if credentials.username not in valid_users:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = valid_users[credentials.username]
    if user_data["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # El servidor retorna el ROL real asignado al usuario
    return LoginResponse(
        access_token="fake_jwt_token_" + credentials.username,
        token_type="bearer",
        role=user_data["role"],
        user_id=user_data["id"]
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
