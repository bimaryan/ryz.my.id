import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkExpiration = async (currentUser) => {
    if (!currentUser) return currentUser;
    const metadata = currentUser.user_metadata;
    if (metadata?.plan_type && metadata.plan_type !== 'free' && metadata.plan_expires_at) {
      if (new Date(metadata.plan_expires_at) < new Date()) {
        console.log('Subscription expired. Downgrading to free tier.');
        const { data } = await supabase.auth.updateUser({
          data: {
            plan_type: 'free',
            max_links: 100,
            custom_domains: false,
            max_custom_domains: 1,
            max_team_members: 0,
            plan_expires_at: null,
            subscription_expired_at: new Date().toISOString()
          }
        });
        return data?.user || currentUser;
      }
    }
    return currentUser;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (initialSession) {
        initialSession.user = await checkExpiration(initialSession.user);
      }
      setSession(initialSession)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        newSession.user = await checkExpiration(newSession.user);
      }
      setSession(newSession)
      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return { session, isLoading }
}
