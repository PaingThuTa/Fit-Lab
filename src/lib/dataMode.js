const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

export const useApiMode = String(env.VITE_USE_API || '').toLowerCase() === 'true'
export const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5000/api'
