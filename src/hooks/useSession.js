import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifySession = async (currentSession) => {
      if (!currentSession?.user) {
        setSession(null)
        setIsLoading(false)
        return
      }

      // Verify user exists in public.users (Security check)
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', currentSession.user.id)
        .single()

      if (error || !data) {
        // User not found in public.users, force logout!
        await supabase.auth.signOut()
        setSession(null)
        window.location.href = '/login'
      } else {
        setSession(currentSession)
      }
      setIsLoading(false)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      verifySession(initialSession)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      verifySession(newSession)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return { session, isLoading }
}
