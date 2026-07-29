import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

// Páginas
import ClientDashboard from './pages/ClientView/ClientDashboard'
import ChefDashboard from './pages/ChefView/ChefDashboard'
import ManagerDashboard from './pages/ManagerView/ManagerDashboard'
import LoginPage from './pages/Login/LoginPage'
import NotFound from './pages/NotFound'

function App() {
  const { user, restoreUser, isAuthenticated } = useAuth()

  useEffect(() => {
    // Intentar restaurar sesión del usuario
    restoreUser()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />

        {/* Rutas protegidas */}
        <Route path="/" element={<RoleBasedDashboard user={user} />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

/**
 * Componente que renderiza el dashboard según el rol del usuario
 */
function RoleBasedDashboard({ user }) {
  if (!user) {
    return <Navigate to="/login" />
  }

  switch (user.role) {
    case 'client':
      return <ClientDashboard />
    case 'chef':
      return <ChefDashboard />
    case 'manager':
      return <ManagerDashboard />
    default:
      return <Navigate to="/login" />
  }
}

export default App
