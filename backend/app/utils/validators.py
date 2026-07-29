"""
Funciones de validación personalizadas
"""
from app.utils.constants import VALID_ROLES, VALID_ORDER_STATUSES, VALID_MENU_CATEGORIES
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Excepción de validación"""
    pass

def validate_role(role: str) -> bool:
    """Validar rol de usuario"""
    if role not in VALID_ROLES:
        raise ValidationError(f"Rol inválido: {role}. Roles válidos: {VALID_ROLES}")
    return True

def validate_order_status(status: str) -> bool:
    """Validar estado de orden"""
    if status not in VALID_ORDER_STATUSES:
        raise ValidationError(f"Estado inválido: {status}")
    return True

def validate_menu_category(category: str) -> bool:
    """Validar categoría de menú"""
    if category not in VALID_MENU_CATEGORIES:
        raise ValidationError(f"Categoría inválida: {category}")
    return True

def validate_email(email: str) -> bool:
    """Validar formato de email"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError(f"Email inválido: {email}")
    return True

def validate_password(password: str) -> bool:
    """Validar contraseña"""
    if len(password) < 6:
        raise ValidationError("La contraseña debe tener al menos 6 caracteres")
    if not any(c.isupper() for c in password):
        logger.warning("Contraseña sin mayúsculas")
    if not any(c.isdigit() for c in password):
        logger.warning("Contraseña sin números")
    return True

def validate_price(price: float) -> bool:
    """Validar precio"""
    if price <= 0:
        raise ValidationError("El precio debe ser mayor a 0")
    return True

def validate_quantity(quantity: int) -> bool:
    """Validar cantidad"""
    if quantity <= 0:
        raise ValidationError("La cantidad debe ser mayor a 0")
    if quantity > 100:
        raise ValidationError("La cantidad no puede exceder 100")
    return True

def validate_order_items(items: List[dict]) -> bool:
    """Validar items de una orden"""
    if not items or len(items) == 0:
        raise ValidationError("La orden debe tener al menos un item")
    
    for item in items:
        if "menu_item_id" not in item or "quantity" not in item:
            raise ValidationError("Cada item debe tener menu_item_id y quantity")
        
        validate_quantity(item["quantity"])
    
    return True

def validate_table_number(table_number: str) -> bool:
    """Validar número de mesa"""
    if not table_number or len(table_number.strip()) == 0:
        raise ValidationError("Número de mesa no puede estar vacío")
    if len(table_number) > 50:
        raise ValidationError("Número de mesa muy largo")
    return True

def validate_seats(seats: int) -> bool:
    """Validar cantidad de asientos"""
    if seats < 1 or seats > 20:
        raise ValidationError("La cantidad de asientos debe estar entre 1 y 20")
    return True

def validate_username(username: str) -> bool:
    """Validar nombre de usuario"""
    if len(username) < 3:
        raise ValidationError("El nombre de usuario debe tener al menos 3 caracteres")
    if len(username) > 50:
        raise ValidationError("El nombre de usuario no puede exceder 50 caracteres")
    
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        raise ValidationError("El nombre de usuario solo puede contener letras, números, - y _")
    
    return True

def validate_full_name(full_name: str) -> bool:
    """Validar nombre completo"""
    if len(full_name) < 2:
        raise ValidationError("El nombre debe tener al menos 2 caracteres")
    if len(full_name) > 120:
        raise ValidationError("El nombre no puede exceder 120 caracteres")
    return True

def validate_all_order_statuses(statuses: List[str]) -> bool:
    """Validar múltiples estados de orden"""
    for status in statuses:
        validate_order_status(status)
    return True
