import { apiRequest, authTokenStorage } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

const MOCK_USER_KEY = 'fitlab_mock_user'

function mapApiUser(user) {
  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    role: String(user.role || '').toLowerCase(),
  }
}

function toStoreUser(user) {
  return {
    userId: user.userId,
    email: user.email,
    name: user.fullName,
    role: user.role,
  }
}

function persistMockUser(user) {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user))
}

function readMockUser() {
  const raw = localStorage.getItem(MOCK_USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function clearMockUser() {
  localStorage.removeItem(MOCK_USER_KEY)
}

function getFallbackProfile(role) {
  const fallbackProfiles = {
    member: { name: 'Jordan Wells', role: 'member', email: 'jordan@fit-lab.app' },
    trainer: { name: 'Avery Cole', role: 'trainer', email: 'avery@fit-lab.app' },
    admin: { name: 'Morgan Lee', role: 'admin', email: 'morgan@fit-lab.app' },
  }

  return fallbackProfiles[role] || fallbackProfiles.member
}

export async function login({ email, password, name, role }) {
  if (useApiMode) {
    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    authTokenStorage.set(payload.token)
    const user = mapApiUser(payload.user)
    return {
      token: payload.token,
      user: toStoreUser(user),
    }
  }

  const mockUsers = getMockState().users
  const byEmail = mockUsers.find((item) => item.email.toLowerCase() === String(email || '').toLowerCase())
  const base = byEmail || getFallbackProfile(role || 'member')
  const user = {
    userId: byEmail?.id || `mock-${Date.now()}`,
    name: name || base.name,
    role: byEmail?.role || role || base.role,
    email: email || base.email,
  }

  persistMockUser(user)

  return {
    token: 'mock-token',
    user,
  }
}

export async function register({ fullName, email, password }) {
  if (useApiMode) {
    const payload = await apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
    })

    authTokenStorage.set(payload.token)
    const user = mapApiUser(payload.user)
    return {
      token: payload.token,
      user: toStoreUser(user),
    }
  }

  const user = {
    userId: `mock-${Date.now()}`,
    name: fullName,
    role: 'member',
    email,
  }
  persistMockUser(user)

  return {
    token: 'mock-token',
    user,
  }
}

export async function getMe() {
  if (useApiMode) {
    const payload = await apiRequest('/auth/me')
    const user = mapApiUser(payload.user)
    return toStoreUser(user)
  }

  return readMockUser()
}

export function logout() {
  authTokenStorage.clear()
  clearMockUser()
}
