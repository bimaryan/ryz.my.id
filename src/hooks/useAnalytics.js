import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useAnalytics() {
  const { session } = useSession()
  const [stats, setStats] = useState({ totalClicks: 0, activeLinks: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOverallStats = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch active links count and total clicks from the links table directly 
      // (clicks_count is a field in links table per schema)
      const { data, error: err } = await supabase
        .from('links')
        .select('is_active, clicks_count')
        .eq('user_id', session.user.id)

      if (err) throw err

      let totalClicks = 0
      let activeLinks = 0

      data.forEach(link => {
        totalClicks += (link.clicks_count || 0)
        if (link.is_active) activeLinks += 1
      })

      setStats({ totalClicks, activeLinks })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  return {
    stats,
    isLoading,
    error,
    fetchOverallStats
  }
}
