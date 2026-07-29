import './styles.css'

export default function Statistics({ stats = {}, totalOrders = 0 }) {
  return (
    <div className="statistics-container">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <span className="stat-label">Órdenes Hoy</span>
          <span className="stat-value">{totalOrders}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <span className="stat-label">Venta Total</span>
          <span className="stat-value">${(stats.total_sales || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🎯</div>
        <div className="stat-content">
          <span className="stat-label">Ticket Promedio</span>
          <span className="stat-value">
            ${(stats.average_payment || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💳</div>
        <div className="stat-content">
          <span className="stat-label">Transacciones</span>
          <span className="stat-value">{stats.total_payments || 0}</span>
        </div>
      </div>
    </div>
  )
}
