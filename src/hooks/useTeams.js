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
      // 1. Fetch teams owned by user
      const { data: ownedTeams, error: err1 } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', session.user.id)

      if (err1) throw err1

      // 2. Fetch teams where user is a member
      const { data: memberships, error: memErr } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)

      if (memErr) throw memErr

      const teamIds = memberships.map(m => m.team_id)
      
      let memberTeams = []
      if (teamIds.length > 0) {
        const { data: userTeams, error: err2 } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          
        if (err2) throw err2
        memberTeams = userTeams || []
      }

      // Combine and deduplicate
      const allTeams = [...(ownedTeams || []), ...memberTeams]
      const uniqueTeams = Array.from(new Map(allTeams.map(item => [item.id, item])).values())
      
      setTeams(uniqueTeams)
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

  const fetchTeamDetails = useCallback(async (teamId) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()
      if (teamErr) throw teamErr

      // Fetch members using RPC to bypass RLS on users table
      const { data: rawMembers, error: memErr } = await supabase.rpc('get_team_members', { p_team_id: teamId })
      if (memErr) throw memErr

      // Map rawMembers to match expected structure
      const members = rawMembers.map(m => ({
        id: m.id,
        role: m.role,
        joined_at: m.joined_at,
        users: {
          id: m.user_id,
          email: m.email,
          full_name: m.full_name,
          avatar_url: m.avatar_url
        }
      }))

      const { data: links, error: linkErr } = await supabase
        .from('team_links')
        .select(`
          id, created_at,
          links!inner(*)
        `)
        .eq('team_id', teamId)
      if (linkErr) throw linkErr

      return { success: true, data: { team, members, links } }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addTeamMember = useCallback(async (teamId, email, role = 'member') => {
    try {
      // Use SECURITY DEFINER RPC to bypass INSERT RLS and check email securely
      const { data, error: rpcErr } = await supabase.rpc('invite_team_member', { 
        p_team_id: teamId, 
        p_email: email, 
        p_role: role 
      })

      if (rpcErr) throw rpcErr
      
      // Update member count (if the RPC didn't already trigger a db function)
      await supabase.rpc('increment_team_members', { p_team_id: teamId })

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Error inviting member' }
    }
  }, [])

  const removeTeamMember = useCallback(async (teamId, userId) => {
    try {
      const { error: delErr } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (delErr) throw delErr
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const updateTeam = useCallback(async (teamId, updates) => {
    try {
      const { error: err } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)

      if (err) throw err
      
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const deleteTeam = useCallback(async (teamId) => {
    try {
      const { error: err } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (err) throw err
      
      setTeams(prev => prev.filter(t => t.id !== teamId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    fetchTeamDetails,
    addTeamMember,
    removeTeamMember
  }
}
