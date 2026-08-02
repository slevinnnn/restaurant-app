import { useState, useMemo } from 'react'
import PaymentModal from './PaymentModal'

export default function PaymentManager({ orders, billRequests = [], onPaymentProcessed }) {
  // step 1: list bill requests, step 2: select users
  const [step, setStep] = useState(1)
  
  // State for step 2 / modal
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Solo incluimos ordenes no pagadas ni canceladas
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled')
  }, [orders])

  // Agrupamos por usuario para la mesa seleccionada (Step 2)
  const tableUsers = useMemo(() => {
    if (!selectedTableId) return []
    const tableOrders = activeOrders.filter(o => o.table_id === selectedTableId)
    const userMap = {}
    tableOrders.forEach(order => {
      const userName = order.customer_name || 'Invitado'
      if (!userMap[userName]) {
        userMap[userName] = {
          name: userName,
          total: 0,
          orders: []
        }
      }
      userMap[userName].total += order.total_price
      userMap[userName].orders.push(order)
    })
    return Object.values(userMap)
  }, [activeOrders, selectedTableId])

  // Obtener ordenes a pagar basado en usuarios seleccionados
  const ordersToPay = useMemo(() => {
    if (!selectedTableId || selectedUsers.length === 0) return []
    return tableUsers
      .filter(u => selectedUsers.includes(u.name))
      .flatMap(u => u.orders)
  }, [tableUsers, selectedUsers, selectedTableId])

  const handleSelectRequest = (req) => {
    setSelectedTableId(req.table_id)
    if (req.request_type === 'individual') {
      setSelectedUsers([req.customer_name || 'Invitado'])
      setShowPaymentModal(true)
    } else {
      setSelectedUsers([])
      setStep(2)
    }
  }

  const handleToggleUser = (userName) => {
    if (selectedUsers.includes(userName)) {
      setSelectedUsers(selectedUsers.filter(u => u !== userName))
    } else {
      setSelectedUsers([...selectedUsers, userName])
    }
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === tableUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(tableUsers.map(u => u.name))
    }
  }

  const handleGoToPayment = () => {
    if (selectedUsers.length === 0) return
    setShowPaymentModal(true)
  }

  // --- RENDER ---
  return (
    <div className="payment-manager">
      {step === 1 && (
        <>
          <h2>Solicitudes de Pago</h2>
          {billRequests.length === 0 ? (
            <p className="empty-state">No hay mesas solicitando la cuenta en este momento.</p>
          ) : (
            <div className="tables-list">
              {billRequests.map(req => {
                // Calcular total para esta solicitud
                let reqOrders = activeOrders.filter(o => o.table_id === req.table_id)
                if (req.request_type === 'individual') {
                  const targetName = req.customer_name || 'Invitado'
                  reqOrders = reqOrders.filter(o => (o.customer_name || 'Invitado') === targetName)
                }
                const total = reqOrders.reduce((sum, o) => sum + o.total_price, 0)
                const title = req.request_type === 'individual' 
                  ? `${req.table_number} (Solo ${req.customer_name || 'Invitado'})`
                  : `${req.table_number} (Cuenta Completa)`

                return (
                  <div key={req.id} className="table-payment-card">
                    <div className="table-info">
                      <h3>{title}</h3>
                      <p className="table-total">Total: ${total.toFixed(2)}</p>
                    </div>
                    <button className="pay-btn" onClick={() => handleSelectRequest(req)}>
                      Proceder
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <div className="step-header">
            <button className="back-btn" onClick={() => setStep(1)}>← Volver a solicitudes</button>
            <h2>Dividir cuenta - Mesa {selectedTableId}</h2>
          </div>

          <div className="users-selection-list">
            <div className="select-all-row">
              <label>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.length === tableUsers.length && tableUsers.length > 0}
                  onChange={handleSelectAllUsers}
                />
                <span>Seleccionar todos</span>
              </label>
            </div>

            {tableUsers.map(user => (
              <div 
                key={user.name} 
                className={`user-payment-row ${selectedUsers.includes(user.name) ? 'selected' : ''}`}
                onClick={() => handleToggleUser(user.name)}
              >
                <div className="user-info-left">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.name)}
                    onChange={() => {}} 
                  />
                  <div className="user-details">
                    <span className="user-name">👤 {user.name}</span>
                    <span className="user-items-count">{user.orders.length} pedidos</span>
                  </div>
                </div>
                <span className="user-subtotal">${user.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="payment-action-bar">
            <div className="selected-summary">
              <span>Seleccionados: {selectedUsers.length}</span>
              <strong>Total a cobrar: ${
                tableUsers
                  .filter(u => selectedUsers.includes(u.name))
                  .reduce((sum, u) => sum + u.total, 0)
                  .toFixed(2)
              }</strong>
            </div>
            <button 
              className="pay-btn large" 
              disabled={selectedUsers.length === 0}
              onClick={handleGoToPayment}
            >
              Procesar Pago
            </button>
          </div>
        </>
      )}

      {showPaymentModal && (
        <PaymentModal
          orders={ordersToPay}
          tableId={selectedTableId}
          tableNumber={`Mesa ${selectedTableId}`}
          selectedUsers={selectedUsers}
          onClose={() => {
            setShowPaymentModal(false)
            // Si vinimos directo del paso 1, resetear seleccion
            if (step === 1) {
              setSelectedTableId(null)
              setSelectedUsers([])
            }
          }}
          onPaymentProcessed={(data) => {
            setShowPaymentModal(false)
            setStep(1)
            setSelectedTableId(null)
            setSelectedUsers([])
            onPaymentProcessed(data)
          }}
        />
      )}
    </div>
  )
}
