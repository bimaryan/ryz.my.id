import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useActivityLog() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (err) throw err
      setLogs(data || [])
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logActivity = useCallback(async (action, details = {}) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use basic browser information for user agent parsing
      const parser = {
        browser: () => {
          const ua = navigator.userAgent;
          if (ua.includes('Firefox/')) return 'Firefox';
          if (ua.includes('Edg/')) return 'Edge';
          if (ua.includes('Chrome/')) return 'Chrome';
          if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
          return 'Unknown Browser';
        },
        os: () => {
          const ua = navigator.userAgent;
          if (ua.includes('Win')) return 'Windows';
          if (ua.includes('Mac')) return 'Mac OS';
          if (ua.includes('Linux')) return 'Linux';
          if (ua.includes('Android')) return 'Android';
          if (ua.includes('like Mac')) return 'iOS';
          return 'Unknown OS';
        }
      };

      const userAgentStr = `${parser.os()} • ${parser.browser()}`;

      const { error: err } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          details,
          user_agent: userAgentStr
        })

      if (err) throw err
    } catch (err) {
      console.error('Failed to log activity:', err)
      // We don't want to throw or disrupt the main flow if logging fails
    }
  }, [])

  return {
    logs,
    fetchLogs,
    logActivity,
    isLoading,
    error
  }
}
