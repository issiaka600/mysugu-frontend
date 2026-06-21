import axios, { type AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

// In production builds VITE_API_URL points to the canonical backend domain
// (e.g. https://api.mysukuapp.com). In dev, leave it unset to use the Vite proxy
// which forwards /api and /auth to http://localhost:8083.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || ''

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// Attach JWT from persisted Zustand store (avoids circular import)
apiClient.interceptors.request.use(config => {
  try {
    const raw = localStorage.getItem('mysugu-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch {
    // ignore parse errors
  }
  return config
})

// 401 → clear auth and redirect to login
apiClient.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mysugu-auth')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/** Extract user-facing message from any error shape */
export function extractErrorMessage(err: unknown, fallback = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined
    return data?.message || err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

export default apiClient
