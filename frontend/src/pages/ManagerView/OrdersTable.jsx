import './styles.css'

export default function OrdersTable({ orders = [], onSelectOrder, onRefresh }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: '⏳ Pendiente', color: 'blue' },
      confirmed: { label: '✓ Confirmado', color: 'info' },
      preparing: { label: '👨‍🍳 Preparando', color: 'orange' },
      ready: { label: '✅ Listo', color: 'green' },
      completed: { label: '✓✓ Completado', color: 'success' },
      cancelled: { label: '✕ Cancelado', color: 'red' },
    }

    const badge = badges[status] || { label: status, color: 'gray' }
    return badge
  }

  return (
    <div className="orders-table-container">
      <div className="table-header">
        <h2>Órdenes</h2>
        <button className="refresh-btn" onClick={onRefresh} title="Actualizar">
          🔄
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-table">
          <p>No hay órdenes que mostrar</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mesa</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Hora</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badge = getStatusBadge(order.status)
                const createdTime = new Date(order.created_at)
                  .toLocaleTimeString()
                  .substring(0, 5)

                return (
                  <tr key={order.id} className={`status-${order.status}`}>
                    <td className="order-id">#{order.id}</td>
                    <td className="order-table">{order.table_number}</td>
                    <td className="order-items">{order.items?.length || 0}</td>
                    <td className="order-total">
                      ${order.total_price?.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="order-time">{createdTime}</td>
                    <td className="order-action">
                      {(order.status === 'ready' ||
                        order.status === 'completed') && (
                        <button
                          className="pay-btn"
                          onClick={() => onSelectOrder(order)}
                        >
                          💳 Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
