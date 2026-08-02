import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ ORDERS ============
export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  list: (params) => apiClient.get('/orders', { params }),
  get: (orderId) => apiClient.get(`/orders/${orderId}`),
  update: (orderId, data) => apiClient.put(`/orders/${orderId}`, data),
  cancel: (orderId) => apiClient.delete(`/orders/${orderId}`),
  getTableOrders: (tableId) => apiClient.get(`/orders/status/${tableId}`),
}

// ============ MENUS ============
export const menusAPI = {
  list: () => apiClient.get('/menus'),
  getGrouped: () => apiClient.get('/menus/grouped'),
  get: (itemId) => apiClient.get(`/menus/${itemId}`),
  create: (itemData) => apiClient.post('/menus', itemData),
  update: (itemId, data) => apiClient.put(`/menus/${itemId}`, data),
  delete: (itemId) => apiClient.delete(`/menus/${itemId}`),
  toggleAvailability: (itemId, available) =>
    apiClient.patch(`/menus/${itemId}/availability`, { available }),
}

// ============ TABLES ============
export const tablesAPI = {
  list: () => apiClient.get('/tables'),
  get: (tableId) => apiClient.get(`/tables/${tableId}`),
  create: (tableData) => apiClient.post('/tables', tableData),
  update: (tableId, data) => apiClient.put(`/tables/${tableId}`, data),
  delete: (tableId) => apiClient.delete(`/tables/${tableId}`),
}

// ============ AUTH ============
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  qrLogin: (data) => apiClient.post('/auth/qr-login', data),
  verify: (token) => apiClient.get(`/auth/verify?token=${token}`),
  logout: () => apiClient.post('/auth/logout'),
}

// ============ PAYMENTS ============
export const paymentsAPI = {
  process: (paymentData) => apiClient.post('/payments/process', paymentData),
  get: (paymentId) => apiClient.get(`/payments/${paymentId}`),
  getByOrder: (orderId) => apiClient.get(`/payments/order/${orderId}`),
  getDailySummary: () => apiClient.get('/payments/daily-summary'),
}

// ============ BILL REQUESTS ============
export const billRequestsAPI = {
  create: (data) => apiClient.post('/bill-requests', data),
  list: () => apiClient.get('/bill-requests'),
  delete: (requestId) => apiClient.delete(`/bill-requests/${requestId}`),
  clearTable: (tableId) => apiClient.delete(`/bill-requests/table/${tableId}`)
}

export default apiClient
