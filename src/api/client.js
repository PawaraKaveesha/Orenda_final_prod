import axios from 'axios'

const TOKEN_KEY = 'orenda_admin_token'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_BASE || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Server image paths are stored relative, e.g. "/images/img-09.jpeg". In dev
// the Vite proxy serves them; in production the frontend host (Cloudflare
// Pages) does not, so prefix them with the API origin (VITE_API_URL).
export function resolveImageUrl(url) {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return url
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap the { success, data } envelope so callers receive the payload directly.
api.interceptors.response.use(
  (response) => response.data?.success === false ? Promise.reject(response.data) : response.data?.data,
  (error) => {
    if (error.response?.status === 401) {
      const on401 = error.config?.skipAuthRedirect
      if (!on401) {
        clearToken()
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ECONNABORTED' ? 'The server took too long to respond.' : 'Network error — is the API running?')
    const normalized = new Error(message)
    normalized.status = error.response?.status
    normalized.data = error.response?.data
    return Promise.reject(normalized)
  },
)

export default api
