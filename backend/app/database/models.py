"""
Modelos ORM de SQLAlchemy para la base de datos
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class User(Base):
    """Modelo de usuario"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(20), nullable=False, default="client")  # client, chef, manager, admin
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    orders = relationship("Order", back_populates="created_by_user")
    notifications = relationship("Notification", back_populates="user")

class MenuItem(Base):
    """Modelo de item del menú"""
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # appetizers, main_course, desserts, beverages
    image_url = Column(String(255))
    available = Column(Boolean, default=True)
    preparation_time = Column(Integer, default=15)  # minutos
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="menu_item")

class Table(Base):
    """Modelo de mesa"""
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True)
    table_number = Column(String(50), unique=True, nullable=False, index=True)
    seats = Column(Integer, nullable=False)
    location = Column(String(100))  # Interior, Terraza, etc.
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="table")

class Order(Base):
    """Modelo de orden"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, preparing, ready, completed, cancelled
    total_price = Column(Float)
    customer_name = Column(String(120))
    special_notes = Column(Text)
    chef_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    table = relationship("Table", back_populates="orders")
    created_by_user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")

class OrderItem(Base):
    """Modelo de item en orden"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Precio al momento de la orden
    special_instructions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class Payment(Base):
    """Modelo de pago"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20), nullable=False)  # cash, card, mobile
    status = Column(String(20), nullable=False, default="completed")
    transaction_id = Column(String(120))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="payments")

class Notification(Base):
    """Modelo de notificación"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, warning, error, order, payment
    read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
