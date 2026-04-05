/**
 * Shared test setup — axios instance pointed at the real backend
 * All tests import `api` from here instead of from src/ (no Vite proxy in Node env)
 */
import axios from 'axios'

export const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8083'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12_000,
})

/** Attach JWT to every subsequent request */
export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

/** Remove JWT */
export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization']
}

/** Pretty-print an axios error for test output */
export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return `${err.response?.status} — ${JSON.stringify(err.response?.data)}`
  }
  return String(err)
}

/** Generate unique test email */
export function testEmail(prefix = 'test') {
  return `${prefix}_${Date.now()}@mysugu-test.com`
}
