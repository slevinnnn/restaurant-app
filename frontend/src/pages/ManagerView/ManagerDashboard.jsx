import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { ordersAPI, paymentsAPI, billRequestsAPI, tablesAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import PaymentManager from './PaymentManager'
import TablesManager from './TablesManager'
import Statistics from './Statistics'
import './styles.css'

export default function ManagerDashboard() {
  const { logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [billRequests, setBillRequests] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pago')
  const [stats, setStats] = useState({})

  const orderSocket = useOrderSocket()

  // Cargar órdenes y estadísticas
  useEffect(() => {
    loadOrders()
    loadStats()
  }, [])

  // Escuchar actualizaciones en tiempo real
  useSocketListener('dashboard:update', () => {
    loadOrders(false)
  })

  useSocketListener('bill_requested', () => {
    loadOrders(false)
  })

  const loadOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const [ordersRes, billsRes, tablesRes] = await Promise.all([
        ordersAPI.list(),
        billRequestsAPI.list(),
        tablesAPI.list()
      ])
      setOrders(ordersRes.data)
      setBillRequests(billsRes.data)
      setTables(tablesRes.data)
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    } finally {
      if (showLoading) setLoading(false)
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
      
      const remainingOrders = orders.filter(o => 
          o.table_id === paymentData.table_id && 
          !paymentData.order_ids.includes(o.id) &&
          o.status !== 'paid' && o.status !== 'cancelled' && o.status !== 'pending'
      )
      
      if (remainingOrders.length === 0) {
        await billRequestsAPI.clearTable(paymentData.table_id)
      }

      orderSocket.processPayment({
        order_ids: paymentData.order_ids,
        amount: paymentData.amount,
        table_id: paymentData.table_id,
      })

      loadOrders(false)
      loadStats()
    } catch (error) {
      console.error('Error al procesar pago:', error)
    }
  }

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
        <div className="manager-navbar">
          <button 
            className={`nav-tab ${activeTab === 'pago' ? 'active' : ''}`}
            onClick={() => setActiveTab('pago')}
          >
            💰 Pago
          </button>
          <button 
            className={`nav-tab ${activeTab === 'mesas' ? 'active' : ''}`}
            onClick={() => setActiveTab('mesas')}
          >
            🪑 Mesas
          </button>
          <button 
            className={`nav-tab ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            📚 Historial
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading">Cargando datos...</div>
          ) : (
            <>
              {activeTab === 'pago' && (
                <PaymentManager 
                  orders={orders} 
                  billRequests={billRequests}
                  onPaymentProcessed={handleProcessPayment} 
                />
              )}
              {activeTab === 'mesas' && (
                <TablesManager 
                  tables={tables}
                  orders={orders}
                />
              )}
              {activeTab === 'historial' && (
                <div className="empty-state">
                  <h2>Historial de Pagos</h2>
                  <p>En construcción 🚧</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
