import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Link2, Plus, ArrowLeft, Trash2, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useTeams } from '@/hooks/useTeams'
import { useAuth } from '@/hooks/useAuth'

export default function TeamDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { fetchTeamDetails, addTeamMember, removeTeamMember } = useTeams()
  
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState('members')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const loadData = async () => {
    setIsLoading(true)
    const res = await fetchTeamDetails(id)
    if (res.success) {
      setTeam(res.data.team)
      setMembers(res.data.members || [])
      setLinks(res.data.links || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteError(null)
    if (!inviteEmail) return
    setIsInviting(true)
    
    const res = await addTeamMember(id, inviteEmail, inviteRole)
    if (res.success) {
      toast.success('Member added successfully!')
      setIsInviteModalOpen(false)
      setInviteEmail('')
      loadData()
    } else {
      setInviteError(res.error || 'Failed to add member.')
    }
    setIsInviting(false)
  }

  const handleRemoveMember = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this member?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove!",
      customClass: {
        actions: "flex gap-3",
        confirmButton: "bg-[#d33] hover:bg-[#b32b2b] text-white font-bold py-2 px-4 rounded m-0",
        cancelButton: "bg-[#566b8f] hover:bg-[#435574] text-white font-bold py-2 px-4 rounded m-0"
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      const res = await removeTeamMember(id, userId)
      if (res.success) {
        Swal.fire({
          title: "Removed!",
          text: "Member removed from team.",
          icon: "success",
          confirmButtonColor: "#0b5cff"
        });
        setMembers(prev => prev.filter(m => m.users?.id !== userId))
      } else {
        toast.error('Failed to remove member')
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-10 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0b5cff] border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800">Team not found</h2>
        </div>
      </DashboardLayout>
    )
  }

  // Check if current user is owner/admin
  const currentUserMember = members.find(m => m.users?.id === user.id)
  const isAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'
  const isOwner = currentUserMember?.role === 'owner' || team.owner_id === user.id

  return (
    <DashboardLayout>
      <SEO title={`${team.name} | RYZ Shortlink`} />

      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          
          <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
            <Link to="/dashboard/teams" className="hover:text-[#0b5cff] flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to Teams</Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#0b5cff] to-[#094bdd] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{team.name}</h1>
                <p className="text-slate-500 font-medium mt-1">{team.description || 'No description'}</p>
              </div>
            </div>
            {isAdmin && (
              <Button size="md" onClick={() => setIsInviteModalOpen(true)} className="bitly-button-primary shadow-md">
                <Plus className="h-4 w-4 mr-2" /> Invite Member
              </Button>
            )}
          </div>

          <div className="flex gap-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'members' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Members ({members.length})
            </button>
            <button 
              onClick={() => setActiveTab('links')}
              className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'links' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Shared Links ({links.length})
            </button>
          </div>

          {activeTab === 'members' && (
            <div className="bitly-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {members.map(member => (
                  <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {member.users?.full_name?.charAt(0).toUpperCase() || member.users?.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{member.users?.full_name || member.users?.email}</p>
                        <p className="text-xs text-slate-500">{member.users?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role}
                      </span>
                      {isAdmin && member.role !== 'owner' && (
                        <button onClick={() => handleRemoveMember(member.users?.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove Member">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="bitly-card overflow-hidden">
              {links.length === 0 ? (
                <div className="p-12 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">No shared links yet</h3>
                  <p className="text-slate-500 text-sm font-medium">Links assigned to this team will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {links.map(teamLink => (
                    <div key={teamLink.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900">{teamLink.links?.title || teamLink.links?.short_code}</h3>
                        <a href={`/${teamLink.links?.short_code}`} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:underline text-sm font-bold">
                          ryz.my.id/{teamLink.links?.short_code}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{teamLink.links?.clicks_count || 0}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Invite Member</h3>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div>
                <Input 
                  label={<span className="text-slate-700 font-bold">User Email</span>} 
                  placeholder="user@example.com" 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bitly-input"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">The user must already have an account.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                <select 
                  className="bitly-input w-full px-4 h-11 rounded-lg border border-slate-300 focus:border-[#0b5cff] bg-white"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  {isOwner && <option value="admin">Admin</option>}
                </select>
              </div>

              {inviteError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold border border-red-200 rounded-lg">
                  {inviteError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" onClick={() => setIsInviteModalOpen(false)} className="bitly-button-secondary">Cancel</Button>
                <Button type="submit" isLoading={isInviting} className="bitly-button-primary">Send Invite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
