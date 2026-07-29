"""
Constantes globales de la aplicación
"""

# ============ ROLES DE USUARIO ============
ROLE_CLIENT = "client"
ROLE_CHEF = "chef"
ROLE_MANAGER = "manager"
ROLE_ADMIN = "admin"

VALID_ROLES = [ROLE_CLIENT, ROLE_CHEF, ROLE_MANAGER, ROLE_ADMIN]

# ============ ESTADOS DE ORDEN ============
ORDER_STATUS_PENDING = "pending"           # Pendiente
ORDER_STATUS_CONFIRMED = "confirmed"       # Confirmada
ORDER_STATUS_PREPARING = "preparing"       # En preparación
ORDER_STATUS_READY = "ready"              # Lista
ORDER_STATUS_COMPLETED = "completed"       # Completada
ORDER_STATUS_CANCELLED = "cancelled"       # Cancelada

VALID_ORDER_STATUSES = [
    ORDER_STATUS_PENDING,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_PREPARING,
    ORDER_STATUS_READY,
    ORDER_STATUS_COMPLETED,
    ORDER_STATUS_CANCELLED
]

# ============ CATEGORÍAS DE MENÚ ============
MENU_CATEGORY_APPETIZERS = "appetizers"     # Entrada
MENU_CATEGORY_MAIN_COURSE = "main_course"   # Plato Principal
MENU_CATEGORY_DESSERTS = "desserts"         # Postres
MENU_CATEGORY_BEVERAGES = "beverages"       # Bebidas
MENU_CATEGORY_ALCOHOLIC = "alcoholic"       # Bebidas Alcohólicas

VALID_MENU_CATEGORIES = [
    MENU_CATEGORY_APPETIZERS,
    MENU_CATEGORY_MAIN_COURSE,
    MENU_CATEGORY_DESSERTS,
    MENU_CATEGORY_BEVERAGES,
    MENU_CATEGORY_ALCOHOLIC
]

# ============ MÉTODOS DE PAGO ============
PAYMENT_METHOD_CASH = "cash"
PAYMENT_METHOD_CARD = "card"
PAYMENT_METHOD_MOBILE = "mobile"

VALID_PAYMENT_METHODS = [
    PAYMENT_METHOD_CASH,
    PAYMENT_METHOD_CARD,
    PAYMENT_METHOD_MOBILE
]

# ============ TIPOS DE NOTIFICACIÓN ============
NOTIFICATION_TYPE_INFO = "info"
NOTIFICATION_TYPE_WARNING = "warning"
NOTIFICATION_TYPE_ERROR = "error"
NOTIFICATION_TYPE_ORDER = "order"
NOTIFICATION_TYPE_PAYMENT = "payment"

VALID_NOTIFICATION_TYPES = [
    NOTIFICATION_TYPE_INFO,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_ORDER,
    NOTIFICATION_TYPE_PAYMENT
]

# ============ PAGINACIÓN ============
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# ============ TIEMPOS (en segundos) ============
TOKEN_EXPIRATION_MINUTES = 30
WEBSOCKET_HEARTBEAT_INTERVAL = 30

# ============ MENSAJES DE ERROR ============
ERROR_INVALID_CREDENTIALS = "Credenciales inválidas"
ERROR_USER_NOT_FOUND = "Usuario no encontrado"
ERROR_ORDER_NOT_FOUND = "Orden no encontrada"
ERROR_MENU_ITEM_NOT_FOUND = "Item del menú no encontrado"
ERROR_TABLE_NOT_FOUND = "Mesa no encontrada"
ERROR_UNAUTHORIZED = "No autorizado"
ERROR_FORBIDDEN = "Acceso denegado"

# ============ MENSAJES DE ÉXITO ============
SUCCESS_ORDER_CREATED = "Orden creada exitosamente"
SUCCESS_ORDER_UPDATED = "Orden actualizada exitosamente"
SUCCESS_PAYMENT_PROCESSED = "Pago procesado exitosamente"
