import { io } from 'socket.io-client'
import { apiBaseUrl } from './dataMode'
import { authTokenStorage } from './apiClient'

function getSocketBaseUrl() {
  return String(apiBaseUrl).replace(/\/api\/?$/, '')
}

export function createAppSocket({ token } = {}) {
  const authToken = token || authTokenStorage.get()

  if (!authToken) {
    return null
  }

  return io(getSocketBaseUrl(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    timeout: 10000,
    auth: {
      token: authToken ? `Bearer ${authToken}` : undefined,
    },
  })
}
