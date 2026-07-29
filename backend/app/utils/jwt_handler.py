"""
Manejo de JWT (JSON Web Tokens)
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class JWTHandler:
    """Manejador de JWT"""
    
    @staticmethod
    def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Crear token JWT"""
        try:
            to_encode = data.copy()
            
            if expires_delta:
                expire = datetime.utcnow() + expires_delta
            else:
                expire = datetime.utcnow() + timedelta(
                    minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
                )
            
            to_encode.update({"exp": expire})
            
            encoded_jwt = jwt.encode(
                to_encode,
                settings.SECRET_KEY,
                algorithm=settings.ALGORITHM
            )
            
            logger.info(f"Token creado para usuario: {data.get('sub')}")
            return encoded_jwt
        
        except Exception as e:
            logger.error(f"Error creando token: {e}")
            raise
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict]:
        """Verificar y decodificar token JWT"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            username: str = payload.get("sub")
            if username is None:
                return None
            
            logger.info(f"Token verificado para usuario: {username}")
            return payload
        
        except JWTError as e:
            logger.error(f"Error verificando token: {e}")
            return None
    
    @staticmethod
    def create_access_token(user_id: int, username: str, role: str) -> str:
        """Crear token de acceso"""
        data = {
            "sub": username,
            "user_id": user_id,
            "role": role
        }
        return JWTHandler.create_token(data)
    
    @staticmethod
    def get_user_from_token(token: str) -> Optional[Dict]:
        """Extraer información del usuario del token"""
        payload = JWTHandler.verify_token(token)
        if not payload:
            return None
        
        return {
            "user_id": payload.get("user_id"),
            "username": payload.get("sub"),
            "role": payload.get("role")
        }

# Instancia global
jwt_handler = JWTHandler()
