import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useDnsRecords() {
  const { session } = useSession()
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRecords = useCallback(async (domainId) => {
    if (!session?.user?.id || !domainId) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('dns_records')
        .select('*')
        .eq('domain_id', domainId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setRecords(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const addRecord = useCallback(async (payload) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      const finalPayload = {
        ...payload,
        user_id: session.user.id
      }

      const { data, error: err } = await supabase
        .from('dns_records')
        .insert([finalPayload])
        .select()
        .single()

      if (err) throw err
      
      setRecords(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const deleteRecord = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from('dns_records')
        .delete()
        .eq('id', id)

      if (err) throw err
      
      setRecords(prev => prev.filter(r => r.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord
  }
}
