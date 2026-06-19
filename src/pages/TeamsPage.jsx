import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Settings, UserPlus } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useTeams } from '@/hooks/useTeams'

export default function TeamsPage() {
  const { teams, fetchTeams, createTeam, updateTeam, deleteTeam, addTeamMember, isLoading } = useTeams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editTeamData, setEditTeamData] = useState(null)
  const [inviteTeamData, setInviteTeamData] = useState(null)
  const [teamToDelete, setTeamToDelete] = useState(null)
  
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
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

  const handleUpdateTeam = async (e) => {
    e.preventDefault()
    setAddError(null)
    setIsSubmitting(true)
    
    const res = await updateTeam(editTeamData.id, { name: nameInput, description: descInput })
    if (res.success) {
      setEditTeamData(null)
    } else {
      setAddError(res.error)
    }
    setIsSubmitting(false)
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setAddError(null)
    if (!inviteEmail) return
    setIsSubmitting(true)
    
    const res = await addTeamMember(inviteTeamData.id, inviteEmail, inviteRole)
    if (res.success) {
      import('react-hot-toast').then(({ default: toast }) => toast.success('Invite sent successfully!'))
      setInviteTeamData(null)
      setInviteEmail('')
      fetchTeams() // refresh member count
    } else {
      setAddError(res.error || 'Failed to send invite')
    }
    setIsSubmitting(false)
  }

  const handleDeleteTeamConfirm = (teamId) => {
    setTeamToDelete(teamId)
  }

  return (
    <>
      <DashboardLayout>
      <SEO title="Tim & Kolaborasi | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
              <Users className="h-8 w-8 text-[#0b5cff]" />
              Tim
            </h1>
              <p className="text-slate-600 font-medium">Berkolaborasi dalam tautan, domain kustom, dan analitik bersama tim Anda.</p>
            </div>
            <div>
              <Button size="md" onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" /> Buat Tim
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {isLoading && teams.length === 0 && (
               <div className="col-span-full text-center py-10"><div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div></div>
            )}

            {!isLoading && teams.length === 0 && (
              <div className="col-span-full bg-white border-dashed border-2 border-slate-200 rounded-3xl p-12 text-center">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Users className="h-10 w-10 text-[#0b5cff]" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-3">Bekerja lebih baik bersama-sama</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Buat ruang kerja tim untuk membagikan tautan, mengelola domain kustom, dan melihat analitik secara kolaboratif.</p>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">Buat Tim Pertama Anda</Button>
              </div>
            )}

            {teams.map(team => (
              <div key={team.id} className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group overflow-hidden">
                <Link to={`/dashboard/teams/${team.id}`} className="p-6 sm:p-8 flex-1 group-hover:bg-slate-50/50 transition-colors block">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-widest shadow-sm">
                      {team.plan_type}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">{team.name}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 min-h-[40px] leading-relaxed">{team.description || 'Tidak ada deskripsi.'}</p>
                </Link>
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <Users className="h-4 w-4 text-[#0b5cff]" />
                    {team.members_count} Anggota
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditTeamData(team); setNameInput(team.name); setDescInput(team.description || ''); }}
                      className="text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm h-10 w-10 flex items-center justify-center rounded-xl transition-all" title="Pengaturan">
                      <Settings className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInviteTeamData(team); }}
                      className="text-[#0b5cff] hover:bg-blue-50 border border-transparent hover:border-blue-100 h-10 w-10 flex items-center justify-center rounded-xl transition-all" title="Undang Anggota">
                      <UserPlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="text-xl font-extrabold text-slate-800">Buat Tim Baru</h3>
            </div>
            
            <form onSubmit={handleCreateTeam} className="p-6 space-y-5">
              <div>
                <Input 
                  label={<span className="text-slate-700 font-bold">Nama Tim</span>} 
                  placeholder="misal: Divisi Marketing" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi <span className="font-normal text-slate-400">(Opsional)</span></label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none p-4 min-h-[100px] resize-none"
                  placeholder="Untuk apa tim ini?"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                />
              </div>

              {addError && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button type="button" onClick={() => setIsAddModalOpen(false)} variant="secondary">Batal</Button>
                <Button type="submit" isLoading={isSubmitting} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Buat Ruang Kerja</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="text-xl font-extrabold text-slate-800">Pengaturan Tim</h3>
            </div>
            
            <form onSubmit={handleUpdateTeam} className="p-6 space-y-5">
              <div>
                <Input 
                  label={<span className="text-slate-700 font-bold">Nama Tim</span>} 
                  placeholder="misal: Divisi Marketing" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi <span className="font-normal text-slate-400">(Opsional)</span></label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none p-4 min-h-[100px] resize-none"
                  placeholder="Untuk apa tim ini?"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                />
              </div>

              {addError && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">
                  {addError}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                <Button type="button" onClick={() => handleDeleteTeamConfirm(editTeamData.id)} className="text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-xl">
                  Hapus Tim
                </Button>
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setEditTeamData(null)} variant="secondary">Batal</Button>
                  <Button type="submit" isLoading={isSubmitting} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Simpan Perubahan</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {inviteTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="text-xl font-extrabold text-slate-800">Undang ke {inviteTeamData.name}</h3>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div>
                <Input 
                  label={<span className="text-slate-700 font-bold">Email Pengguna</span>} 
                  placeholder="user@example.com" 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">Pengguna tersebut harus sudah memiliki akun terdaftar.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Peran (Role)</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5 h-[46px]"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Anggota (Member)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {addError && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button type="button" onClick={() => setInviteTeamData(null)} variant="secondary">Batal</Button>
                <Button type="submit" isLoading={isSubmitting} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Kirim Undangan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
      <ConfirmModal
        isOpen={teamToDelete !== null}
        onClose={() => setTeamToDelete(null)}
        onConfirm={async () => {
          if (teamToDelete) {
            await deleteTeam(teamToDelete)
            setEditTeamData(null)
            import('react-hot-toast').then(({ default: toast }) => toast.success('Tim telah dihapus.'))
            setTeamToDelete(null)
          }
        }}
        title="Hapus Tim"
        message="Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus tim ini?"
        confirmText="Hapus Tim"
      />
    </>
  )
}
