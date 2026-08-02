import { useState, useMemo } from 'react'
import PaymentModal from './PaymentModal'

export default function PaymentManager({ orders, onPaymentProcessed }) {
  // Step 1: List tables, Step 2: Select users, Step 3: Payment modal
  const [step, setStep] = useState(1)
  const [selectedTableId, setSelectedTableId] = useState(null)
  
  // Selected user names (for step 2)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Filter only unpaid orders
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled')
  }, [orders])

  // Group by table
  const tables = useMemo(() => {
    const tableMap = {}
    activeOrders.forEach(order => {
      if (!tableMap[order.table_id]) {
        tableMap[order.table_id] = {
          table_id: order.table_id,
          table_number: order.table_number,
          total: 0,
          orders: []
        }
      }
      tableMap[order.table_id].total += order.total_price
      tableMap[order.table_id].orders.push(order)
    })
    return Object.values(tableMap)
  }, [activeOrders])

  // Group by user for the selected table
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

  const handleSelectTable = (tableId) => {
    setSelectedTableId(tableId)
    setSelectedUsers([])
    setStep(2)
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

  // Get selected orders to pay
  const ordersToPay = useMemo(() => {
    if (!selectedTableId || selectedUsers.length === 0) return []
    return tableUsers
      .filter(u => selectedUsers.includes(u.name))
      .flatMap(u => u.orders)
  }, [tableUsers, selectedUsers, selectedTableId])

  if (step === 1) {
    return (
      <div className="payment-manager">
        <h2>Mesas listas para pagar</h2>
        {tables.length === 0 ? (
          <p className="empty-state">No hay mesas con cuentas pendientes.</p>
        ) : (
          <div className="tables-list">
            {tables.map(table => (
              <div key={table.table_id} className="table-payment-card">
                <div className="table-info">
                  <h3>{table.table_number}</h3>
                  <p className="table-total">Total pendiente: ${table.total.toFixed(2)}</p>
                </div>
                <button className="pay-btn" onClick={() => handleSelectTable(table.table_id)}>
                  Cobrar Mesa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (step === 2) {
    const totalSelected = tableUsers
      .filter(u => selectedUsers.includes(u.name))
      .reduce((sum, u) => sum + u.total, 0)

    const currentTable = tables.find(t => t.table_id === selectedTableId)

    return (
      <div className="payment-manager">
        <div className="step-header">
          <button className="back-btn" onClick={() => setStep(1)}>← Volver a mesas</button>
          <h2>Dividir cuenta - {currentTable?.table_number}</h2>
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
                  onChange={() => {}} // Controlled via row click
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
            <strong>Total a cobrar: ${totalSelected.toFixed(2)}</strong>
          </div>
          <button 
            className="pay-btn large" 
            disabled={selectedUsers.length === 0}
            onClick={handleGoToPayment}
          >
            Procesar Pago
          </button>
        </div>

        {showPaymentModal && (
          <PaymentModal
            orders={ordersToPay}
            tableId={selectedTableId}
            tableNumber={currentTable?.table_number}
            selectedUsers={selectedUsers}
            onClose={() => setShowPaymentModal(false)}
            onPaymentProcessed={(data) => {
              setShowPaymentModal(false)
              setStep(1)
              onPaymentProcessed(data)
            }}
          />
        )}
      </div>
    )
  }

  return null
}
