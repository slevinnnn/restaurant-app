import OrderCard from './OrderCard'
import './styles.css'

export default function OrderQueue({
  title,
  orders = [],
  status,
  onAction,
  actionLabel,
  selectedOrder,
  onSelectOrder,
  accentColor = 'blue',
  disableAction = false,
}) {
  return (
    <div className={`order-queue accent-${accentColor}`}>
      <div className="queue-header">
        <h2>{title}</h2>
        <span className="queue-count">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-queue">
          <p>✨ No hay órdenes en esta sección</p>
        </div>
      ) : (
        <div className="queue-cards">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrder?.id === order.id}
              onSelect={() => onSelectOrder(order)}
              onAction={() => onAction(order.id)}
              actionLabel={actionLabel}
              disableAction={disableAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
