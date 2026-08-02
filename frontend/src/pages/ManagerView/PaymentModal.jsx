import { useState } from 'react'
import './styles.css'

export default function PaymentModal({
  orders,
  tableId,
  tableNumber,
  selectedUsers,
  onClose,
  onPaymentProcessed,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalItemsCount = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)
  const totalAmount = orders.reduce((sum, o) => sum + o.total_price, 0)
  const finalAmount = Math.max(0, totalAmount - discount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      await onPaymentProcessed({
        order_ids: orders.map(o => o.id),
        table_id: tableId,
        amount: finalAmount,
        payment_method: paymentMethod,
        discount,
      })
    } catch (error) {
      alert('Error al procesar pago: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Procesar Pago</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Resumen de orden combinada */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Usuarios:</span>
              <strong>{selectedUsers.join(', ')}</strong>
            </div>
            <div className="summary-row">
              <span>Mesa:</span>
              <strong>{tableNumber}</strong>
            </div>
            
            <div className="items-breakdown">
              <strong>Detalle de items:</strong>
              {orders.map(order => (
                <div key={order.id} className="user-items-group">
                  <div className="user-items-header">👤 {order.customer_name || 'Invitado'}</div>
                  <ul className="user-items-list">
                    {order.items?.map(item => (
                      <li key={`${order.id}-${item.id}`}>
                        <span className="item-qty">{item.quantity}x</span> {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Items en total:</span>
              <strong>{totalItemsCount}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Subtotal:</span>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          {/* Descuento */}
          <div className="form-group">
            <label htmlFor="discount">Descuento ($)</label>
            <input
              id="discount"
              type="number"
              min="0"
              max={totalAmount}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Método de pago */}
          <div className="form-group">
            <label>Método de Pago</label>
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Efectivo</span>
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 Tarjeta</span>
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  value="mobile"
                  checked={paymentMethod === 'mobile'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>📱 Móvil</span>
              </label>
            </div>
          </div>

          {/* Total final */}
          <div className="final-amount">
            <span>Total a Pagar:</span>
            <span className="amount">${finalAmount.toFixed(2)}</span>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="pay-btn"
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Procesando...' : '✓ Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
