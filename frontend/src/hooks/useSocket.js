import { useEffect, useCallback, useRef, useState } from 'react'
import socketService from '../services/socketService'

/**
 * Hook para usar Socket.IO en componentes
 * @returns {Object} Socket service y métodos útiles
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Conectar al servidor si no lo está
    if (!socketService.isConnected()) {
      socketService.connect()
    }

    // Escuchar cambios de conexión
    const handleConnected = () => {
      console.log('✅ useSocket: Conectado')
      setIsConnected(true)
    }

    const handleDisconnected = () => {
      console.log('❌ useSocket: Desconectado')
      setIsConnected(false)
    }

    socketService.on('socket_connected', handleConnected)
    socketService.on('socket_disconnected', handleDisconnected)

    // Estado inicial
    if (socketService.isConnected()) {
      setIsConnected(true)
    }

    return () => {
      socketService.off('socket_connected', handleConnected)
      socketService.off('socket_disconnected', handleDisconnected)
    }
  }, [])

  const emit = useCallback((eventName, data) => {
    socketService.emit(eventName, data)
  }, [])

  const on = useCallback((eventName, callback) => {
    socketService.on(eventName, callback)

    return () => {
      socketService.off(eventName, callback)
    }
  }, [])

  const isConnectedCheck = useCallback(() => {
    return socketService.isConnected()
  }, [])

  return {
    socket: socketService.socket,
    emit,
    on,
    isConnected: isConnectedCheck,
    connected: isConnected,
  }
}

/**
 * Hook para escuchar un evento específico del servidor
 * @param {string} eventName - Nombre del evento
 * @param {function} callback - Función a ejecutar cuando se recibe el evento
 */
export const useSocketListener = (eventName, callback) => {
  const savedCallback = useRef(callback)
  const savedEventName = useRef(eventName)

  // Actualizar callback sin causar re-renders
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Actualizar nombre del evento
  useEffect(() => {
    savedEventName.current = eventName
  }, [eventName])

  // Suscribirse al evento
  useEffect(() => {
    if (!socketService.isConnected()) {
      console.warn(`⚠️ Socket no conectado. Esperando para escuchar: ${eventName}`)
      // Esperar a que se conecte
      const checkConnection = setInterval(() => {
        if (socketService.isConnected()) {
          clearInterval(checkConnection)
          setupListener()
        }
      }, 500)
      return () => clearInterval(checkConnection)
    }

    return setupListener()

    function setupListener() {
      const listener = (data) => {
        if (savedCallback.current) {
          savedCallback.current(data)
        }
      }

      console.log(`👂 Escuchando evento: ${eventName}`)
      socketService.socket.on(eventName, listener)

      return () => {
        console.log(`🔕 Dejando de escuchar: ${eventName}`)
        socketService.socket.off(eventName, listener)
      }
    }
  }, [eventName])
}

/**
 * Hook para emitir eventos de órdenes
 */
export const useOrderSocket = () => {
  const { emit } = useSocket()

  return {
    createOrder: (orderData) => {
      console.log('📤 Creando orden:', orderData)
      emit('order_created', orderData)
    },
    checkStatus: (orderId) => {
      console.log('📤 Verificando estado:', orderId)
      emit('client_checking_status', { order_id: orderId })
    },
    markPreparing: (orderData) => {
      console.log('📤 Marcando en preparación:', orderData)
      emit('order_preparing', orderData)
    },
    markReady: (orderData) => {
      console.log('📤 Marcando lista:', orderData)
      emit('order_ready', orderData)
    },
    requestUpdate: () => {
      console.log('📤 Solicitando actualización')
      emit('manager_requesting_update', {})
    },
    processPayment: (paymentData) => {
      console.log('📤 Procesando pago:', paymentData)
      emit('payment_processed', paymentData)
    },
    requestBill: (billData) => {
      console.log('📤 Solicitando cuenta:', billData)
      emit('request_bill', billData)
    }
  }
}