import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useLinks } from '@/hooks/useLinks'
import { Link2, ExternalLink, Copy, Trash2, QrCode, Calendar, Share2, MousePointerClick, Check } from 'lucide-react'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QRCodeModal from '@/components/QRCodeModal'
import ShareLinkModal from '@/components/ShareLinkModal'

export default function LinksPage() {
  const { links, fetchLinks, deleteLink, isLoading: linksLoading } = useLinks()
  const [qrCodeLink, setQrCodeLink] = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [linkToDelete, setLinkToDelete] = useState(null)

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").toLowerCase();
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredLinks = links.filter((link) => {
    // 1. Search Query Filter
    const matchesSearch = !searchQuery || (
      (link.title && link.title.toLowerCase().includes(searchQuery)) ||
      (link.short_code && link.short_code.toLowerCase().includes(searchQuery)) ||
      (link.original_url && link.original_url.toLowerCase().includes(searchQuery))
    );

    // 2. Category Filter
    const matchesCategory = !selectedCategory || link.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    setLinkToDelete(id)
  }

  const handleCopy = (link) => {
    const domain = link.custom_domain ? `https://${link.custom_domain}` : window.location.origin
    const url = `${domain}/${link.short_code}`
    navigator.clipboard.writeText(url)
    setCopiedId(link.short_code)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <DashboardLayout>
      <SEO title="Links | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
              <Link2 className="h-8 w-8 text-[#0b5cff]" />
              Daftar Link
            </h1>
            <p className="text-slate-600 font-medium">Kelola dan lacak semua shortlink yang telah Anda buat.</p>
          </div>
        </div>

        {/* Link List */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-white flex-wrap gap-4">
            <h2 className="text-xl font-extrabold text-slate-800">Semua Link</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 hover:border-[#0b5cff] rounded-xl text-sm px-4 py-2.5 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-[#0b5cff]/10 transition-all cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {Array.from(new Set(links.map(l => l.category).filter(Boolean))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100 p-2 sm:p-4">
            {linksLoading && (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-[#0b5cff] rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-500 font-medium">Memuat link Anda...</p>
              </div>
            )}
            
            {!linksLoading && filteredLinks.length === 0 && (
              <div className="py-20 text-center bg-slate-50/50">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Link2 className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-slate-700 font-extrabold mb-1 text-xl">
                  {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada link yang dibuat"}
                </p>
                <p className="text-slate-500 text-sm font-medium">
                  {searchQuery
                    ? "Coba sesuaikan kata kunci pencarian Anda."
                    : "Buat shortlink pertama Anda melalui menu Dashboard."}
                </p>
              </div>
            )}
            
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className="p-5 flex flex-col lg:flex-row gap-6 lg:items-center justify-between hover:bg-slate-50/80 transition-all duration-300 group rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 bg-white"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Link Icon Avatar */}
                  <div className="hidden sm:flex mt-1 h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0b5cff]">
                    <Link2 className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg truncate mb-1">
                      {link.title || link.short_code}
                    </h3>

                    <div className="flex items-center gap-3 mb-2">
                      <a
                        href={
                          link.custom_domain
                            ? `https://${link.custom_domain}/${link.short_code}`
                            : `/${link.short_code}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0b5cff] hover:text-[#094bdd] hover:underline text-sm font-bold flex items-center gap-1.5 transition-colors w-fit"
                      >
                        {link.custom_domain || "ryz.my.id"}/{link.short_code}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <p className="text-slate-500 text-sm truncate max-w-2xl mb-3">
                      {link.original_url}
                    </p>

                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(link.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {link.category && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wide">
                          {link.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 sm:pl-14 lg:pl-0">
                  <div className="text-left lg:text-right">
                    <p className="font-extrabold text-slate-800 text-xl flex items-center gap-1.5 lg:justify-end">
                      <MousePointerClick className="w-5 h-5 text-slate-400 lg:hidden" />
                      {link.clicks_count || 0}
                    </p>
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                      Interaksi
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-6">
                    <button
                      onClick={() => setShareLink(link)}
                      className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm hover:shadow rounded-lg transition-all"
                      title="Bagikan Akses"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setQrCodeLink(link)}
                      className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm hover:shadow rounded-lg transition-all"
                      title="QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(link)}
                      className={`p-2.5 border border-transparent shadow-sm hover:shadow rounded-lg transition-all ${
                        copiedId === link.short_code
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "text-slate-400 hover:text-[#0b5cff] hover:bg-white hover:border-slate-200"
                      }`}
                      title="Salin Link"
                    >
                      {copiedId === link.short_code ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 shadow-sm hover:shadow rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <QRCodeModal isOpen={!!qrCodeLink} onClose={() => setQrCodeLink(null)} link={qrCodeLink} />
      <ShareLinkModal isOpen={!!shareLink} onClose={() => setShareLink(null)} link={shareLink} />
      <ConfirmModal
        isOpen={linkToDelete !== null}
        onClose={() => setLinkToDelete(null)}
        onConfirm={async () => {
          if (linkToDelete) {
            await deleteLink(linkToDelete);
            toast.success("Your link has been deleted.");
            setLinkToDelete(null);
          }
        }}
        title="Delete Link"
        message="You won't be able to revert this! Are you sure you want to delete this link?"
      />
    </DashboardLayout>
  )
}
