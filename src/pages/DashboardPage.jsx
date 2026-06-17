import { useEffect } from 'react'
import { useLinks } from '@/hooks/useLinks'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Link2, ExternalLink, Copy, Trash2, QrCode, Calendar, ArrowUpRight, Share2 } from 'lucide-react'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import QRCodeModal from '@/components/QRCodeModal'
import ShareLinkModal from '@/components/ShareLinkModal'

export default function DashboardPage() {
  const { user } = useAuth()
  const { links, fetchLinks, deleteLink, isLoading: linksLoading } = useLinks()
  const { stats, fetchOverallStats } = useAnalytics()
  const [qrCodeLink, setQrCodeLink] = useState(null)
  const [shareLink, setShareLink] = useState(null)

  useEffect(() => {
    fetchLinks()
    fetchOverallStats()
  }, [fetchLinks, fetchOverallStats])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      await deleteLink(id)
      fetchOverallStats()
    }
  }

  const handleCopy = (shortCode) => {
    const url = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(url)
    // could add a toast here
  }

  return (
    <DashboardLayout>
      <SEO title="Dashboard | RYZ Shortlink" />

      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <div className="space-y-8 animate-fade-in-up">
          
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.user_metadata?.full_name || 'User'}!</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bitly-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Total Clicks
              </p>
              <p className="text-4xl font-extrabold text-slate-900">{stats.totalClicks}</p>
              <p className="text-xs text-green-600 mt-3 flex items-center gap-1 font-semibold"><ArrowUpRight className="h-3 w-3" /> +12% this week</p>
            </div>
            
            <div className="bitly-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Unique Visitors
              </p>
              <p className="text-4xl font-extrabold text-slate-900">{Math.floor(stats.totalClicks * 0.7)}</p>
            </div>
            
            <div className="bitly-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Active Links
              </p>
              <p className="text-4xl font-extrabold text-slate-900">{stats.activeLinks}</p>
            </div>
            
            <div className="bitly-card p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Avg. CTR
              </p>
              <p className="text-4xl font-extrabold text-slate-900">24.5%</p>
            </div>
          </div>

          {/* Link List */}
          <div className="bitly-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Your Recent Links</h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 rounded text-sm px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-[#0b5cff]">
                  <option>Filter</option>
                  <option>Marketing</option>
                  <option>Social</option>
                </select>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {linksLoading && <div className="text-center py-10"><div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div></div>}
              {!linksLoading && links.length === 0 && (
                <div className="py-16 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4"><Link2 className="h-6 w-6 text-slate-400" /></div>
                  <p className="text-slate-600 font-medium mb-4">No links found.</p>
                </div>
              )}
              
              {links.map(link => (
                <div key={link.id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate mb-1">{link.title || link.short_code}</h3>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <a href={`/${link.short_code}`} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:text-[#094bdd] hover:underline text-sm font-bold flex items-center gap-1 transition-colors">
                        ryz.my.id/{link.short_code} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <p className="text-slate-500 text-sm truncate max-w-xl">{link.original_url}</p>

                    <div className="flex gap-2 mt-3 items-center">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" /> {new Date(link.created_at).toLocaleDateString()}
                      </span>
                      {link.category && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 uppercase">{link.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xl">{link.clicks_count || 0}</p>
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">Engagements</p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                      <button onClick={() => setShareLink(link)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title="Share Access">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setQrCodeLink(link)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title="QR Code">
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleCopy(link.short_code)} className="p-2 text-slate-400 hover:text-[#0b5cff] hover:bg-blue-50 rounded transition-colors" title="Copy Link">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <QRCodeModal isOpen={!!qrCodeLink} onClose={() => setQrCodeLink(null)} link={qrCodeLink} />
      <ShareLinkModal isOpen={!!shareLink} onClose={() => setShareLink(null)} link={shareLink} />
    </DashboardLayout>
  )
}
