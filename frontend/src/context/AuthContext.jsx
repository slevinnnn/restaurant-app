import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const restoreUser = useCallback(() => {
    const token = localStorage.getItem('access_token')
    const userRole = localStorage.getItem('user_role')
    const userId = localStorage.getItem('user_id')

    if (token && userRole && userId) {
      setUser({
        id: parseInt(userId, 10),
        role: userRole,
        token,
      })
    }
  }, [])

  useEffect(() => {
    restoreUser()
  }, [restoreUser])

  const login = useCallback(async (username, password, role) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.login({
        username,
        password,
        role,
      })

      const { access_token, token_type, role: userRole, user_id } = response.data

      // Guardar token y datos en localStorage
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('token_type', token_type)
      localStorage.setItem('user_role', userRole)
      localStorage.setItem('user_id', user_id)

      // Actualizar estado global de usuario
      const userData = {
        id: user_id,
        role: userRole,
        token: access_token,
      }
      setUser(userData)

      return response.data
    } catch (err) {
      const message = err.response?.data?.detail || 'Error al iniciar sesión'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      setUser(null)
    }
  }, [])

  const verifyToken = useCallback(async (token) => {
    try {
      const response = await authAPI.verify(token)
      return response.data.valid
    } catch {
      return false
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    verifyToken,
    restoreUser,
    isAuthenticated: !!user,
    userRole: user?.role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
