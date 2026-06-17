import { useEffect, useState } from 'react'
import { Users, Plus, Settings, UserPlus } from 'lucide-react'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useTeams } from '@/hooks/useTeams'

export default function TeamsPage() {
  const { teams, fetchTeams, createTeam, isLoading } = useTeams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [addError, setAddError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    setAddError(null)
    setIsSubmitting(true)
    
    if (!nameInput || nameInput.length < 3) {
      setAddError('Team name must be at least 3 characters.')
      setIsSubmitting(false)
      return
    }

    const res = await createTeam({ name: nameInput, description: descInput })
    if (res.success) {
      setNameInput('')
      setDescInput('')
      setIsAddModalOpen(false)
    } else {
      setAddError(res.error)
    }
    setIsSubmitting(false)
  }

  return (
    <DashboardLayout>
      <SEO title="Teams & Collaboration | RYZ Shortlink" />

      <div className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full">
        <div className="space-y-8 animate-fade-in-up">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teams</h1>
              <p className="text-slate-500 font-medium mt-1">Collaborate on links, custom domains, and analytics with your team.</p>
            </div>
            <Button size="md" onClick={() => setIsAddModalOpen(true)} className="bitly-button-primary shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Create Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {isLoading && teams.length === 0 && (
               <div className="col-span-full text-center py-10"><div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div></div>
            )}

            {!isLoading && teams.length === 0 && (
              <div className="col-span-full bitly-card p-12 text-center bg-slate-50 border-dashed border-2">
                <div className="h-16 w-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Users className="h-8 w-8 text-[#0b5cff]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Work better together</h3>
                <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">Create a team workspace to share links, manage custom domains, and view analytics collaboratively.</p>
                <Button onClick={() => setIsAddModalOpen(true)} className="bitly-button-primary">Create Your First Team</Button>
              </div>
            )}

            {teams.map(team => (
              <div key={team.id} className="bitly-card flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0b5cff] to-[#094bdd] flex items-center justify-center text-white text-xl font-bold shadow-sm">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">
                      {team.plan_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{team.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{team.description || 'No description provided.'}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    {team.members_count} Member{team.members_count !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-200 h-8 w-8 p-0 flex items-center justify-center rounded-md" title="Settings">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#0b5cff] hover:bg-blue-50 h-8 w-8 p-0 flex items-center justify-center rounded-md" title="Invite Members">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Create a New Team</h3>
            </div>
            
            <form onSubmit={handleCreateTeam} className="p-6 space-y-5">
              <div>
                <Input 
                  label={<span className="text-slate-700 font-bold">Team Name</span>} 
                  placeholder="e.g. Marketing Dept" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bitly-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description <span className="font-normal text-slate-400">(Optional)</span></label>
                <textarea 
                  className="bitly-input w-full p-4 rounded-lg border border-slate-300 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 bg-white min-h-[100px] resize-none"
                  placeholder="What is this team for?"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                />
              </div>

              {addError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold border border-red-200 rounded-lg">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" onClick={() => setIsAddModalOpen(false)} className="bitly-button-secondary">Cancel</Button>
                <Button type="submit" isLoading={isSubmitting} className="bitly-button-primary">Create Workspace</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}
