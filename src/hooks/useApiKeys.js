import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useApiKeys() {
  const { session } = useSession()
  const [apiKeys, setApiKeys] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchApiKeys = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setApiKeys(data)
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const createApiKey = useCallback(async (name) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, generate a secure random string and hash it.
      // For this MVP, we use crypto.randomUUID() as the token.
      const rawToken = `ryz_live_${crypto.randomUUID().replace(/-/g, '')}`
      
      const { data, error: err } = await supabase
        .from('api_keys')
        .insert([{
          user_id: session.user.id,
          name: name || 'Default Key',
          key_hash: rawToken // Ideally hash this before storing
        }])
        .select()
        .single()

      if (err) throw err
      
      setApiKeys(prev => [data, ...prev])
      return { success: true, token: rawToken, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const deleteApiKey = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (err) throw err
      
      setApiKeys(prev => prev.filter(k => k.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  return { apiKeys, fetchApiKeys, createApiKey, deleteApiKey, isLoading, error }
}
