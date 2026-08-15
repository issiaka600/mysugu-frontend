import apiClient from './apiClient'
import type { ApiLoginResponse, ApiUser } from '@/types/api'

export const authApi = {
  /**
   * POST /auth/login
   * Public — returns JWT + user
   */
  login: (email: string, password: string) =>
    apiClient.post<ApiLoginResponse>('/auth/login', { email, password }),

  /**
   * POST /auth/register
   * Public — creates CLIENT account
   */
  register: (data: {
    email: string
    password: string
    nom: string
    prenom: string
    telephone: string
    role?: string
  }) => apiClient.post<ApiUser>('/auth/register', { role: 'CLIENT', ...data }),

  /**
   * POST /api/auth/logout
   * Authenticated
   */
  logout: () =>
    apiClient.post('/api/auth/logout', {}),

  /**
   * GET /users/profile
   * Authenticated — refresh current user data
   */
  getProfile: () =>
    apiClient.get<ApiUser>('/users/profile'),

  /**
   * POST /api/auth/verify-email
   * Public — valide le token reçu par email (lien /verify-email?token=…)
   */
  verifyEmail: (token: string) =>
    apiClient.post('/api/auth/verify-email', { token }),

  /**
   * POST /api/auth/resend-verification
   * Public — renvoie un lien de vérification (remplace un lien expiré)
   */
  resendVerification: (email: string) =>
    apiClient.post('/api/auth/resend-verification', { email }),

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword: (email: string) =>
    apiClient.post('/api/auth/forgot-password', { email }),

  /**
   * POST /api/auth/reset-password
   */
  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password', { email, code, newPassword }),

  /**
   * POST /api/auth/reset-password — définir un mot de passe via lien tokenisé (invitation)
   */
  definirMotDePasse: (token: string, nouveauMotDePasse: string) =>
    apiClient.post('/api/auth/reset-password', { token, nouveauMotDePasse }),

  /**
   * POST /api/auth/change-password
   * Authenticated
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/auth/change-password', { currentPassword, newPassword }),

  /**
   * POST /auth/google
   * Public — exchange Google ID token for our JWT
   */
  loginWithGoogle: (idToken: string) =>
    apiClient.post<ApiLoginResponse>('/auth/google', { idToken }),
}
