import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>(endpoint: string, deps: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!endpoint) {
      setState({ data: null, loading: false, error: null })
      return
    }
    if (!silent) {
      setState((s) => ({ ...s, loading: true, error: null }))
    }
    try {
      const res = await api.get(endpoint)
      if (mountedRef.current) {
        setState({ data: res.data.data, loading: false, error: null })
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err.message || 'Failed to fetch' })
      }
    }
  }, [endpoint])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [fetchData, ...deps])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { ...state, refetch }
}
