"""
Middleware de autenticación y validación de JWT
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.utils.jwt_handler import jwt_handler
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware:
    """Middleware de autenticación"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request: Request, call_next):
        """Procesar request y validar autenticación"""
        
        # Skip auth check para ciertos endpoints públicos
        public_endpoints = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/auth/login",
            "/"
        ]
        
        if any(request.url.path.startswith(ep) for ep in public_endpoints):
            return await call_next(request)
        
        # Verificar header Authorization
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            logger.warning(f"Request sin Authorization header: {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authorization header missing"}
            )
        
        try:
            # Extraer token del header
            scheme, token = auth_header.split()
            
            if scheme.lower() != "bearer":
                logger.warning(f"Esquema inválido: {scheme}")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid authentication scheme"}
                )
            
            # Verificar token
            payload = jwt_handler.verify_token(token)
            
            if not payload:
                logger.warning("Token inválido o expirado")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid or expired token"}
                )
            
            # Agregar información del usuario al request
            request.state.user_id = payload.get("user_id")
            request.state.username = payload.get("sub")
            request.state.role = payload.get("role")
            
            logger.debug(f"Autenticación exitosa para usuario: {request.state.username}")
        
        except ValueError:
            logger.error("Formato de Authorization header inválido")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authentication header format"}
            )
        
        except Exception as e:
            logger.error(f"Error en autenticación: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Authentication error"}
            )
        
        response = await call_next(request)
        return response

def require_role(*allowed_roles):
    """Decorator para validar rol de usuario"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            user_role = getattr(request.state, "role", None)
            
            if not user_role or user_role not in allowed_roles:
                logger.warning(
                    f"Acceso denegado para usuario {getattr(request.state, 'username', 'unknown')}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator

def get_current_user(request: Request):
    """Obtener usuario actual del request"""
    user_id = getattr(request.state, "user_id", None)
    username = getattr(request.state, "username", None)
    role = getattr(request.state, "role", None)
    
    if not all([user_id, username, role]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return {
        "user_id": user_id,
        "username": username,
        "role": role
    }
