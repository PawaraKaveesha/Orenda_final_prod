import axios from 'axios'

const TOKEN_KEY = 'orenda_admin_token'

/**
 * Normalizes configured VITE_API_URL and returns API origin and baseURL prefix.
 * Handles all 7 deployment cases:
 *  1. VITE_API_URL=https://example-api.onrender.com
 *  2. VITE_API_URL=https://example-api.onrender.com/api
 *  3. Empty VITE_API_URL when frontend and API share the same origin
 *  4. Frontend hosted separately from backend in production (fallback to production API domain)
 *  5. Relative API image URLs (/api/images/<gridfs-id>)
 *  6. Existing absolute image URLs
 *  7. Trailing slashes and accidental duplicate /api segments
 */
export function computeApiConfig(envUrl = import.meta?.env?.VITE_API_URL, isProd = import.meta?.env?.PROD) {
  const defaultProdApi = 'https://orenda-api.onrender.com'
  const raw = (envUrl || '').trim().replace(/\/+$/, '')
  // In production, fallback to production API domain if not explicitly provided
  const configured = raw || (isProd ? defaultProdApi : '')
  const apiOrigin = configured.replace(/\/api$/i, '').replace(/\/+$/, '')
  const apiBase = apiOrigin ? `${apiOrigin}/api` : '/api'

  return { configured, apiOrigin, apiBase }
}

const { apiOrigin, apiBase } = computeApiConfig()

export const api = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Resolves any image URL to a valid, usable URL string.
 * - Absolute URLs (https://, http://, data:, blob:) remain unchanged.
 * - Vite-bundled assets (/assets/...) are served from the frontend host.
 * - Server paths (/api/images/..., /images/...) are prefixed with apiOrigin when backend is remote.
 * - Accidental duplicate /api segments are prevented.
 */
export function resolveImageUrl(url, customOrigin = apiOrigin) {
  if (!url) return ''
  if (typeof url === 'object') {
    url = url.src || url.image_url || url.rawSrc || url.url || ''
  }
  if (typeof url !== 'string' || !url) return ''
  url = url.trim()

  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  // Vite-bundled static assets on frontend host
  if (url.startsWith('/assets/') || url.startsWith('assets/') || url.startsWith('/@fs/')) {
    return url.startsWith('/') ? url : `/${url}`
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`

  if (customOrigin) {
    const origin = customOrigin.replace(/\/api$/i, '').replace(/\/+$/, '')
    // Prevent accidental /api/api if cleanPath is /api/... and origin ends with /api
    if (origin.endsWith('/api') && cleanPath.startsWith('/api/')) {
      return `${origin}${cleanPath.slice(4)}`
    }
    return `${origin}${cleanPath}`
  }

  return cleanPath
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
  (response) => (response.data?.success === false ? Promise.reject(response.data) : response.data?.data),
  (error) => {
    if (error.response?.status === 401) {
      const on401 = error.config?.skipAuthRedirect
      if (!on401) {
        clearToken()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
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
