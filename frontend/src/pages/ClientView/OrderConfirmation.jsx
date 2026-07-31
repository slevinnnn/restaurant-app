import './styles.css'

export default function OrderConfirmation({ order, status, onDismiss }) {
  const isReady = status?.status === 'ready'

  return (
    <div className="order-confirmation modal">
      <div className="confirmation-content">
        <div className="confirmation-icon">{isReady ? '🍽️' : '✓'}</div>
        <h2>{isReady ? '¡Tu Pedido está Listo!' : '¡Pedido Confirmado!'}</h2>
        <p className="order-id">Pedido #{order.id}</p>

        <div className="confirmation-details">
          <p>
            <strong>Mesa:</strong> {order.table_number || order.table_id}
          </p>
          <p>
            <strong>Items:</strong> {order.items.length}
          </p>
          <p>
            <strong>Total:</strong> ${order.total_price.toFixed(2)}
          </p>
        </div>

        {status && (
          <div className={`order-status ${isReady ? 'status-ready-pulse' : ''}`}>
            <p className="status-message">{status.message}</p>
            <p className="status-emoji">
              {status.status === 'preparing' && '👨‍🍳'}
              {status.status === 'ready' && '🎉'}
              {status.status === 'pending' && '⏳'}
            </p>
          </div>
        )}

        {!isReady && (
          <p className="confirmation-note">
            Te notificaremos cuando tu pedido esté listo
          </p>
        )}

        {onDismiss && (
          <button className="dismiss-btn" onClick={onDismiss}>
            {isReady ? 'Entendido, voy por él' : 'Cerrar'}
          </button>
        )}
      </div>
    </div>
  )
}
