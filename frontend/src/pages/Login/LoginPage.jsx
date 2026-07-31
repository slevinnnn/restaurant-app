import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './styles.css'

export default function LoginPage() {
  const [role, setRole] = useState('client')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, qrLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const tableId = searchParams.get('table')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password, role)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleQRSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await qrLogin(username, tableId)
      navigate('/client')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al iniciar sesión en la mesa')
    } finally {
      setLoading(false)
    }
  }

  // Si viene de escanear QR, mostrar vista simplificada
  if (tableId) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
            <h1>Bienvenido a la Mesa {tableId}</h1>
            <p className="subtitle">Por favor ingresa tu nombre para comenzar a ordenar</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleQRSubmit}>
              <div className="form-group">
                <label htmlFor="qr-username">Tu Nombre</label>
                <input
                  id="qr-username"
                  type="text"
                  placeholder="Ej: Juan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? '⏳ Entrando...' : '✓ Comenzar a Ordenar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h1>🍽️ Sistema de Pedidos</h1>
          <p className="subtitle">Restaurant Order Management</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Selector de rol */}
            <div className="role-selector">
              <h3>Selecciona tu rol:</h3>
              <div className="role-options">
                <label className={`role-option ${role === 'client' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="client"
                    checked={role === 'client'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">👥</span>
                  <span className="role-name">Cliente</span>
                  <span className="role-desc">Ordenar comida</span>
                </label>

                <label className={`role-option ${role === 'chef' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="chef"
                    checked={role === 'chef'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">👨‍🍳</span>
                  <span className="role-name">Chef</span>
                  <span className="role-desc">Preparar pedidos</span>
                </label>

                <label className={`role-option ${role === 'manager' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="manager"
                    checked={role === 'manager'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">📊</span>
                  <span className="role-name">Manager</span>
                  <span className="role-desc">Gestionar restaurant</span>
                </label>
              </div>
            </div>

            {/* Credenciales */}
            <div className="credentials">
              <h3>Credenciales de prueba:</h3>
              <p>Usuario: <strong>{role}</strong></p>
              <p>Contraseña: <strong>{role}_pass</strong></p>
            </div>

            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder={`Ingresa: ${role}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder={`Ingresa: ${role}_pass`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '⏳ Iniciando...' : '✓ Iniciar Sesión'}
            </button>
          </form>

          <div className="footer-note">
            <p>Sistema de prueba con credenciales automáticas</p>
          </div>
        </div>

        <div className="login-info">
          <h2>Bienvenido</h2>
          <p>
            Este es un sistema de gestión de pedidos para restaurants con tres
            roles principales:
          </p>
          <ul>
            <li>
              <strong>Cliente:</strong> Escanea QR, selecciona platos, realiza pedidos
            </li>
            <li>
              <strong>Chef:</strong> Recibe pedidos, prepara, marca como listo
            </li>
            <li>
              <strong>Manager:</strong> Supervisa, gestiona pagos, ve estadísticas
            </li>
          </ul>
          <p className="tech-stack">
            <strong>Stack:</strong> FastAPI + Socket.io + React + Vite
          </p>
        </div>
      </div>
    </div>
  )
}
