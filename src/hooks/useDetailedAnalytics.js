import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useDetailedAnalytics() {
  const { session } = useSession()
  const [data, setData] = useState({
    devices: [],
    referrers: [],
    recentClicks: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    try {
      // Fetch all links belonging to the user
      const { data: links, error: linksErr } = await supabase
        .from('links')
        .select('id, title, short_code')
        .eq('user_id', session.user.id)

      if (linksErr) throw linksErr
      if (!links || links.length === 0) {
        setIsLoading(false)
        return
      }

      const linkIds = links.map(l => l.id)

      // Fetch analytics for these links
      const { data: analytics, error: analyticsErr } = await supabase
        .from('analytics')
        .select('*')
        .in('link_id', linkIds)
        .order('created_at', { ascending: false })

      if (analyticsErr) throw analyticsErr

      // Group locally for MVP
      const deviceCount = {}
      const referrerCount = {}

      analytics.forEach(row => {
        // Device processing
        const device = row.device_type || 'unknown'
        deviceCount[device] = (deviceCount[device] || 0) + 1

        // Referrer processing
        let ref = row.referrer || 'Direct'
        if (ref !== 'Direct' && ref.includes('//')) {
          try { ref = new URL(ref).hostname } catch (e) {}
        }
        referrerCount[ref] = (referrerCount[ref] || 0) + 1
      })

      // Convert to array format for easy mapping in UI
      const formatGroup = (obj) => Object.keys(obj).map(name => ({ name, value: obj[name] })).sort((a, b) => b.value - a.value)

      // Map recent clicks with link details
      const recentClicks = analytics.slice(0, 10).map(click => {
        const link = links.find(l => l.id === click.link_id)
        return {
          ...click,
          linkTitle: link?.title || link?.short_code || 'Unknown Link',
          shortCode: link?.short_code || ''
        }
      })

      setData({
        devices: formatGroup(deviceCount),
        referrers: formatGroup(referrerCount).slice(0, 5), // Top 5
        recentClicks
      })

    } catch (err) {
      console.error('Error fetching detailed analytics:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  return { data, fetchAnalytics, isLoading, error }
}
