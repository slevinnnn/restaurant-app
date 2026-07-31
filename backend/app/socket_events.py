"""
Manejadores de eventos WebSocket con Socket.IO
"""
from socketio import AsyncServer, AsyncNamespace
from fastapi import FastAPI
from aiohttp import web
import logging

logger = logging.getLogger(__name__)

class RestaurantNamespace(AsyncNamespace):
    """Namespace para eventos del restaurant"""
    
    async def on_connect(self, sid, environ):
        """Cliente conectado"""
        logger.info(f"Client {sid} connected")
        print(f"✅ Cliente conectado: {sid}")
    
    async def on_disconnect(self, sid):
        """Cliente desconectado"""
        logger.info(f"Client {sid} disconnected")
        print(f"❌ Cliente desconectado: {sid}")
    
    # ============ EVENTOS DE CLIENTE ============
    async def on_order_created(self, sid, data):
        """Cliente crea nueva orden"""
        logger.info(f"New order from {sid}: {data}")
        print(f"📝 Nueva orden: {data}")
        
        # Notificar a todos los cocineros (Chef)
        await self.emit(
            'order_created',
            {
                'order_id': data.get('order_id'),
                'table_id': data.get('table_id'),
                'items': data.get('items'),
                'timestamp': data.get('timestamp')
            },
            skip_sid=sid
        )
        
        # Notificar al tablero del Manager
        await self.emit(
            'dashboard:update',
            {
                'order_id': data.get('order_id'),
                'table_id': data.get('table_id'),
                'timestamp': data.get('timestamp')
            },
            skip_sid=sid
        )
    
    async def on_client_checking_status(self, sid, data):
        """Cliente verifica estado de su pedido"""
        logger.info(f"Client {sid} checking order status: {data}")
        print(f"👀 Cliente verificando estado: {data}")
    
    # ============ EVENTOS DE COCINERO ============
    async def on_order_preparing(self, sid, data):
        """Cocinero marca orden como "en preparación\""""
        logger.info(f"Chef {sid} marking order as preparing: {data}")
        print(f"👨‍🍳 Orden en preparación: {data}")
        
        # Notificar a cliente
        payload = {
            'order_id': data.get('order_id'),
            'status': 'preparing',
            'message': 'Tu pedido está siendo preparado'
        }
        if data.get('client_sid'):
            await self.emit('order_status_updated', payload, to=data.get('client_sid'))
        else:
            await self.emit('order_status_updated', payload)
            
        # Notificar al Manager
        await self.emit('dashboard:update', {'order_id': data.get('order_id')})
    
    async def on_order_ready(self, sid, data):
        """Cocinero marca orden como "lista\""""
        logger.info(f"Chef {sid} marking order as ready: {data}")
        print(f"✅ Orden lista: {data}")
        
        # Notificar a cliente
        payload = {
            'order_id': data.get('order_id'),
            'status': 'ready',
            'message': '¡Tu pedido está listo! Por favor pasa a recogerlo'
        }
        if data.get('client_sid'):
            await self.emit('order_status_updated', payload, to=data.get('client_sid'))
        else:
            await self.emit('order_status_updated', payload)
        
        # Notificar a manager
        await self.emit('order_ready_notification', {'order_id': data.get('order_id'), 'table_id': data.get('table_id')})
        await self.emit('dashboard:update', {'order_id': data.get('order_id')})
    
    # ============ EVENTOS DE MANAGER ============
    async def on_manager_requesting_update(self, sid, data):
        """Manager solicita actualización de todas las órdenes"""
        logger.info(f"Manager {sid} requesting orders update")
        print(f"📊 Manager solicitando actualización")
        
        # Aquí se enviarían todas las órdenes activas
        await self.emit(
            'orders_update',
            {'message': 'Actualización de órdenes'},
            to=sid
        )
    
    async def on_payment_processed(self, sid, data):
        """Manager procesa pago de una mesa"""
        logger.info(f"Manager {sid} processed payment: {data}")
        print(f"💳 Pago procesado: {data}")
        
        # Notificar a cliente
        await self.emit(
            'payment_confirmed',
            {
                'order_id': data.get('order_id'),
                'amount': data.get('amount'),
                'message': 'Pago registrado, ¡gracias por tu visita!'
            },
            to=data.get('client_sid')
        )

def setup_sio(app: FastAPI):
    """Configurar Socket.IO con FastAPI"""
    
    # Crear instancia de AsyncServer
    sio = AsyncServer(
        async_mode='asgi',
        cors_allowed_origins=['*'],
        logger=True,
        engineio_logger=True
    )
    
    # Registrar namespace
    sio.register_namespace(RestaurantNamespace('/'))
    
    # Crear aplicación ASGI combinada
    app_socketio = web.AppRunner(web.Application())
    
    return sio
