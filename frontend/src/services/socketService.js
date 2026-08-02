import io from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = {}
    this.isConnecting = false
  }

  connect() {
    // Si ya está conectado, retornar
    if (this.socket && this.socket.connected) {
      console.log('✅ Socket ya conectado')
      return this.socket
    }

    // Si está conectando, esperar
    if (this.isConnecting) {
      console.log('⏳ Socket conectando...')
      return this.socket
    }

    this.isConnecting = true
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

    console.log(`🔌 Intentando conectar a: ${socketUrl}`)

    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
      forceNew: false,
    })

    // ============ EVENTOS DE CONEXIÓN ============

    this.socket.on('connect', () => {
      this.isConnecting = false
      console.log('✅ Conectado al servidor WebSocket')
      console.log('🔑 Socket ID:', this.socket.id)
      this.emitLocal('socket_connected', { id: this.socket.id })
    })

    this.socket.on('disconnect', () => {
      this.isConnecting = false
      console.log('❌ Desconectado del servidor WebSocket')
      this.emitLocal('socket_disconnected')
    })

    this.socket.on('connect_error', (error) => {
      this.isConnecting = false
      console.error('❌ Error de conexión:', error.message)
    })

    this.socket.on('reconnect_attempt', () => {
      console.log('🔄 Reintentando conexión...')
    })

    this.socket.on('error', (error) => {
      console.error('❌ Error del socket:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
      console.log('🛑 Socket desconectado manualmente')
    }
  }

  // ============ EVENTOS A EMITIR ============

  /**
   * Crear nueva orden
   */
  createOrder(orderData) {
    console.log('📤 Emitiendo: order_created', orderData)
    this.socket?.emit('order_created', orderData)
  }

  /**
   * Verificar estado de orden
   */
  checkOrderStatus(orderId) {
    console.log('📤 Emitiendo: client_checking_status', orderId)
    this.socket?.emit('client_checking_status', { order_id: orderId })
  }

  /**
   * Marcar orden como "en preparación"
   */
  markOrderPreparing(orderData) {
    console.log('📤 Emitiendo: order_preparing', orderData)
    this.socket?.emit('order_preparing', orderData)
  }

  /**
   * Marcar orden como "lista"
   */
  markOrderReady(orderData) {
    console.log('📤 Emitiendo: order_ready', orderData)
    this.socket?.emit('order_ready', orderData)
  }

  /**
   * Solicitar actualización de órdenes
   */
  requestOrdersUpdate() {
    console.log('📤 Emitiendo: manager_requesting_update')
    this.socket?.emit('manager_requesting_update', {})
  }

  /**
   * Procesar pago
   */
  processPayment(paymentData) {
    console.log('📤 Emitiendo: payment_processed', paymentData)
    this.socket?.emit('payment_processed', paymentData)
  }

  // ============ LISTENER SYSTEM ============

  /**
   * Suscribirse a un evento del servidor
   */
  on(eventName, callback) {
    console.log(`👂 Escuchando evento: ${eventName}`)

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName].push(callback)

    // Suscribirse en el socket si está conectado
    if (this.socket && this.socket.connected) {
      this.socket.on(eventName, (data) => {
        console.log(`📨 Recibido evento: ${eventName}`, data)
        callback(data)
      })
    } else if (this.socket) {
      // Si no está conectado pero existe el socket, suscribirse igual
      this.socket.on(eventName, (data) => {
        console.log(`📨 Recibido evento: ${eventName}`, data)
        callback(data)
      })
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
   * Emitir evento personalizado (interno)
   */
  emitLocal(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => {
        callback(data)
      })
    }
  }

  /**
   * Emitir evento al servidor
   */
  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      console.log(`📤 Emitiendo: ${eventName}`, data)
      this.socket.emit(eventName, data)
    } else {
      console.warn(`⚠️ Socket no conectado. No se puede emitir: ${eventName}`)
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

  /**
   * Esperar a que se conecte
   */
  async waitForConnection(timeout = 5000) {
    if (this.isConnected()) {
      return true
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(false)
      }, timeout)

      this.on('socket_connected', () => {
        clearTimeout(timer)
        resolve(true)
      })
    })
  }
}

// Exportar instancia única
export default new SocketService()