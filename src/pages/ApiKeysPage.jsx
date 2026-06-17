import { useState, useEffect } from 'react'
import { useApiKeys } from '@/hooks/useApiKeys'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SEO from '@/components/SEO'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Shield, Key, Copy, Plus, Trash2, X, AlertCircle } from 'lucide-react'

export default function ApiKeysPage() {
  const { apiKeys, fetchApiKeys, createApiKey, deleteApiKey, isLoading } = useApiKeys()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedToken, setGeneratedToken] = useState(null)
  const [error, setError] = useState(null)

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

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-900">Are you sure you want to revoke this API key?</p>
        <p className="text-xs text-slate-500">Applications using it will immediately lose access.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id)
            await deleteApiKey(id)
            toast.success('API key revoked')
          }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded">Revoke</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Key copied to clipboard!', { position: 'bottom-center' })
  }

  const closeAndResetModal = () => {
    setIsModalOpen(false)
    setGeneratedToken(null)
    setNewKeyName('')
    setError(null)
  }

  return (
    <DashboardLayout>
      <SEO title="API Keys | RYZ Shortlink" />
      
      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <div className="space-y-8 animate-fade-in-up">
          
          <div className="bitly-card p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">API Access Keys</h1>
              <p className="text-slate-600 font-medium">
                Generate secure API keys to programmatically interact with RYZ Shortlink. Use these keys to authenticate and automate link creation from your own applications.
              </p>
            </div>
            <div>
              <Button onClick={() => setIsModalOpen(true)} className="bitly-button-primary whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1.5" /> Generate New Key
              </Button>
            </div>
          </div>

          <div className="bitly-card overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Active API Keys</h2>
            </div>
            
            {isLoading && apiKeys.length === 0 ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-16 text-center bg-slate-50">
                <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Key className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">No API keys generated yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{key.name}</h3>
                        {key.is_active ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded font-bold uppercase">Active</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-0.5 rounded font-bold uppercase">Revoked</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-slate-700 font-mono text-sm bg-slate-100 px-3 py-1 rounded">
                          ryz_live_••••••••••••••••••••
                        </p>
                        <span className="text-sm text-slate-500">
                          Created on {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-slate-500 hidden sm:block text-right">
                        <span className="block text-xs uppercase font-semibold mb-0.5">Last Used</span>
                        <span className="text-slate-900 font-medium">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-6">
                        <button onClick={() => handleDelete(key.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Revoke Key">
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
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="text-[#0b5cff] h-5 w-5" />
                {generatedToken ? 'API Key Generated' : 'Generate New Key'}
              </h3>
              <button onClick={closeAndResetModal} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-200 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {generatedToken ? (
                <div className="space-y-6">
                  <div className="p-4 rounded bg-amber-50 border border-amber-200 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-medium">
                      Please copy this API key now. For security reasons, you will <strong className="text-amber-900">not be able to see it again</strong>.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedToken} 
                      className="w-full bg-slate-50 border border-slate-300 rounded py-3 pl-4 pr-24 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#0b5cff] focus:ring-1 focus:ring-[#0b5cff]"
                    />
                    <button 
                      onClick={() => handleCopy(generatedToken)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0b5cff] text-white hover:bg-[#094bdd] rounded font-bold transition-colors flex items-center gap-1.5 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>

                  <Button onClick={closeAndResetModal} className="w-full bitly-button-secondary mt-2">
                    I have copied my key
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-5">
                  <Input 
                    label={<span className="text-slate-700 font-bold text-sm">Key Name</span>} 
                    placeholder="e.g. Production Server, Zapier Integration" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                    className="bitly-input"
                  />
                  
                  {error && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded border border-red-200">{error}</p>}
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" onClick={closeAndResetModal} className="bitly-button-secondary">Cancel</Button>
                    <Button type="submit" isLoading={isLoading} className="bitly-button-primary">Generate Key</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
