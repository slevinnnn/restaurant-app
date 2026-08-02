import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { menusAPI, ordersAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import ClientMenu from './ClientMenu'
import OrderCart from './OrderCart'
import OrderConfirmation from './OrderConfirmation'
import './styles.css'

export default function ClientDashboard() {
  const { logout, tableId } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])

  const orderSocket = useOrderSocket()

  // Cargar menú al montar el componente
  useEffect(() => {
    loadMenu()
    if (tableId) {
      loadActiveOrders()
    }
  }, [tableId])

  const loadActiveOrders = async () => {
    try {
      const response = await ordersAPI.getTableOrders(tableId)
      // Recuperar los pedidos activos y prepararlos para el estado
      if (response.data && response.data.active_orders) {
        const active = response.data.active_orders.map(o => ({
          ...o,
          currentStatus: { status: o.status, message: 'Recuperado de la sesión' }
        }))
        setActiveOrders(active)
      }
    } catch (err) {
      console.error('Error al cargar órdenes activas de la mesa:', err)
    }
  }

  // Escuchar actualizaciones de estado de orden
  useSocketListener('order_status_updated', (data) => {
    console.log('Estado de orden actualizado:', data)
    setActiveOrders((prev) => 
      prev.map((order) => 
        order.id === data.order_id 
          ? { ...order, currentStatus: { status: data.status, message: data.message } } 
          : order
      )
    )
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
      
      setActiveOrders((prev) => [
        ...prev, 
        { ...newOrder, currentStatus: { status: 'pending', message: 'Orden recibida' } }
      ])
      
      setCart([])

      // Emitir evento de orden creada
      orderSocket.createOrder({
        order_id: newOrder.id,
        table_id: newOrder.table_id,
        items: newOrder.items,
        timestamp: new Date().toISOString(),
      })
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
        <div className="header-top">
          <div>
            <h1>🍽️ Menú del Restaurant</h1>
            <p className="table-info">
              Selecciona tus platos para ordenar
            </p>
          </div>
          <button className="logout-btn" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="client-container">
        <ClientMenu items={menuItems} onAddToCart={handleAddToCart} />
        
        <div className="sidebar-container">
          <OrderCart
            items={cart}
            onRemove={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onPlaceOrder={handlePlaceOrder}
          />
          
          {activeOrders.length > 0 && (
            <div className="active-orders-section">
              <h3>Tus Pedidos Activos</h3>
              <div className="active-orders-list">
                {activeOrders.map(order => (
                  <div key={order.id} className={`active-order-card ${order.currentStatus?.status === 'ready' ? 'ready' : ''}`}>
                    <div className="order-header">
                      <h4>Pedido #{order.id}</h4>
                      <span className="order-price">${order.total_price?.toFixed(2)}</span>
                    </div>
                    <p className="order-items-count">{order.items.length} items</p>
                    <div className="order-status-badge">
                      {order.currentStatus?.status === 'pending' && '⏳ Pendiente'}
                      {order.currentStatus?.status === 'preparing' && '👨‍🍳 En Preparación'}
                      {order.currentStatus?.status === 'ready' && '🎉 Listo para retirar'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render modals for newly created orders or ready orders */}
      {activeOrders.map(order => {
        const isReady = order.currentStatus?.status === 'ready'
        const isPending = order.currentStatus?.status === 'pending'
        
        // Show modal if it's just created (pending) OR if it's ready
        // But for pending we might not want it to block if we have the sidebar.
        // Let's only show modal when it's READY.
        if (isReady) {
          return (
            <OrderConfirmation 
              key={`modal-${order.id}`}
              order={order} 
              status={order.currentStatus} 
              onDismiss={async () => {
                // When dismissed, remove from active orders
                setActiveOrders(prev => prev.filter(o => o.id !== order.id))
                // Also update the backend so it doesn't reappear on refresh
                try {
                  await ordersAPI.update(order.id, { status: 'completed' })
                } catch (err) {
                  console.error('Error al completar la orden:', err)
                }
              }}
            />
          )
        }
        return null;
      })}
    </div>
  )
}
