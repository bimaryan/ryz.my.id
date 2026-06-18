import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useBillingHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setHistory(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const addBillingRecord = useCallback(async (record) => {
    if (!user) return { success: false, error: 'User not logged in' }
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('billing_history')
        .insert([{ 
          user_id: user.id, 
          ...record 
        }])
        .select()
        .single()

      if (err) throw err
      setHistory(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return { history, isLoading, error, fetchHistory, addBillingRecord }
}
