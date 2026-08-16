import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login as apiLogin, logout as apiLogout } from '../api/auth'
import { getToken, setToken, clearToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the session on first load.
  useEffect(() => {
    let active = true
    const token = getToken()
    if (!token) {
      setLoading(false)
      return undefined
    }
    fetchMe()
      .then((me) => {
        if (active) setAdmin(me)
      })
      .catch(() => clearToken())
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, admin: sessionAdmin } = await apiLogin(email, password)
    setToken(token)
    setAdmin(sessionAdmin)
    return sessionAdmin
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      /* token is discarded regardless */
    }
    clearToken()
    setAdmin(null)
  }, [])

  const updateAdmin = useCallback((next) => setAdmin(next), [])

  const value = useMemo(
    () => ({ admin, loading, login, logout, updateAdmin }),
    [admin, loading, login, logout, updateAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
