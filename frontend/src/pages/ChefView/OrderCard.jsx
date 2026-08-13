
import './styles.css'

export default function OrderCard({
  order,
  isSelected,
  onSelect,
  onAction,
  actionLabel,
  disableAction,
}) {

  const itemCount = order.items?.length || 0
  const totalQuantity = order.items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0

  return (
    <div
      className={`order-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <div className="order-id-section">
          <h3>Orden #{order.id}</h3>
          <div className="order-badges">
            <span className="mesa-badge">{order.table_number}</span>
            <span className="customer-badge">👤 {order.customer_name || 'Invitado'}</span>
            <span className="paid-kitchen-badge">
              💳 Pagado ({order.payment_method === 'apple_pay' ? 'Apple Pay ' : order.payment_method === 'card' ? 'Tarjeta' : 'Google Pay G'})
            </span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="items-summary">
          <span className="item-count">{itemCount} items</span>
          <span className="quantity-count">{totalQuantity} unidades</span>
        </div>

        {order.items && order.items.length > 0 && (
          <ul className="items-list">
            {order.items.slice(0, 3).map((item) => (
              <li key={item.id}>
                {item.quantity}x {item.name}
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="more-items">
                +{order.items.length - 3} más...
              </li>
            )}
          </ul>
        )}

        {order.special_notes && (
          <div className="special-notes">
            📝 {order.special_notes}
          </div>
        )}
      </div>

      <div className="card-footer">
        {!disableAction && (
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              onAction()
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
