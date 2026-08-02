import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { ordersAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import OrderQueue from './OrderQueue'
import './styles.css'

export default function ChefDashboard() {
  const { logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [notification, setNotification] = useState(null)

  const orderSocket = useOrderSocket()

  // Cargar órdenes al montar
  useEffect(() => {
    loadOrders()
  }, [])

  // Auto-cerrar notificaciones después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Escuchar nuevas órdenes
  useSocketListener('order_created', (data) => {
    console.log('Nueva orden:', data)
    setNotification({
      type: 'new_order',
      message: `Nueva orden #${data.order_id} - Mesa ${data.table_id}`,
    })
    loadOrders()
  })

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.list()
      setOrders(response.data)
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPreparing = async (orderId) => {
    try {
      await ordersAPI.update(orderId, {
        status: 'preparing',
        chef_notes: 'En preparación',
      })

      orderSocket.markPreparing({ order_id: orderId })
      loadOrders()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleMarkReady = async (orderId) => {
    try {
      await ordersAPI.update(orderId, {
        status: 'ready',
        chef_notes: 'Listo para entregar',
      })

      const order = orders.find((o) => o.id === orderId)
      orderSocket.markReady({
        order_id: orderId,
        table_id: order?.table_id,
        client_sid: order?.client_socket_id,
      })

      loadOrders()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Agrupar órdenes por estado
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  const readyOrders = orders.filter((o) => o.status === 'ready' || o.status === 'completed')

  return (
    <div className="chef-dashboard">
      <header className="chef-header">
        <div className="header-top">
          <h1>👨‍🍳 Área de Cocina</h1>
          <button className="logout-btn" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{pendingOrders.length}</span>
            <span className="stat-label">Por confirmar</span>
          </div>
          <div className="stat">
            <span className="stat-value">{preparingOrders.length}</span>
            <span className="stat-label">En preparación</span>
          </div>
          <div className="stat">
            <span className="stat-value">{readyOrders.length}</span>
            <span className="stat-label">Listas</span>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando órdenes...</div>
      ) : (
        <div className="chef-container">
          <OrderQueue
            title="📋 Nuevas Órdenes"
            orders={pendingOrders}
            status="pending"
            onAction={(orderId) => handleMarkPreparing(orderId)}
            actionLabel="Empezar"
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />

          <OrderQueue
            title="👨‍🍳 En Preparación"
            orders={preparingOrders}
            status="preparing"
            onAction={(orderId) => handleMarkReady(orderId)}
            actionLabel="Listo"
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            accentColor="orange"
          />

          <OrderQueue
            title="✅ Listas / Entregadas"
            orders={readyOrders}
            status="ready"
            onAction={() => {}}
            actionLabel="Entregado"
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            accentColor="green"
            disableAction
          />
        </div>
      )}

      {selectedOrder && (
        <div className="order-detail-modal" onClick={() => setSelectedOrder(null)}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
            <h2>Detalles Orden #{selectedOrder.id}</h2>

            <div className="detail-section">
              <p>
                <strong>Mesa:</strong> {selectedOrder.table_number}
              </p>
              <p>
                <strong>Estado:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Items:</strong> {selectedOrder.items?.length || 0}
              </p>
            </div>

            {selectedOrder.items && (
              <div className="detail-section">
                <h3>Artículos:</h3>
                <ul>
                  {selectedOrder.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.name}
                      {item.special_instructions && (
                        <p className="instructions">
                          📝 {item.special_instructions}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedOrder.special_notes && (
              <div className="detail-section">
                <h3>Notas especiales:</h3>
                <p className="notes">{selectedOrder.special_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
