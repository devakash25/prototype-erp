import axios from 'axios'
import { useSubscriptionStore } from '@/store/subscriptionStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const state = response.headers['x-subscription-state']
    if (state) {
      useSubscriptionStore.getState().setSubscription({
        state: state as any,
        graceEndsAt: response.headers['x-subscription-grace-ends'] || null,
        message: null,
      })
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 402) {
      useSubscriptionStore.getState().setSubscription({
        state: 'readonly',
        message:
          error.response.data?.error?.message ||
          'Read-only mode: subscription expired. Renew the plan to restore write access.',
      })
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`, {
            refreshToken,
          })
          localStorage.setItem('accessToken', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  success: boolean
  error: {
    message: string
    statusCode: number
  }
}
