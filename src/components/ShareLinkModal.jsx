import { useEffect, useState } from 'react'
import { useLinkShares } from '@/hooks/useSharesAndPlans'
import { X, Share2, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export default function ShareLinkModal({ isOpen, onClose, link }) {
  const { user } = useAuth()
  const { shares, fetchShares, addShare, removeShare, isLoading } = useLinkShares()
  const [emailInput, setEmailInput] = useState('')
  const [error, setError] = useState(null)
  const [shareToRemove, setShareToRemove] = useState(null)

  useEffect(() => {
    if (isOpen && link) {
      fetchShares(link.id)
    }
  }, [isOpen, link, fetchShares])

  if (!isOpen || !link) return null

  const handleShare = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!emailInput || !emailInput.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    const res = await addShare({
      link_id: link.id,
      shared_by: user.id,
      shared_with_email: emailInput,
      permission_level: 'view'
    })

    if (res.success) {
      setEmailInput('')
    } else {
      setError(res.error)
    }
  }

  const handleRemove = (id) => {
    setShareToRemove(id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="text-[#0b5cff] h-5 w-5" /> Share Access
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm font-bold text-slate-900 mb-1">{link.title || link.short_code}</p>
          <p className="text-xs text-slate-500 mb-6 truncate">{link.original_url}</p>

          <form onSubmit={handleShare} className="flex items-end gap-3 mb-8">
            <div className="flex-1">
              <Input 
                label={<span className="text-sm font-bold text-slate-700">Invite by Email</span>} 
                placeholder="colleague@company.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bitly-input"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="bitly-button-primary mb-[2px]">
              Invite
            </Button>
          </form>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <h4 className="text-sm font-bold text-slate-900 mb-3">People with access</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#0b5cff] text-white flex items-center justify-center font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.email} (You)</p>
                  <p className="text-xs text-slate-500">Owner</p>
                </div>
              </div>
            </div>

            {shares?.filter(Boolean).map(share => (
              <div key={share?.id || Math.random()} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                    {share?.shared_with_email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{share?.shared_with_email}</p>
                    <p className="text-xs text-slate-500 capitalize">{share?.permission_level}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(share?.id)} 
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {!isLoading && (!shares || shares.filter(Boolean).length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No one else has access yet.</p>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={shareToRemove !== null}
        onClose={() => setShareToRemove(null)}
        onConfirm={async () => {
          if (shareToRemove) {
            await removeShare(shareToRemove);
            import('react-hot-toast').then(({ default: toast }) => toast.success("Access revoked."));
            setShareToRemove(null);
          }
        }}
        title="Remove access?"
        message="This user will no longer be able to access the link. Are you sure you want to remove access?"
        confirmText="Remove"
      />
    </div>
  )
}
