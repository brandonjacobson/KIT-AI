import { useState, useEffect, useCallback } from 'react'
import {
  getMedicalContext,
  fetchAndUpdate,
  ensureMedicalData,
} from '../services/medicalCacheService'

export function useMedicalCache() {
  const [context, setContext] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadContext = useCallback(async () => {
    try {
      const ctx = await getMedicalContext()
      setContext(ctx)
    } catch (err) {
      console.warn('Failed to load medical context:', err)
      setContext('')
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!navigator.onLine) return
    setIsRefreshing(true)
    try {
      await fetchAndUpdate()
      await loadContext()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadContext])

  // On mount: ensure IndexedDB is populated from static file (works offline too)
  useEffect(() => {
    ensureMedicalData().then(loadContext)
  }, [loadContext])

  // If online, also sync from backend/remote sources
  useEffect(() => {
    if (navigator.onLine) {
      fetchAndUpdate().then(loadContext)
    }
  }, [loadContext])

  const getContext = useCallback(async () => {
    if (context) return context
    return await getMedicalContext()
  }, [context])

  return { getContext, context, refresh, isRefreshing, isOnline: navigator.onLine }
}
