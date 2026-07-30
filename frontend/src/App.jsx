import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

// Páginas
import ClientDashboard from './pages/ClientView/ClientDashboard'
import ChefDashboard from './pages/ChefView/ChefDashboard'
import ManagerDashboard from './pages/ManagerView/ManagerDashboard'
import LoginPage from './pages/Login/LoginPage'
import NotFound from './pages/NotFound'

/**
 * Componente Guard para rutas protegidas
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Redirección según el rol por defecto del usuario logueado
 */
function RoleDefaultRedirect() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  switch (user?.role) {
    case 'client':
      return <Navigate to="/client" replace />
    case 'chef':
      return <Navigate to="/chef" replace />
    case 'manager':
      return <Navigate to="/manager" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <RoleDefaultRedirect /> : <LoginPage />}
      />

      {/* Rutas explícitas para desarrollo y vistas directas */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chef"
        element={
          <ProtectedRoute>
            <ChefDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz */}
      <Route path="/" element={<RoleDefaultRedirect />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
