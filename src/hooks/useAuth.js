import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useAuth() {
  const { session } = useSession()
  const user = session?.user
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const signUp = useCallback(async ({ email, password, full_name, username, captchaToken }) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: { 
            full_name,
            username 
          },
        },
      })

      if (authError) throw authError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async ({ email, password, captchaToken }) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      })

      if (authError) throw authError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (authError) throw authError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })
      if (updateError) throw updateError

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.id) {
        const publicUpdates = {}
        if (updates.full_name !== undefined) publicUpdates.full_name = updates.full_name;
        if (updates.avatar_url !== undefined) publicUpdates.avatar_url = updates.avatar_url;
        
        if (Object.keys(publicUpdates).length > 0) {
          const { error: publicUpdateError } = await supabase
            .from('users')
            .update(publicUpdates)
            .eq('id', currentUser.id);
            
          if (publicUpdateError) {
             console.error('Failed to sync to public.users:', publicUpdateError);
          }
        }
      }

      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (updateError) throw updateError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateEmail = useCallback(async (newEmail) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      })
      if (updateError) throw updateError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updatePassword,
    updateEmail,
    resetPassword,
    isLoading,
    error,
  }
}
