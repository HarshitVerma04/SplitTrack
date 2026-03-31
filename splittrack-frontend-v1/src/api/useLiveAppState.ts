import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getAppState, type AppState } from './appApi'

type PageMode = 'live' | 'demo'

export function useLiveAppState(mode: PageMode) {
  const { accessToken } = useAuth()
  const [appState, setAppState] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(mode === 'live')
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (mode === 'demo') {
      setIsLoading(false)
      setError(null)
      setAppState(null)
      return
    }

    if (!accessToken) {
      setIsLoading(false)
      setError('No active session found.')
      setAppState(null)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getAppState(accessToken)
        if (!cancelled) {
          setAppState(result)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load data from API.'
          setError(message)
          setAppState(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [mode, accessToken, refreshTick])

  return {
    appState,
    isLoading,
    error,
    refetch: () => setRefreshTick((tick) => tick + 1),
  }
}
