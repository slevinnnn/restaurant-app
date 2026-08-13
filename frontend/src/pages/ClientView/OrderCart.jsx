import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import PaymentWalletModal from './PaymentWalletModal'
import './styles.css'

export default function OrderCart({
  items = [],
  onRemove,
  onUpdateQuantity,
  onPlaceOrder,
}) {
  const { tableId, customerName } = useAuth()
  const [specialNotes, setSpecialNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOpenWalletModal = (e) => {
    e.preventDefault()

    if (!tableId) {
      alert('Error: No se encontró el número de mesa en la sesión.')
      return
    }

    if (items.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setShowWalletModal(true)
  }

  const handleConfirmPayment = async ({ payment_method }) => {
    setShowWalletModal(false)
    setIsSubmitting(true)

    try {
      await onPlaceOrder({
        table_id: tableId,
        items: items.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
        customer_name: customerName || null,
        special_notes: specialNotes || null,
        payment_method: payment_method,
      })

      // Limpiar formulario
      setSpecialNotes('')
    } catch (error) {
      alert('Error al crear la orden: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <aside className="order-cart">
      <h2>🛒 Tu Pedido</h2>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <p className="hint">Selecciona items del menú</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>

                <div className="item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  className="remove-btn"
                  onClick={() => onRemove(item.id)}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total a pagar:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleOpenWalletModal} className="checkout-form">
            <div className="order-info-banner">
              <p><strong>Mesa:</strong> {tableId}</p>
              {customerName && <p><strong>Cliente:</strong> {customerName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="specialNotes">Notas especiales</label>
              <textarea
                id="specialNotes"
                placeholder="Ej: Sin picante, sin cebolla..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
              />
            </div>

            <div className="wallet-pay-notice">
              🔒 <strong>Pago previo requerido:</strong> Se abonará con tu billetera digital (Google Pay / Apple Pay) antes de enviar a cocina.
            </div>

            <button
              type="submit"
              className="place-order-btn wallet-checkout-btn"
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? '⏳ Procesando...' : `💳 Pagar $${total.toFixed(2)} y Pedir`}
            </button>
          </form>
        </>
      )}

      {showWalletModal && (
        <PaymentWalletModal
          totalAmount={total}
          itemsCount={items.reduce((sum, item) => sum + item.quantity, 0)}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </aside>
  )
}
