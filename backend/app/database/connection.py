"""
Conexión a base de datos
Aquí se administra la conexión a la base de datos usando SQLAlchemy
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
import logging
from typing import Generator

logger = logging.getLogger(__name__)

# Engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,  # Verificar conexiones antes de usar
    pool_recycle=3600    # Reciclar conexiones cada hora
)

# Factory de sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """Dependency para obtener sesión de BD"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Inicializar base de datos (crear tablas)"""
    try:
        from app.database.models import Base
        Base.metadata.create_all(bind=engine)
        logger.info("Base de datos inicializada")
    except Exception as e:
        logger.error(f"Error inicializando BD: {e}")
        raise

def close_db():
    """Cerrar conexión a BD"""
    engine.dispose()
    logger.info("Conexión a BD cerrada")
