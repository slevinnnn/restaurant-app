import io from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = {}
  }

  connect() {
    if (this.socket) {
      return this.socket
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'
    
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor')
      this.emit('connected', { id: this.socket.id })
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor')
      this.emit('disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // ============ EVENTOS DE CLIENTE ============
  
  /**
   * Crear nueva orden
   */
  createOrder(orderData) {
    return this.emit('order_created', orderData)
  }

  /**
   * Verificar estado de orden
   */
  checkOrderStatus(orderId) {
    return this.emit('client_checking_status', { order_id: orderId })
  }

  // ============ EVENTOS DE COCINERO ============
  
  /**
   * Marcar orden como "en preparación"
   */
  markOrderPreparing(orderData) {
    return this.emit('order_preparing', orderData)
  }

  /**
   * Marcar orden como "lista"
   */
  markOrderReady(orderData) {
    return this.emit('order_ready', orderData)
  }

  // ============ EVENTOS DE MANAGER ============
  
  /**
   * Solicitar actualización de órdenes
   */
  requestOrdersUpdate() {
    return this.emit('manager_requesting_update', {})
  }

  /**
   * Procesar pago
   */
  processPayment(paymentData) {
    return this.emit('payment_processed', paymentData)
  }

  // ============ LISTENER SYSTEM ============
  
  /**
   * Suscribirse a un evento
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName].push(callback)

    // También suscribirse en el socket si está conectado
    if (this.socket) {
      this.socket.on(eventName, callback)
    }
  }

  /**
   * Desuscribirse de un evento
   */
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      )
    }
    if (this.socket) {
      this.socket.off(eventName, callback)
    }
  }

  /**
   * Emitir evento personalizado
   */
  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data)
    }
  }

  /**
   * Obtener estado de conexión
   */
  isConnected() {
    return this.socket && this.socket.connected
  }

  /**
   * Obtener ID del socket
   */
  getId() {
    return this.socket?.id || null
  }
}

// Exportar instancia única
export default new SocketService()
