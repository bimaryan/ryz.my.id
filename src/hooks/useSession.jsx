import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'

let isUpdatingExpiration = false;

export const AuthSessionContext = createContext(null);

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkExpiration = async (currentUser) => {
    if (!currentUser) return currentUser;
    const metadata = currentUser.user_metadata;
    if (metadata?.plan_type && metadata.plan_type !== 'free' && metadata.plan_expires_at) {
      if (new Date(metadata.plan_expires_at) < new Date()) {
        if (isUpdatingExpiration) return currentUser;
        
        isUpdatingExpiration = true;
        console.log('Subscription expired. Downgrading to free tier.');
        try {
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
        } catch (error) {
          console.error("Failed to downgrade subscription:", error);
          return currentUser;
        } finally {
          isUpdatingExpiration = false;
        }
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
      setSession(initialSession);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        newSession.user = await checkExpiration(newSession.user);
      }
      setSession(newSession);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthSessionContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthSessionContext);
  if (context === null) {
    // Fallback if not wrapped in provider (should not happen if we wrap App)
    console.warn("useSession is being used outside of AuthSessionProvider!");
    return { session: null, isLoading: false };
  }
  return context;
}
