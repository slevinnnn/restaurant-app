import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { menusAPI, ordersAPI } from '../../services/api'
import ClientMenu from './ClientMenu'
import OrderCart from './OrderCart'
import OrderConfirmation from './OrderConfirmation'
import './styles.css'

export default function ClientDashboard() {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderCreated, setOrderCreated] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)

  const orderSocket = useOrderSocket()

  // Cargar menú al montar el componente
  useEffect(() => {
    loadMenu()
  }, [])

  // Escuchar actualizaciones de estado de orden
  useSocketListener('order_status_updated', (data) => {
    console.log('Estado de orden actualizado:', data)
    setOrderStatus(data)
  })

  const loadMenu = async () => {
    try {
      setLoading(true)
      const response = await menusAPI.list()
      setMenuItems(response.data)
    } catch (err) {
      setError('Error al cargar el menú: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id)

      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }

      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const handleRemoveFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== itemId))
  }

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId)
    } else {
      setCart((prevCart) =>
        prevCart.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      )
    }
  }

  const handlePlaceOrder = async (orderData) => {
    try {
      const response = await ordersAPI.create(orderData)
      const newOrder = response.data

      setOrderCreated(newOrder)
      setShowOrderConfirmation(true)
      setCart([])

      // Emitir evento de orden creada
      orderSocket.createOrder({
        order_id: newOrder.id,
        table_id: newOrder.table_id,
        items: newOrder.items,
        timestamp: new Date().toISOString(),
      })

      // Limpiar después de 5 segundos
      setTimeout(() => setShowOrderConfirmation(false), 5000)
    } catch (err) {
      setError('Error al crear la orden: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="client-dashboard loading">
        <div className="spinner">Cargando menú...</div>
      </div>
    )
  }

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <h1>🍽️ Menú del Restaurant</h1>
        <p className="table-info">
          {orderStatus?.message || 'Selecciona tus platos'}
        </p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="client-container">
        <ClientMenu items={menuItems} onAddToCart={handleAddToCart} />
        <OrderCart
          items={cart}
          onRemove={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      {showOrderConfirmation && orderCreated && (
        <OrderConfirmation order={orderCreated} status={orderStatus} />
      )}
    </div>
  )
}
