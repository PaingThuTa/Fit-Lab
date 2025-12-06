import { create } from 'zustand'

const fallbackProfiles = {
  member: { name: 'Jordan Wells', role: 'member' },
  trainer: { name: 'Avery Cole', role: 'trainer' },
  admin: { name: 'Morgan Lee', role: 'admin' },
}

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  login: ({ name = 'Fit-Lab User', role }) =>
    set({
      user: { name, role },
      role,
    }),
  logout: () => set({ user: null, role: null }),
  setRole: (role, name) =>
    set({
      role,
      user: role
        ? { name: name || fallbackProfiles[role]?.name || 'Guest', role }
        : null,
    }),
  updateUserName: (name) =>
    set((state) => ({
      user: state.user ? { ...state.user, name } : { name, role: state.role },
    })),
}))
