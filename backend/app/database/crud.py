"""
Operaciones CRUD (Create, Read, Update, Delete)
"""
from sqlalchemy.orm import Session
from app.database.models import User, Order, MenuItem, Table, Payment, OrderItem, Notification
from app.schemas.user_schema import UserCreateDTO, UserUpdateDTO
from app.schemas.order_schema import OrderCreateDTO, OrderStatusUpdateDTO
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

# ============ USUARIO CRUD ============

class UserCRUD:
    """CRUD para usuarios"""
    
    @staticmethod
    def create(db: Session, user: UserCreateDTO) -> User:
        """Crear usuario"""
        db_user = User(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            password_hash=user.password  # En producción, hashear la contraseña
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Obtener usuario por ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Obtener usuario por username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Obtener usuario por email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def list_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Listar usuarios"""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, user_id: int, user: UserUpdateDTO) -> Optional[User]:
        """Actualizar usuario"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        update_data = user.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """Eliminar usuario"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        db.delete(db_user)
        db.commit()
        return True

# ============ ORDEN CRUD ============

class OrderCRUD:
    """CRUD para órdenes"""
    
    @staticmethod
    def create(db: Session, order: OrderCreateDTO, user_id: int) -> Order:
        """Crear orden"""
        db_order = Order(
            table_id=order.table_id,
            created_by_id=user_id,
            customer_name=order.customer_name,
            special_notes=order.special_notes
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Optional[Order]:
        """Obtener orden por ID"""
        return db.query(Order).filter(Order.id == order_id).first()
    
    @staticmethod
    def list_by_table(db: Session, table_id: int) -> List[Order]:
        """Listar órdenes de una mesa"""
        return db.query(Order).filter(Order.table_id == table_id).all()
    
    @staticmethod
    def list_by_status(db: Session, status: str) -> List[Order]:
        """Listar órdenes por estado"""
        return db.query(Order).filter(Order.status == status).all()
    
    @staticmethod
    def update_status(db: Session, order_id: int, update: OrderStatusUpdateDTO) -> Optional[Order]:
        """Actualizar estado de orden"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            return None
        
        db_order.status = update.status
        if update.chef_notes:
            db_order.chef_notes = update.chef_notes
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def delete(db: Session, order_id: int) -> bool:
        """Eliminar orden"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            return False
        db.delete(db_order)
        db.commit()
        return True

# ============ MENU ITEM CRUD ============

class MenuItemCRUD:
    """CRUD para items del menú"""
    
    @staticmethod
    def create(db: Session, item_data: dict) -> MenuItem:
        """Crear item"""
        db_item = MenuItem(**item_data)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def get_by_id(db: Session, item_id: int) -> Optional[MenuItem]:
        """Obtener item por ID"""
        return db.query(MenuItem).filter(MenuItem.id == item_id).first()
    
    @staticmethod
    def list_all(db: Session) -> List[MenuItem]:
        """Listar todos los items"""
        return db.query(MenuItem).all()
    
    @staticmethod
    def list_by_category(db: Session, category: str) -> List[MenuItem]:
        """Listar items por categoría"""
        return db.query(MenuItem).filter(MenuItem.category == category).all()
    
    @staticmethod
    def update(db: Session, item_id: int, item_data: dict) -> Optional[MenuItem]:
        """Actualizar item"""
        db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not db_item:
            return None
        
        for field, value in item_data.items():
            if value is not None:
                setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def delete(db: Session, item_id: int) -> bool:
        """Eliminar item"""
        db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not db_item:
            return False
        db.delete(db_item)
        db.commit()
        return True

# ============ PAYMENT CRUD ============

class PaymentCRUD:
    """CRUD para pagos"""
    
    @staticmethod
    def create(db: Session, payment_data: dict) -> Payment:
        """Crear pago"""
        db_payment = Payment(**payment_data)
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    @staticmethod
    def get_by_id(db: Session, payment_id: int) -> Optional[Payment]:
        """Obtener pago por ID"""
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    @staticmethod
    def list_by_order(db: Session, order_id: int) -> List[Payment]:
        """Listar pagos de una orden"""
        return db.query(Payment).filter(Payment.order_id == order_id).all()
