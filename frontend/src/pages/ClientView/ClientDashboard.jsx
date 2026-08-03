import { useState, useEffect } from 'react'
import { useOrderSocket, useSocketListener } from '../../hooks/useSocket'
import { menusAPI, ordersAPI, billRequestsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import ClientMenu from './ClientMenu'
import OrderCart from './OrderCart'
import OrderConfirmation from './OrderConfirmation'
import './styles.css'

export default function ClientDashboard() {
  const { logout, tableId, user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])
  
  const [showBillModal, setShowBillModal] = useState(false)
  const [isRequestingBill, setIsRequestingBill] = useState(false)

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

  const canPay = activeOrders.some(o => ['preparing', 'ready', 'completed'].includes(o.currentStatus?.status))

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
          <div className="header-actions">
            {canPay && (
              <button className="pay-and-leave-btn" onClick={() => setShowBillModal(true)}>
                💳 Pagar y Salir
              </button>
            )}
            <button className="logout-btn" onClick={logout}>
              🚪 Cerrar Sesión
            </button>
          </div>
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
                      <div className="order-header-actions" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <span className="order-price">${order.total_price?.toFixed(2)}</span>
                        {order.currentStatus?.status === 'pending' && (
                          <button 
                            className="delete-order-btn" 
                            style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}
                            onClick={async () => {
                              if (!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;
                              try {
                                await ordersAPI.cancel(order.id);
                                setActiveOrders(prev => prev.filter(o => o.id !== order.id));
                                orderSocket.cancelOrder(order.id);
                              } catch (err) {
                                alert('Error al cancelar el pedido');
                              }
                            }}
                            title="Cancelar pedido"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="order-items-count">{order.items.length} items</p>
                    <div className="order-status-badge">
                      {order.currentStatus?.status === 'pending' && '⏳ Pendiente'}
                      {order.currentStatus?.status === 'preparing' && '👨‍🍳 En Preparación'}
                      {order.currentStatus?.status === 'ready' && '🎉 Listo para retirar'}
                      {order.currentStatus?.status === 'completed' && '🍽️ Recibido'}
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
                // Actualizar localmente el estado a completed en vez de eliminarlo
                setActiveOrders(prev => prev.map(o => 
                  o.id === order.id 
                    ? { ...o, currentStatus: { status: 'completed', message: 'Entregado' } } 
                    : o
                ))
                // Actualizar el backend
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

      {showBillModal && (
        <div className="bill-request-modal-overlay">
          <div className="bill-request-modal">
            <h2>Pagar y Salir</h2>
            <p>¿Deseas pagar solo lo tuyo o la cuenta de toda la mesa?</p>
            <div className="bill-options">
              <button 
                className="bill-option-btn primary"
                disabled={isRequestingBill}
                onClick={async () => {
                  try {
                    setIsRequestingBill(true)
                    
                    // Cancelar órdenes pendientes propias
                    const myName = user?.customerName || 'Invitado'
                    const myPendingOrders = activeOrders.filter(o => 
                      o.currentStatus?.status === 'pending' && 
                      (o.customer_name === myName || (!o.customer_name && myName === 'Invitado'))
                    )
                    
                    for (const pendingOrder of myPendingOrders) {
                      try {
                        await ordersAPI.cancel(pendingOrder.id)
                        setActiveOrders(prev => prev.filter(o => o.id !== pendingOrder.id))
                        orderSocket.cancelOrder(pendingOrder.id);
                      } catch(e) {
                        console.error('No se pudo cancelar', pendingOrder.id)
                      }
                    }

                    const data = {
                      table_id: tableId,
                      table_number: `Mesa ${tableId}`,
                      request_type: 'individual',
                      customer_name: myName
                    }
                    await billRequestsAPI.create(data)
                    orderSocket.requestBill(data)
                    alert('Se ha notificado al manager que deseas pagar tu parte.')
                    setShowBillModal(false)
                  } catch (err) {
                    alert('Error al solicitar la cuenta.')
                  } finally {
                    setIsRequestingBill(false)
                  }
                }}
              >
                👤 Me voy yo solo
              </button>
              <button 
                className="bill-option-btn secondary"
                disabled={isRequestingBill}
                onClick={async () => {
                  try {
                    setIsRequestingBill(true)

                    // Cancelar TODAS las órdenes pendientes de la mesa
                    const allPendingOrders = activeOrders.filter(o => o.currentStatus?.status === 'pending')
                    
                    for (const pendingOrder of allPendingOrders) {
                      try {
                        await ordersAPI.cancel(pendingOrder.id)
                        setActiveOrders(prev => prev.filter(o => o.id !== pendingOrder.id))
                        orderSocket.cancelOrder(pendingOrder.id);
                      } catch(e) {
                        console.error('No se pudo cancelar', pendingOrder.id)
                      }
                    }

                    const data = {
                      table_id: tableId,
                      table_number: `Mesa ${tableId}`,
                      request_type: 'mesa_completa',
                      customer_name: null
                    }
                    await billRequestsAPI.create(data)
                    orderSocket.requestBill(data)
                    alert('Se ha notificado al manager que toda la mesa pagará.')
                    setShowBillModal(false)
                  } catch (err) {
                    alert('Error al solicitar la cuenta.')
                  } finally {
                    setIsRequestingBill(false)
                  }
                }}
              >
                👥 Se va toda la mesa
              </button>
            </div>
            <button className="cancel-bill-btn" onClick={() => setShowBillModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
