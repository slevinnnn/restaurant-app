import { useEffect, useCallback, useRef } from 'react'
import socketService from '../services/socketService'

/**
 * Hook para usar Socket.IO en componentes
 * @returns {Object} Socket service y métodos útiles
 */
export const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Conectar al servidor
    socketService.connect()
    socketRef.current = socketService

    return () => {
      // No desconectar aquí para mantener la conexión activa
    }
  }, [])

  const emit = useCallback((eventName, data) => {
    socketRef.current?.emit(eventName, data)
  }, [])

  const on = useCallback((eventName, callback) => {
    socketRef.current?.on(eventName, callback)

    return () => {
      socketRef.current?.off(eventName, callback)
    }
  }, [])

  const isConnected = useCallback(() => {
    return socketRef.current?.isConnected()
  }, [])

  return {
    socket: socketRef.current,
    emit,
    on,
    isConnected,
  }
}

/**
 * Hook para escuchar un evento específico
 */
export const useSocketListener = (eventName, callback) => {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(eventName, callback)

    return () => {
      socket.off(eventName, callback)
    }
  }, [socket, eventName, callback])
}

/**
 * Hook para emitir eventos de órdenes
 */
export const useOrderSocket = () => {
  const { emit } = useSocket()

  return {
    createOrder: (orderData) => emit('order_created', orderData),
    checkStatus: (orderId) => emit('client_checking_status', { order_id: orderId }),
    markPreparing: (orderData) => emit('order_preparing', orderData),
    markReady: (orderData) => emit('order_ready', orderData),
    requestUpdate: () => emit('manager_requesting_update', {}),
    processPayment: (paymentData) => emit('payment_processed', paymentData),
  }
}
