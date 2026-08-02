"""
Main FastAPI application
Sistema de pedidos para restaurant
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

from app.config import settings
from app.socket_events import setup_sio
from app.routes import orders, menus, tables, auth, payments
from app.middleware.error_handler import error_handler_middleware
from app.database.connection import init_db
import socketio

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar las tablas de la base de datos al arrancar
init_db()

# Crear app FastAPI
app = FastAPI(
    title="Restaurant Order System API",
    description="Sistema de gestión de pedidos para restaurants",
    version="1.0.0"
)

# ============ MIDDLEWARES ============

# 1. Error handler (Registrado como middleware HTTP)
@app.middleware("http")
async def custom_error_handling(request, call_next):
    return await error_handler_middleware(request, call_next)

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Trusted Host
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# ============ SOCKET.IO ============
sio = setup_sio(app)

# ============ ROUTES ============
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(menus.router, prefix="/api/v1/menus", tags=["Menus"])
app.include_router(tables.router, prefix="/api/v1/tables", tags=["Tables"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])

# ============ HEALTH CHECK ============
@app.get("/health")
async def health_check():
    """Verificar que la API está viva"""
    return {
        "status": "ok",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Restaurant Order System API",
        "docs": "/docs",
        "version": "1.0.0"
    }

# ============ ERROR HANDLERS ============
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

# Envolver la app de FastAPI en el servidor ASGI de Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )