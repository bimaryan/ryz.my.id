import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useAuth() {
  const { session } = useSession()
  const user = session?.user
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const signUp = useCallback(async ({ email, password, full_name, username }) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
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

  const signIn = useCallback(async ({ email, password }) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
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

  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
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

  return {
    user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    updateEmail,
    isLoading,
    error,
  }
}
