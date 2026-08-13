"""
Manejadores de eventos WebSocket con Socket.IO
"""
from socketio import AsyncServer, AsyncNamespace
from fastapi import FastAPI
import logging
import json

logger = logging.getLogger(__name__)

# Diccionario para mantener track de clientes conectados
connected_clients = {
    'clients': {},      # {sid: {'role': 'client', 'table_id': 1}}
    'chefs': {},        # {sid: {'role': 'chef'}}
    'managers': {},     # {sid: {'role': 'manager'}}
}

class RestaurantNamespace(AsyncNamespace):
    """Namespace para eventos del restaurant"""
    
    async def on_connect(self, sid, environ):
        """Cliente conectado"""
        logger.info(f"Client {sid} connected")
        print(f"✅ Cliente conectado: {sid}")
        
        # Notificar que hay un nuevo cliente
        await self.server.emit('client_connected', {'sid': sid})
    
    async def on_disconnect(self, sid):
        """Cliente desconectado"""
        logger.info(f"Client {sid} disconnected")
        print(f"❌ Cliente desconectado: {sid}")
        
        # Remover de registro
        if sid in connected_clients['clients']:
            del connected_clients['clients'][sid]
        if sid in connected_clients['chefs']:
            del connected_clients['chefs'][sid]
        if sid in connected_clients['managers']:
            del connected_clients['managers'][sid]
        
        print(f"📊 Clientes conectados: {len(connected_clients['clients'])}")
        print(f"👨‍🍳 Chefs conectados: {len(connected_clients['chefs'])}")
        print(f"📊 Managers conectados: {len(connected_clients['managers'])}")
    
    # ============ REGISTRO DE ROL ============
    async def on_register_role(self, sid, data):
        """Cliente se registra con su rol"""
        role = data.get('role')
        logger.info(f"Client {sid} registered as {role}")
        print(f"🏷️ Cliente {sid} registrado como: {role}")
        
        if role == 'client':
            connected_clients['clients'][sid] = {
                'role': 'client',
                'table_id': data.get('table_id'),
                'sid': sid
            }
        elif role == 'chef':
            connected_clients['chefs'][sid] = {
                'role': 'chef',
                'sid': sid
            }
        elif role == 'manager':
            connected_clients['managers'][sid] = {
                'role': 'manager',
                'sid': sid
            }
        
        print(f"📊 Estado actual:")
        print(f"  👥 Clientes: {len(connected_clients['clients'])}")
        print(f"  👨‍🍳 Chefs: {len(connected_clients['chefs'])}")
        print(f"  📊 Managers: {len(connected_clients['managers'])}")
    
    # ============ EVENTOS DE CLIENTE ============
    async def on_order_created(self, sid, data):
        """Cliente crea nueva orden"""
        logger.info(f"New order from {sid}: {data}")
        print(f"📝 Nueva orden: {data}")
        
        # Guardar información del cliente que creó la orden
        if sid in connected_clients['clients']:
            connected_clients['clients'][sid]['last_order_id'] = data.get('order_id')
        
        # Notificar a TODOS los Chefs
        print(f"📢 Notificando a {len(connected_clients['chefs'])} chefs...")
        await self.server.emit(
            'order_created',
            {
                'order_id': data.get('order_id'),
                'table_id': data.get('table_id'),
                'items': data.get('items'),
                'timestamp': data.get('timestamp'),
                'payment_method': data.get('payment_method', 'google_pay'),
                'payment_status': data.get('payment_status', 'paid'),
                'client_sid': sid  # Guardar SID del cliente para respuestas
            },
            skip_sid=sid
        )
        
        # Notificar a TODOS los Managers
        print(f"📢 Notificando a {len(connected_clients['managers'])} managers...")
        await self.server.emit(
            'dashboard:update',
            {
                'order_id': data.get('order_id'),
                'table_id': data.get('table_id'),
                'status': 'pending',
                'timestamp': data.get('timestamp')
            },
            skip_sid=sid
        )
    
    async def on_order_cancelled(self, sid, data):
        """Cliente cancela una orden"""
        logger.info(f"Order cancelled by {sid}: {data}")
        print(f"🗑️ Orden cancelada: {data}")
        
        # Notificar a TODOS para que actualicen sus tableros
        await self.server.emit(
            'dashboard:update',
            {
                'order_id': data.get('order_id'),
                'status': 'cancelled',
            },
            skip_sid=sid
        )
    
    async def on_client_checking_status(self, sid, data):
        """Cliente verifica estado de su pedido"""
        logger.info(f"Client {sid} checking order status: {data}")
        print(f"👀 Cliente verificando estado: {data}")
        
    async def on_request_bill(self, sid, data):
        """Cliente solicita la cuenta"""
        logger.info(f"Client {sid} requesting bill: {data}")
        print(f"💵 Cliente solicitando cuenta: {data}")
        
        # Notificar a Managers
        print(f"📢 Notificando a {len(connected_clients['managers'])} managers sobre solicitud de cuenta...")
        await self.server.emit(
            'bill_requested',
            data,
            skip_sid=sid
        )
    
    # ============ EVENTOS DE COCINERO ============
    async def on_order_preparing(self, sid, data):
        """Cocinero marca orden como 'en preparación'"""
        logger.info(f"Chef {sid} marking order as preparing: {data}")
        print(f"👨‍🍳 Orden en preparación: {data}")
        
        # Notificar a TODOS los clientes
        payload = {
            'order_id': data.get('order_id'),
            'status': 'preparing',
            'message': 'Tu pedido está siendo preparado 👨‍🍳',
            'table_id': data.get('table_id')
        }
        print(f"📢 Notificando a {len(connected_clients['clients'])} clientes...")
        await self.server.emit('order_status_updated', payload)
        
        # Notificar a Managers
        print(f"📢 Notificando a {len(connected_clients['managers'])} managers...")
        await self.server.emit('dashboard:update', {
            'order_id': data.get('order_id'),
            'status': 'preparing',
            'table_id': data.get('table_id')
        })
    
    async def on_order_ready(self, sid, data):
        """Cocinero marca orden como 'lista'"""
        logger.info(f"Chef {sid} marking order as ready: {data}")
        print(f"✅ Orden lista: {data}")
        
        # Notificar a TODOS los clientes
        payload = {
            'order_id': data.get('order_id'),
            'status': 'ready',
            'message': '¡Tu pedido está listo! 🎉 Por favor pasa a recogerlo',
            'table_id': data.get('table_id')
        }
        print(f"📢 Notificando a {len(connected_clients['clients'])} clientes...")
        await self.server.emit('order_status_updated', payload)
        
        # Notificar a Managers
        print(f"📢 Notificando a {len(connected_clients['managers'])} managers...")
        await self.server.emit('order_ready_notification', {
            'order_id': data.get('order_id'),
            'table_id': data.get('table_id')
        })
        await self.server.emit('dashboard:update', {
            'order_id': data.get('order_id'),
            'status': 'ready',
            'table_id': data.get('table_id')
        })
    
    # ============ EVENTOS DE MANAGER ============
    async def on_manager_requesting_update(self, sid, data):
        """Manager solicita actualización de todas las órdenes"""
        logger.info(f"Manager {sid} requesting orders update")
        print(f"📊 Manager solicitando actualización")
        
        # Aquí se enviarían todas las órdenes activas desde la BD
        await self.emit(
            'orders_update',
            {'message': 'Actualización de órdenes'},
            to=sid
        )
    
    async def on_payment_processed(self, sid, data):
        """Manager procesa pago de una mesa"""
        logger.info(f"Manager {sid} processed payment: {data}")
        print(f"💳 Pago procesado: {data}")
        
        # Notificar a TODOS (especialmente al cliente de esa mesa)
        payload = {
            'order_ids': data.get('order_ids'),
            'amount': data.get('amount'),
            'message': 'Pago registrado, ¡gracias por tu visita! 😊',
            'table_id': data.get('table_id')
        }
        print(f"📢 Notificando a todos sobre pago procesado...")
        await self.server.emit('payment_confirmed', payload)
        
        # Notificar al dashboard
        await self.server.emit('dashboard:update', {
            'order_ids': data.get('order_ids'),
            'status': 'paid',
            'table_id': data.get('table_id')
        })

def setup_sio(app: FastAPI):
    """Configurar Socket.IO con FastAPI"""
    
    # Crear instancia de AsyncServer
    sio = AsyncServer(
        async_mode='asgi',
        cors_allowed_origins='*',
        logger=True,
        engineio_logger=True
    )
    
    # Registrar namespace
    sio.register_namespace(RestaurantNamespace('/'))
    
    return sio
