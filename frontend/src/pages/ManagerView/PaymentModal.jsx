import { useState } from 'react'
import './styles.css'

export default function PaymentModal({
  order,
  onClose,
  onPaymentProcessed,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const finalAmount = Math.max(0, order.total_price - discount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      await onPaymentProcessed({
        order_id: order.id,
        table_id: order.table_id,
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
          {/* Resumen de orden */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Orden:</span>
              <strong>#{order.id}</strong>
            </div>
            <div className="summary-row">
              <span>Mesa:</span>
              <strong>{order.table_number}</strong>
            </div>
            <div className="summary-row">
              <span>Items:</span>
              <strong>{order.items?.length || 0}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Subtotal:</span>
              <strong>${order.total_price?.toFixed(2)}</strong>
            </div>
          </div>

          {/* Descuento */}
          <div className="form-group">
            <label htmlFor="discount">Descuento ($)</label>
            <input
              id="discount"
              type="number"
              min="0"
              max={order.total_price}
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
