import { create } from 'zustand'
import * as authService from '../services/authService'

const fallbackProfiles = {
  member: { name: 'Jordan Wells', role: 'member', email: 'jordan@fit-lab.app' },
  trainer: { name: 'Avery Cole', role: 'trainer', email: 'avery@fit-lab.app' },
  admin: { name: 'Morgan Lee', role: 'admin', email: 'morgan@fit-lab.app' },
}

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  token: null,
  theme: 'light',
  authReady: false,
  authLoading: false,
  authError: null,

  setHydrationLoading: () =>
    set({
      authReady: false,
      authLoading: true,
      authError: null,
    }),

  setHydratedAuth: (user) =>
    set({
      user: user || null,
      role: user?.role || null,
      authReady: true,
      authLoading: false,
      authError: null,
    }),

  login: async ({ email, password, name, role }) => {
    set({ authLoading: true, authError: null })

    try {
      const result = await authService.login({ email, password, name, role })
      set({
        user: result.user,
        role: result.user?.role || null,
        token: result.token,
        authReady: true,
        authLoading: false,
      })

      return result.user
    } catch (error) {
      set({ authLoading: false, authError: error.message || 'Login failed' })
      throw error
    }
  },

  register: async ({ fullName, email, password }) => {
    set({ authLoading: true, authError: null })

    try {
      const result = await authService.register({ fullName, email, password })
      set({
        user: result.user,
        role: result.user?.role || null,
        token: result.token,
        authReady: true,
        authLoading: false,
      })

      return result.user
    } catch (error) {
      set({ authLoading: false, authError: error.message || 'Registration failed' })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, role: null, token: null, authError: null, authReady: true })
  },

  setRole: (role, name, email) =>
    set({
      role,
      user: role
        ? {
            userId: `mock-${Date.now()}`,
            name: name || fallbackProfiles[role]?.name || 'Guest',
            role,
            email: email || fallbackProfiles[role]?.email || '',
          }
        : null,
    }),

  updateUserName: (name) =>
    set((state) => ({
      user: state.user ? { ...state.user, name } : { name, role: state.role, email: '' },
    })),

  setTheme: (theme) => set({ theme }),
}))
