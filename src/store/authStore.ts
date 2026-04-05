import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/api/auth.api'
import { mapUser } from '@/api/mappers'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  login:           (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  register:        (name: string, email: string, phone: string, password: string) => Promise<void>
  logout:          () => Promise<void>
  refreshProfile:  () => Promise<void>
  updateProfile:   (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await authApi.login(email, password)
        set({ token: data.token, user: mapUser(data.user), isAuthenticated: true })
      },

      loginWithGoogle: async (idToken) => {
        const { data } = await authApi.loginWithGoogle(idToken)
        set({ token: data.token, user: mapUser(data.user), isAuthenticated: true })
      },

      register: async (name, email, phone, password) => {
        // Split name into prenom + nom (first word = prenom, rest = nom)
        const parts = name.trim().split(/\s+/)
        const prenom = parts[0]
        const nom    = parts.slice(1).join(' ') || prenom   // fallback if single word

        await authApi.register({ email, password, nom, prenom, telephone: phone })

        // Auto-login after registration
        const { data: loginData } = await authApi.login(email, password)
        set({
          token: loginData.token,
          user: mapUser(loginData.user),
          isAuthenticated: true,
        })
      },

      logout: async () => {
        try {
          if (get().token) {
            await authApi.logout()
          }
        } catch {
          // ignore logout errors — clear state regardless
        }
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshProfile: async () => {
        try {
          const { data } = await authApi.getProfile()
          set({ user: mapUser(data) })
        } catch {
          // silently fail — keep existing user data
        }
      },

      updateProfile: (data) =>
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'mysugu-auth' }
  )
)
