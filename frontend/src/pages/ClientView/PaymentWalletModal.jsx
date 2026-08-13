import { useState } from 'react'

export default function PaymentWalletModal({
  totalAmount,
  itemsCount,
  onConfirmPayment,
  onClose,
}) {
  const [selectedWallet, setSelectedWallet] = useState('google_pay') // 'google_pay' | 'apple_pay' | 'card'
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [authenticatingBiometrics, setAuthenticatingBiometrics] = useState(false)

  const handleProcessPayment = () => {
    setIsProcessing(true)
    
    if (selectedWallet === 'apple_pay') {
      setAuthenticatingBiometrics(true)
      setTimeout(() => {
        setAuthenticatingBiometrics(false)
        setPaymentSuccess(true)
        setTimeout(() => {
          onConfirmPayment({ payment_method: selectedWallet })
        }, 1200)
      }, 2000)
    } else {
      setTimeout(() => {
        setPaymentSuccess(true)
        setTimeout(() => {
          onConfirmPayment({ payment_method: selectedWallet })
        }, 1200)
      }, 1800)
    }
  }

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="wallet-close-btn" onClick={onClose} disabled={isProcessing}>
          ✕
        </button>

        <div className="wallet-modal-header">
          <div className="wallet-badge">📱 Pago en Celular</div>
          <h2>Pagar Pedido con Billetera Digital</h2>
          <p className="wallet-subtitle">
            El pedido llegará a cocina inmediatamente después de confirmarse el pago.
          </p>
        </div>

        <div className="wallet-order-summary">
          <div className="summary-info">
            <span>{itemsCount} plato(s) en tu orden</span>
            <span className="summary-amount">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {paymentSuccess ? (
          <div className="payment-success-screen">
            <div className="success-checkmark-wrapper">
              <div className="checkmark-circle">
                <span className="checkmark-icon">✓</span>
              </div>
            </div>
            <h3>¡Pago Aprobado!</h3>
            <p>
              {selectedWallet === 'google_pay' && 'Pagado exitosamente con Google Pay G Pay'}
              {selectedWallet === 'apple_pay' && 'Pagado exitosamente con Apple Pay  Pay'}
              {selectedWallet === 'card' && 'Pagado exitosamente con Tarjeta de Crédito'}
            </p>
            <p className="sending-notice">🚀 Enviando comanda a Cocina y Bar...</p>
          </div>
        ) : authenticatingBiometrics ? (
          <div className="faceid-auth-screen">
            <div className="faceid-scanner-ring">
              <div className="faceid-icon">👤</div>
            </div>
            <h4>Verificando con Face ID / Touch ID</h4>
            <p>Mantén tu mirada o pon tu huella en el dispositivo...</p>
          </div>
        ) : (
          <>
            <div className="wallet-options-tabs">
              <button
                type="button"
                className={`wallet-tab-btn ${selectedWallet === 'google_pay' ? 'active' : ''}`}
                onClick={() => setSelectedWallet('google_pay')}
                disabled={isProcessing}
              >
                <span className="wallet-icon google">G</span>
                <span>Google Pay</span>
              </button>

              <button
                type="button"
                className={`wallet-tab-btn ${selectedWallet === 'apple_pay' ? 'active' : ''}`}
                onClick={() => setSelectedWallet('apple_pay')}
                disabled={isProcessing}
              >
                <span className="wallet-icon apple"></span>
                <span>Apple Pay</span>
              </button>
            </div>

            {/* GOOGLE PAY SHEET */}
            {selectedWallet === 'google_pay' && (
              <div className="wallet-sheet google-pay-sheet">
                <div className="sheet-header">
                  <div className="gpay-brand">
                    <span className="g-blue">G</span>
                    <span className="g-red">o</span>
                    <span className="g-yellow">o</span>
                    <span className="g-blue">g</span>
                    <span className="g-green">l</span>
                    <span className="g-red">e</span> Pay
                  </div>
                  <span className="account-email">usuario.movil@gmail.com</span>
                </div>

                <div className="card-selector-box">
                  <div className="card-brand-icon visa">VISA</div>
                  <div className="card-details">
                    <span className="card-name">Visa Débito •••• 4242</span>
                    <span className="card-subtext">Google Wallet predeterminada</span>
                  </div>
                  <span className="chevron">›</span>
                </div>

                <button
                  type="button"
                  className="gpay-submit-btn"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="gpay-spinner"></span>
                  ) : (
                    <>
                      <span>Pagar con</span>
                      <span className="gpay-logo-text">GPay</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* APPLE PAY SHEET */}
            {selectedWallet === 'apple_pay' && (
              <div className="wallet-sheet apple-pay-sheet">
                <div className="sheet-header">
                  <div className="apple-brand"> Pay</div>
                  <span className="apple-subtitle">Billetera de Apple</span>
                </div>

                <div className="card-selector-box dark">
                  <div className="card-brand-icon mastercard">💳</div>
                  <div className="card-details">
                    <span className="card-name">Apple Card •••• 8812</span>
                    <span className="card-subtext">Doble clic en botón lateral</span>
                  </div>
                  <span className="faceid-mini">👤 Face ID</span>
                </div>

                <button
                  type="button"
                  className="apple-pay-submit-btn"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="apple-spinner"></span>
                  ) : (
                    <>
                      <span>Pay with Pay</span>
                      <span className="apple-amount">${totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="security-footer">
              🔒 Transacción 100% segura con tokenización de billetera móvil.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
