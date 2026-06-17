import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { useLinks } from '@/hooks/useLinks'
import { Link2, ExternalLink, Copy, Trash2, QrCode, Calendar, Share2 } from 'lucide-react'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QRCodeModal from '@/components/QRCodeModal'
import ShareLinkModal from '@/components/ShareLinkModal'

export default function LinksPage() {
  const { links, fetchLinks, deleteLink, isLoading: linksLoading } = useLinks()
  const [qrCodeLink, setQrCodeLink] = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").toLowerCase();

  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    return (
      (link.title && link.title.toLowerCase().includes(searchQuery)) ||
      (link.short_code && link.short_code.toLowerCase().includes(searchQuery)) ||
      (link.original_url && link.original_url.toLowerCase().includes(searchQuery))
    );
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        confirmButton: "bg-[#d33] hover:bg-[#b32b2b] text-white font-bold py-2 px-4 rounded ml-2",
        cancelButton: "bg-[#566b8f] hover:bg-[#435574] text-white font-bold py-2 px-4 rounded"
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      await deleteLink(id);
      Swal.fire({
        title: "Deleted!",
        text: "Your link has been deleted.",
        icon: "success",
        customClass: {
          confirmButton: "bg-[#0b5cff] hover:bg-[#094bdd] text-white font-bold py-2 px-4 rounded"
        },
        buttonsStyling: false
      });
    }
  }

  const handleCopy = (link) => {
    const domain = link.custom_domain ? `https://${link.custom_domain}` : window.location.origin
    const url = `${domain}/${link.short_code}`
    navigator.clipboard.writeText(url)
    setCopiedId(link.short_code)
    toast.success('Link copied to clipboard!', { position: 'bottom-center' })
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <DashboardLayout>
      <SEO title="Links | RYZ Shortlink" />

      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <div className="space-y-6 animate-fade-in-up">
          
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Links</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and track all your created shortlinks.</p>
          </div>

          {/* Link List */}
          <div className="bitly-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">All Links</h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 rounded text-sm px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-[#0b5cff]">
                  <option>Filter by Date</option>
                  <option>Filter by Category</option>
                </select>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {linksLoading && <div className="text-center py-10"><div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div></div>}
              {!linksLoading && filteredLinks.length === 0 && (
                <div className="py-16 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4"><Link2 className="h-6 w-6 text-slate-400" /></div>
                  <p className="text-slate-600 font-medium mb-4">{searchQuery ? "No links found matching your search." : "No links found."}</p>
                </div>
              )}
              
              {filteredLinks.map(link => (
                <div key={link.id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate mb-1">{link.title || link.short_code}</h3>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <a href={link.custom_domain ? `https://${link.custom_domain}/${link.short_code}` : `/${link.short_code}`} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:text-[#094bdd] hover:underline text-sm font-bold flex items-center gap-1 transition-colors">
                        {link.custom_domain || 'ryz.my.id'}/{link.short_code} <ExternalLink className="h-3 w-3" />
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
                      <button onClick={() => handleCopy(link)} className={`p-2 rounded transition-colors ${copiedId === link.short_code ? 'text-[#0b5cff] bg-blue-50' : 'text-slate-400 hover:text-[#0b5cff] hover:bg-blue-50'}`} title="Copy Link">
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
