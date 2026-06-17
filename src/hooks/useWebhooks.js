import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useWebhooks() {
  const { session } = useSession()
  const [webhooks, setWebhooks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWebhooks = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setWebhooks(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const addWebhook = useCallback(async (webhookData) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        user_id: session.user.id,
        url: webhookData.url,
        event_type: webhookData.event_type || 'link.clicked',
        headers: webhookData.headers || {},
        is_active: true,
      }

      const { data, error: err } = await supabase
        .from('webhooks')
        .insert([payload])
        .select()
        .single()

      if (err) throw err
      
      setWebhooks(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const deleteWebhook = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)

      if (err) throw err
      
      setWebhooks(prev => prev.filter(w => w.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleWebhook = useCallback(async (id, currentStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('webhooks')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      
      setWebhooks(prev => prev.map(w => w.id === id ? data : w))
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    webhooks,
    isLoading,
    error,
    fetchWebhooks,
    addWebhook,
    deleteWebhook,
    toggleWebhook
  }
}
