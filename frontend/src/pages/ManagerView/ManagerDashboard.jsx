import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { ordersAPI, paymentsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import OrdersTable from './OrdersTable'
import PaymentModal from './PaymentModal'
import Statistics from './Statistics'
import './styles.css'

export default function ManagerDashboard() {
  const { logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [stats, setStats] = useState({})

  const orderSocket = useOrderSocket()

  // Cargar órdenes y estadísticas
  useEffect(() => {
    loadOrders()
    loadStats()
  }, [])

  // Escuchar actualizaciones en tiempo real
  useSocketListener('dashboard:update', () => {
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

  const loadStats = async () => {
    try {
      const response = await paymentsAPI.getDailySummary()
      setStats(response.data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const handleProcessPayment = async (paymentData) => {
    try {
      await paymentsAPI.process(paymentData)

      orderSocket.processPayment({
        order_id: selectedOrder.id,
        amount: paymentData.amount,
        client_sid: selectedOrder.client_socket_id,
      })

      setShowPaymentModal(false)
      setSelectedOrder(null)
      loadOrders()
      loadStats()
    } catch (error) {
      console.error('Error al procesar pago:', error)
    }
  }

  // Filtrar órdenes por estado
  const filteredOrders =
    selectedStatus === null
      ? orders
      : orders.filter((o) => o.status === selectedStatus)

  return (
    <div className="manager-dashboard">
      <header className="manager-header">
        <div className="header-top">
          <div>
            <h1>📊 Panel de Gerente</h1>
            <p>Gestión general del restaurant</p>
          </div>
          <button className="logout-btn" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <Statistics stats={stats} totalOrders={orders.length} />

      <div className="manager-content">
        <div className="filters">
          <button
            className={`filter-btn ${selectedStatus === null ? 'active' : ''}`}
            onClick={() => setSelectedStatus(null)}
          >
            Todas ({orders.length})
          </button>
          <button
            className={`filter-btn ${
              selectedStatus === 'pending' ? 'active' : ''
            }`}
            onClick={() => setSelectedStatus('pending')}
          >
            Pendientes (
            {orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${
              selectedStatus === 'preparing' ? 'active' : ''
            }`}
            onClick={() => setSelectedStatus('preparing')}
          >
            En Preparación (
            {orders.filter((o) => o.status === 'preparing').length})
          </button>
          <button
            className={`filter-btn ${selectedStatus === 'ready' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ready')}
          >
            Listas ({orders.filter((o) => o.status === 'ready').length})
          </button>
          <button
            className={`filter-btn ${
              selectedStatus === 'completed' ? 'active' : ''
            }`}
            onClick={() => setSelectedStatus('completed')}
          >
            Completadas (
            {orders.filter((o) => o.status === 'completed').length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Cargando órdenes...</div>
        ) : (
          <OrdersTable
            orders={filteredOrders}
            onSelectOrder={(order) => {
              setSelectedOrder(order)
              setShowPaymentModal(true)
            }}
            onRefresh={loadOrders}
          />
        )}
      </div>

      {showPaymentModal && selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedOrder(null)
          }}
          onPaymentProcessed={handleProcessPayment}
        />
      )}
    </div>
  )
}
