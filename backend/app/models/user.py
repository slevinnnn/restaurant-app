"""
Modelo de Usuario
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    """Roles disponibles"""
    CLIENT = "client"           # Cliente
    CHEF = "chef"              # Cocinero
    MANAGER = "manager"        # Gerente
    ADMIN = "admin"            # Administrador

class UserCreateRequest(BaseModel):
    """Request para crear usuario"""
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: UserRole = UserRole.CLIENT

class UserResponse(BaseModel):
    """Response de usuario"""
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    """Response detallado de usuario"""
    last_login: Optional[datetime] = None
    total_orders: int = 0

class UserUpdate(BaseModel):
    """Request para actualizar usuario"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
