import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function usePages() {
  const { session } = useSession()
  const [pages, setPages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPages = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch pages owned by user or where user is a team member
      const { data: userPages, error: err1 } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', session.user.id)

      if (err1) throw err1

      const { data: memberships, error: memErr } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)

      if (memErr) throw memErr

      let teamPages = []
      if (memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id)
        const { data: tPages, error: err2 } = await supabase
          .from('pages')
          .select('*')
          .in('team_id', teamIds)
          
        if (err2) throw err2
        teamPages = tPages || []
      }

      // Combine and deduplicate
      const allPages = [...(userPages || []), ...teamPages]
      const uniquePages = Array.from(new Map(allPages.map(item => [item.id, item])).values())
      // Sort by created_at desc
      uniquePages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setPages(uniquePages)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const getPage = useCallback(async (id) => {
    try {
      const { data, error: err } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()
        
      if (err) throw err
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const getPageBySlug = useCallback(async (slug) => {
    try {
      const { data, error: err } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()
        
      if (err) throw err
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const createPage = useCallback(async (pageData) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        user_id: session.user.id,
        slug: pageData.slug,
        title: pageData.title || null,
        description: pageData.description || null,
        team_id: pageData.team_id || null,
        avatar_url: pageData.avatar_url || null,
      }

      const { data, error: err } = await supabase
        .from('pages')
        .insert([payload])
        .select()
        .single()

      if (err) {
        if (err.code === '23505') { // Unique violation
          throw new Error('This slug is already taken. Please choose another one.')
        }
        throw err
      }

      setPages(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const updatePage = useCallback(async (id, updates) => {
    try {
      const { data, error: err } = await supabase
        .from('pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (err) {
        if (err.code === '23505') {
          throw new Error('This slug is already taken. Please choose another one.')
        }
        throw err
      }

      setPages(prev => prev.map(p => p.id === id ? data : p))
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const deletePage = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (err) throw err

      setPages(prev => prev.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const uploadImage = useCallback(async (file) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { success: true, url: data.publicUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [session])

  return {
    pages,
    isLoading,
    error,
    fetchPages,
    getPage,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    uploadImage
  }
}
