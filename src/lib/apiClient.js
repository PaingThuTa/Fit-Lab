import { apiBaseUrl } from './dataMode'

const TOKEN_KEY = 'fitlab_token'

export const authTokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token) {
    if (!token) return
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

function buildUrl(path, query = undefined) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${apiBaseUrl}${normalizedPath}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, query, headers = {}, token, signal } = options

  const authToken = token || authTokenStorage.get()
  const hasBody = body !== undefined
  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const errorMessage = payload?.message || `Request failed with status ${response.status}`
    const error = new Error(errorMessage)
    error.status = response.status
    error.details = payload?.details
    throw error
  }

  return payload
}
