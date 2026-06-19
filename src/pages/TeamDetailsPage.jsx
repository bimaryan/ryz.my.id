import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Link2, Plus, ArrowLeft, Trash2, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
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
  const [memberToRemove, setMemberToRemove] = useState(null)

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
      toast.success('Anggota berhasil ditambahkan!')
      setIsInviteModalOpen(false)
      setInviteEmail('')
      loadData()
    } else {
      setInviteError(res.error || 'Gagal menambahkan anggota.')
    }
    setIsInviting(false)
  }

  const handleRemoveMember = (userId) => {
    setMemberToRemove(userId);
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
        <div className="flex-1 p-10 text-center animate-fade-in-up">
          <h2 className="text-2xl font-extrabold text-slate-800">Tim tidak ditemukan</h2>
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
            <Link to="/dashboard/teams" className="hover:text-[#0b5cff] flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Tim</Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shadow-blue-500/20">
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">{team.name}</h1>
                <p className="text-slate-500 font-medium mt-1">{team.description || 'Tidak ada deskripsi'}</p>
              </div>
            </div>
            {isAdmin && (
              <Button size="md" onClick={() => setIsInviteModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" /> Undang Anggota
              </Button>
            )}
          </div>

          <div className="flex gap-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'members' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Anggota ({members.length})
            </button>
            <button 
              onClick={() => setActiveTab('links')}
              className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'links' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Tautan Bersama ({links.length})
            </button>
          </div>

          {activeTab === 'members' && (
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {members.map(member => (
                  <div key={member.id} className="p-6 sm:px-8 flex items-center justify-between hover:bg-slate-50/80 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {member.users?.full_name?.charAt(0).toUpperCase() || member.users?.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{member.users?.full_name || member.users?.email}</p>
                        <p className="text-xs text-slate-500 font-medium">{member.users?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role === 'owner' ? 'Pemilik' : member.role === 'admin' ? 'Admin' : 'Anggota'}
                      </span>
                      {isAdmin && member.role !== 'owner' && (
                        <button onClick={() => handleRemoveMember(member.users?.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Keluarkan Anggota">
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
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
              {links.length === 0 ? (
                <div className="p-16 text-center bg-white">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Link2 className="h-10 w-10 text-[#0b5cff]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">Belum ada tautan yang dibagikan</h3>
                  <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">Tautan yang dibuat atas nama tim ini akan muncul di sini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {links.map(teamLink => (
                    <div key={teamLink.id} className="p-6 sm:px-8 flex items-center justify-between hover:bg-slate-50/80 transition-colors duration-300">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-1">{teamLink.links?.title || teamLink.links?.short_code}</h3>
                        <a href={`/${teamLink.links?.short_code}`} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:text-indigo-600 hover:underline text-sm font-bold transition-colors">
                          ryz.my.id/{teamLink.links?.short_code}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-900 text-xl">{teamLink.links?.clicks_count || 0}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Klik</p>
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
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="text-xl font-extrabold text-slate-800">Undang Anggota</h3>
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
                  {isOwner && <option value="admin">Admin</option>}
                </select>
              </div>

              {inviteError && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">
                  {inviteError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button type="button" onClick={() => setIsInviteModalOpen(false)} variant="secondary">Batal</Button>
                <Button type="submit" isLoading={isInviting} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Kirim Undangan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={async () => {
          if (memberToRemove) {
            const res = await removeTeamMember(id, memberToRemove)
            if (res.success) {
              toast.success("Anggota dikeluarkan dari tim.")
              setMembers(prev => prev.filter(m => m.users?.id !== memberToRemove))
            } else {
              toast.error('Gagal mengeluarkan anggota')
            }
            setMemberToRemove(null)
          }
        }}
        title="Keluarkan Anggota"
        message="Apakah Anda yakin ingin mengeluarkan anggota ini dari tim?"
        confirmText="Keluarkan"
      />
    </DashboardLayout>
  )
}
