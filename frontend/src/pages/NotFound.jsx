import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '80px', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '32px', margin: '20px 0' }}>Página no encontrada</h2>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Lo sentimos, la página que buscas no existe.
      </p>
      <Link 
        to="/login" 
        style={{
          padding: '12px 30px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
