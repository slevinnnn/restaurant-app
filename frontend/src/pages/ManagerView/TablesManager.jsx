import { useState, useEffect, useMemo } from 'react'

export default function TablesManager({ tables, orders }) {
  const [selectedTable, setSelectedTable] = useState(null)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Actualizar el tiempo cada minuto para los temporizadores vivos
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Solo nos importan ordenes no pagadas ni canceladas para ver qué mesa está ocupada
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled')
  }, [orders])

  // Calcular el estado de cada mesa
  const tablesState = useMemo(() => {
    return tables.map(table => {
      const tableOrders = activeOrders.filter(o => o.table_id === table.id)
      const isOccupied = tableOrders.length > 0
      
      let occupiedSince = null
      let occupiedDurationStr = ''
      
      if (isOccupied) {
        // Encontrar la orden más antigua
        const timestamps = tableOrders.map(o => new Date(o.timestamp).getTime())
        occupiedSince = Math.min(...timestamps)
        
        // Calcular diferencia
        const diffMs = currentTime - occupiedSince
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins < 60) {
          occupiedDurationStr = `${diffMins} min`
        } else {
          const hours = Math.floor(diffMins / 60)
          const mins = diffMins % 60
          occupiedDurationStr = `${hours}h ${mins}m`
        }
      }

      // Obtener usuarios únicos en la mesa
      const users = [...new Set(tableOrders.map(o => o.customer_name || 'Invitado'))]

      return {
        ...table,
        isOccupied,
        occupiedDurationStr,
        users,
        orders: tableOrders
      }
    })
  }, [tables, activeOrders, currentTime])

  const handleTableClick = (table) => {
    setSelectedTable(table)
  }

  const handleCloseModal = () => {
    setSelectedTable(null)
  }

  // --- Modal Content ---
  const renderTableDetails = () => {
    if (!selectedTable) return null

    const tState = tablesState.find(t => t.id === selectedTable.id)
    if (!tState) return null

    const pendingOrders = tState.orders.filter(o => o.status === 'pending')
    const preparingOrders = tState.orders.filter(o => o.status === 'preparing')
    const readyOrders = tState.orders.filter(o => o.status === 'ready' || o.status === 'completed')

    return (
      <div className="table-detail-modal-overlay" onClick={handleCloseModal}>
        <div className="table-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Detalles - {tState.table_number}</h2>
            <button className="close-btn" onClick={handleCloseModal}>✕</button>
          </div>
          
          <div className="modal-info-bar">
            <span>👥 {tState.seats} pax</span>
            <span>{tState.is_smoking ? '🚬 Fumadores' : '🚭 No Fumadores'}</span>
            <span>📍 {tState.location}</span>
          </div>

          <div className="modal-users-bar">
            <strong>Usuarios en mesa:</strong>
            <div className="users-tags">
              {tState.users.length === 0 ? (
                <span className="no-users">Nadie actualmente</span>
              ) : (
                tState.users.map((u, i) => <span key={i} className="user-tag">👤 {u}</span>)
              )}
            </div>
          </div>

          <div className="orders-kanban">
            {/* Columna Pedidos */}
            <div className="kanban-column">
              <h3>🛎️ Recién Pedido</h3>
              <div className="kanban-items">
                {pendingOrders.length === 0 ? <p className="empty-col">Sin pedidos</p> : null}
                {pendingOrders.map(o => (
                  <div key={o.id} className="kanban-card">
                    <div className="kc-header">
                      <span>{o.item_name} x{o.quantity}</span>
                      <span className="kc-user">{o.customer_name || 'Invitado'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Preparando */}
            <div className="kanban-column">
              <h3>🍳 Preparando</h3>
              <div className="kanban-items">
                {preparingOrders.length === 0 ? <p className="empty-col">Sin pedidos</p> : null}
                {preparingOrders.map(o => (
                  <div key={o.id} className="kanban-card preparing">
                    <div className="kc-header">
                      <span>{o.item_name} x{o.quantity}</span>
                      <span className="kc-user">{o.customer_name || 'Invitado'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Listos */}
            <div className="kanban-column">
              <h3>✅ Listos</h3>
              <div className="kanban-items">
                {readyOrders.length === 0 ? <p className="empty-col">Sin pedidos</p> : null}
                {readyOrders.map(o => (
                  <div key={o.id} className="kanban-card ready">
                    <div className="kc-header">
                      <span>{o.item_name} x{o.quantity}</span>
                      <span className="kc-user">{o.customer_name || 'Invitado'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tables-manager">
      <div className="tables-header">
        <h2>Estado del Restaurante</h2>
        <div className="tables-legend">
          <span className="legend-item occupied">Ocupada</span>
          <span className="legend-item free">Libre</span>
        </div>
      </div>

      <div className="tables-grid">
        {tablesState.map(table => (
          <div 
            key={table.id} 
            className={`restaurant-table-card ${table.isOccupied ? 'occupied' : 'free'}`}
            onClick={() => handleTableClick(table)}
          >
            <div className="table-card-top">
              <h3>{table.table_number}</h3>
              <span className="table-capacity">👥 {table.seats}</span>
            </div>
            
            <div className="table-card-middle">
              <span className="table-smoking">{table.is_smoking ? '🚬' : '🚭'}</span>
              <span className="table-status">
                {table.isOccupied ? 'Ocupada' : 'Libre'}
              </span>
            </div>
            
            <div className="table-card-bottom">
              {table.isOccupied ? (
                <span className="table-time">⏱️ {table.occupiedDurationStr}</span>
              ) : (
                <span className="table-time empty">--</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {renderTableDetails()}
    </div>
  )
}
