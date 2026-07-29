"""
Esquemas (DTOs) para usuarios
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreateDTO(BaseModel):
    """DTO para crear usuario"""
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: str = "client"

class UserDTO(BaseModel):
    """DTO de usuario"""
    id: int
    username: str
    email: str
    full_name: str
    role: str
    active: bool
    created_at: datetime

class UserDetailDTO(UserDTO):
    """DTO detallado de usuario"""
    last_login: Optional[datetime] = None
    total_orders: int = 0

class UserUpdateDTO(BaseModel):
    """DTO para actualizar usuario"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class LoginDTO(BaseModel):
    """DTO para login"""
    username: str
    password: str
    role: str

class TokenDTO(BaseModel):
    """DTO para token JWT"""
    access_token: str
    token_type: str
    role: str
    user_id: int
