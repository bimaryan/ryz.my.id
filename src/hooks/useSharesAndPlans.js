import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function usePlanLimits() {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('plan_limits')
        .select('*')
        .order('max_links', { ascending: true })

      if (err) throw err
      setPlans(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { plans, isLoading, error, fetchPlans }
}

export function useLinkShares() {
  const [shares, setShares] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchShares = useCallback(async (linkId) => {
    if (!linkId) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('link_shares')
        .select('*')
        .eq('link_id', linkId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setShares(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addShare = useCallback(async ({ link_id, shared_by, shared_with_email }) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('link_shares')
        .insert([{ link_id, shared_by, shared_with_email }])
        .select()
        .single()

      if (err) throw err
      setShares(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeShare = useCallback(async (id) => {
    setIsLoading(true)
    try {
      const { error: err } = await supabase
        .from('link_shares')
        .delete()
        .eq('id', id)

      if (err) throw err
      setShares(prev => prev.filter(s => s.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { shares, isLoading, error, fetchShares, addShare, removeShare }
}
