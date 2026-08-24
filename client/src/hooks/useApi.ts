import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(endpoint: string, deps: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.get(endpoint)
      setState({ data: res.data.data, loading: false, error: null })
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message || 'Failed to fetch' })
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  return { ...state, refetch: fetchData }
}
