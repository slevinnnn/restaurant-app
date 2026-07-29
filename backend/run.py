#!/usr/bin/env python
"""
Script para ejecutar la aplicación FastAPI
Uso: python run.py
"""
import uvicorn
import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    # Configuración
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"""
    ╔═══════════════════════════════════════╗
    ║  🍽️  Restaurant Order System API     ║
    ║                                       ║
    ║  Iniciando servidor...               ║
    ║  Host: {host:20}  ║
    ║  Port: {port}                          ║
    ║  Debug: {str(debug):18}  ║
    ║                                       ║
    ║  Docs: http://localhost:{port}/docs   ║
    ╚═══════════════════════════════════════╝
    """)
    
    # Ejecutar servidor
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
