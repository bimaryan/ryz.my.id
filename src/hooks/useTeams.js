import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './useSession'

export function useTeams() {
  const { session } = useSession()
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTeams = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch teams owned by user OR where user is a member
      const { data: ownedTeams, error: err1 } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', session.user.id)

      if (err1) throw err1
      
      setTeams(ownedTeams || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const createTeam = useCallback(async (teamData) => {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' }
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        owner_id: session.user.id,
        name: teamData.name,
        slug: teamData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: teamData.description || null,
        plan_type: 'free',
        members_count: 1
      }

      const { data, error: err } = await supabase
        .from('teams')
        .insert([payload])
        .select()
        .single()

      if (err) throw err
      
      // Auto-add owner to team_members
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: session.user.id,
          role: 'owner'
        }])

      setTeams(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [session])

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    createTeam
  }
}
