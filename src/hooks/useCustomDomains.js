import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useCustomDomains() {
  const { session } = useSession()
  const [domains, setDomains] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDomains = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setDomains(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const addDomain = useCallback(async (domainName) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      // 1. Clean up domain input
      const cleanDomain = domainName.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase().trim()

      const payload = {
        user_id: session.user.id,
        domain: cleanDomain,
        is_verified: false, // Default logic: wait for DNS check
        is_active: true,
        is_primary: domains.length === 0, // First domain becomes primary
      }

      const { data, error: err } = await supabase
        .from('custom_domains')
        .insert([payload])
        .select()
        .single()

      if (err) throw err
      
      setDomains(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session, domains])

  const deleteDomain = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', id)

      if (err) throw err
      
      setDomains(prev => prev.filter(d => d.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    domains,
    isLoading,
    error,
    fetchDomains,
    addDomain,
    deleteDomain
  }
}
