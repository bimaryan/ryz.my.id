import { useState, useEffect } from 'react'
import { useApiKeys } from '@/hooks/useApiKeys'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SEO from '@/components/SEO'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { Shield, Key, Copy, Plus, Trash2, X, AlertCircle } from 'lucide-react'

export default function ApiKeysPage() {
  const { apiKeys, fetchApiKeys, createApiKey, deleteApiKey, isLoading } = useApiKeys()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedToken, setGeneratedToken] = useState(null)
  const [error, setError] = useState(null)
  const [keyToDelete, setKeyToDelete] = useState(null)

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    const res = await createApiKey(newKeyName)
    if (res.success) {
      setGeneratedToken(res.token)
      setNewKeyName('')
    } else {
      setError(res.error)
    }
  }

  const handleDelete = (id) => {
    setKeyToDelete(id)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Kunci disalin ke papan klip!')
  }

  const closeAndResetModal = () => {
    setIsModalOpen(false)
    setGeneratedToken(null)
    setNewKeyName('')
    setError(null)
  }

  return (
    <DashboardLayout>
      <SEO title="Kunci API | RYZ Shortlink" />
      
      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3">Kunci Akses API</h1>
              <p className="text-slate-600 font-medium">
                Buat kunci API aman untuk berinteraksi dengan RYZ Shortlink secara terprogram. Gunakan kunci ini untuk mengautentikasi dan mengotomatiskan pembuatan tautan dari aplikasi Anda sendiri.
              </p>
            </div>
            <div>
              <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1.5" /> Buat Kunci Baru
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
              <h2 className="text-xl font-extrabold text-slate-800">Kunci API Aktif</h2>
            </div>
            
            {isLoading && apiKeys.length === 0 ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-16 text-center bg-white">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Key className="h-10 w-10 text-[#0b5cff]" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">Belum ada kunci API yang dibuat.</h3>
                <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">Mulai integrasikan aplikasi Anda dengan membuat kunci akses pertama Anda.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-6 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/80 transition-colors duration-300">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{key.name}</h3>
                        {key.is_active ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Aktif</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Dicabut</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-slate-700 font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                          ryz_live_••••••••••••••••••••
                        </p>
                        <span className="text-sm text-slate-500 font-medium">
                          Dibuat pada {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-slate-500 hidden sm:block text-right">
                        <span className="block text-xs uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Terakhir Digunakan</span>
                        <span className="text-slate-900 font-bold">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Belum Pernah'}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-6">
                        <button onClick={() => handleDelete(key.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Cabut Kunci">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Shield className="text-[#0b5cff] h-6 w-6" />
                {generatedToken ? 'Kunci API Berhasil Dibuat' : 'Buat Kunci Baru'}
              </h3>
              <button onClick={closeAndResetModal} className="text-slate-400 hover:text-slate-700 transition-colors p-2 hover:bg-slate-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {generatedToken ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex gap-3 shadow-sm">
                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">
                      Harap salin kunci API ini sekarang. Untuk alasan keamanan, Anda <strong className="text-amber-900 font-extrabold">tidak akan dapat melihatnya lagi</strong>.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedToken} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-4 pr-28 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10"
                    />
                    <button 
                      onClick={() => handleCopy(generatedToken)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-[#0b5cff] to-indigo-600 text-white hover:from-[#094acc] hover:to-indigo-700 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 text-xs"
                    >
                      <Copy className="h-4 w-4" /> Salin
                    </button>
                  </div>

                  <Button onClick={closeAndResetModal} variant="secondary" className="w-full mt-2">
                    Saya sudah menyalin kuncinya
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-5">
                  <Input 
                    label={<span className="text-slate-700 font-bold text-sm">Nama Kunci</span>} 
                    placeholder="misal: Server Produksi, Integrasi Zapier" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                  />
                  
                  {error && <p className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                  
                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                    <Button type="button" onClick={closeAndResetModal} variant="secondary">Batal</Button>
                    <Button type="submit" isLoading={isLoading} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Buat Kunci</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={keyToDelete !== null}
        onClose={() => setKeyToDelete(null)}
        onConfirm={async () => {
          if (keyToDelete) {
            await deleteApiKey(keyToDelete);
            toast.success("Kunci API dicabut.");
            setKeyToDelete(null);
          }
        }}
        title="Cabut Kunci API"
        message="Aplikasi yang menggunakan kunci ini akan langsung kehilangan akses! Apakah Anda yakin ingin mencabut kunci ini?"
        confirmText="Cabut Kunci"
      />
    </DashboardLayout>
  )
}
