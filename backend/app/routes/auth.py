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
    
    # Validación básica simulada
    valid_users = {
        "client": "client_pass",
        "chef": "chef_pass",
        "manager": "manager_pass"
    }
    
    if credentials.username not in valid_users:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if valid_users[credentials.username] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # En producción, aquí se crearía un JWT real
    return LoginResponse(
        access_token="fake_jwt_token_" + credentials.username,
        token_type="bearer",
        role=credentials.role,
        user_id=1
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
