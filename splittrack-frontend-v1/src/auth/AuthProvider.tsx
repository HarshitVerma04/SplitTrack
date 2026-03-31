/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, me as meRequest, refresh as refreshRequest, signup as signupRequest } from './authApi'
import type { AuthResponse, AuthUser } from './types'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<void>
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'splittrack.auth.v1'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function persistAuth(response: AuthResponse) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }),
  )
}

function readPersistedAuth(): { accessToken: string; refreshToken: string; user: AuthUser } | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as { accessToken: string; refreshToken: string; user: AuthUser }
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = (response: AuthResponse) => {
    setUser(response.user)
    setAccessToken(response.accessToken)
    persistAuth(response)
  }

  const clearSession = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  useEffect(() => {
    const boot = async () => {
      const persisted = readPersistedAuth()
      if (!persisted) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await meRequest(persisted.accessToken)
        setUser(currentUser)
        setAccessToken(persisted.accessToken)
      } catch {
        try {
          const refreshed = await refreshRequest({ refreshToken: persisted.refreshToken })
          applySession(refreshed)
        } catch {
          clearSession()
        }
      } finally {
        setIsLoading(false)
      }
    }

    void boot()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login: async ({ email, password }) => {
        const result = await loginRequest({ email, password })
        applySession(result)
      },
      signup: async ({ name, email, password }) => {
        const result = await signupRequest({ name, email, password })
        applySession(result)
      },
      logout: () => {
        clearSession()
      },
    }),
    [accessToken, isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
