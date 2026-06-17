import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useLinks() {
  const { session } = useSession()
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLinks = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: err } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setLinks(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createLink = useCallback(async (linkData) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      const short_code = linkData.custom_slug || generateShortCode()
      
      const payload = {
        user_id: session.user.id,
        original_url: linkData.original_url,
        short_code: short_code,
        custom_slug: linkData.custom_slug || null,
        title: linkData.title || null,
        description: linkData.description || null,
        tags: linkData.tags ? linkData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        category: linkData.category || null,
        password_hash: linkData.password || null, // In production this should be hashed on backend
        expires_at: linkData.expires_at ? new Date(linkData.expires_at).toISOString() : null,
        utm_source: linkData.utm_source || null,
        utm_medium: linkData.utm_medium || null,
        utm_campaign: linkData.utm_campaign || null,
      }

      const { data, error: err } = await supabase
        .from('links')
        .insert([payload])
        .select()
        .single()

      if (err) throw err
      
      // Update local state
      setLinks(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const deleteLink = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (err) throw err
      
      // Update local state
      setLinks(prev => prev.filter(link => link.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    links,
    isLoading,
    error,
    fetchLinks,
    createLink,
    deleteLink
  }
}
