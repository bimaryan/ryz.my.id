import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutTemplate, Plus, Search, Edit3, Trash2, ExternalLink } from 'lucide-react'
import { usePages } from '@/hooks/usePages'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SEO from '@/components/SEO'
import ConfirmModal from '@/components/ui/ConfirmModal'
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PagesPage() {
  const { pages, isLoading, fetchPages, createPage, deletePage } = usePages()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [createError, setCreateError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const filteredPages = pages.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError(null)
    setIsSubmitting(true)
    
    // Auto-format slug: lowercase and hyphenated
    const formattedSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    if (!formattedSlug) {
      setCreateError('Slug is required')
      setIsSubmitting(false)
      return
    }

    const res = await createPage({ slug: formattedSlug, title: newTitle })
    setIsSubmitting(false)
    
    if (res.success) {
      setIsCreateModalOpen(false)
      setNewSlug('')
      setNewTitle('')
      navigate(`/dashboard/pages/${res.data.id}`)
    } else {
      setCreateError(res.error)
    }
  }

  const handleDelete = (id) => {
    setPageToDelete(id)
  }

  return (
    <DashboardLayout>
      <SEO title="Pages | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
              <LayoutTemplate className="h-8 w-8 text-[#0b5cff]" />
              Halaman
            </h1>
            <p className="text-slate-600 font-medium">Buat halaman Link-in-Bio yang indah untuk membagikan banyak tautan.</p>
          </div>
          <div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1.5" /> Buat Halaman
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/40 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari halaman berdasarkan judul atau URL..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl text-sm transition-all outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map(page => (
              <div key={page.id} className="bg-white border border-slate-200/60 rounded-3xl shadow-md overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-[#0b5cff]/30 transition-all duration-300 group">
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 relative flex items-center justify-center p-6 border-b border-[#e8ebf2]/50">
                  {page.avatar_url ? (
                    <img src={page.avatar_url} alt={page.title} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-[#0b5cff] to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {page.title ? page.title.charAt(0).toUpperCase() : page.slug.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{page.title || 'Halaman Tanpa Judul'}</h3>
                  <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#0b5cff] text-sm font-medium hover:underline flex items-center mb-4">
                    ryz.my.id/p/{page.slug}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                    <Link to={`/dashboard/pages/${page.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full justify-center">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(page.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Hapus Halaman"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-12 text-center animate-fade-in-up">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <LayoutTemplate className="h-10 w-10 text-[#0b5cff]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Halaman tidak ditemukan</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto font-medium">
              {searchQuery ? "Kami tidak menemukan halaman yang sesuai dengan pencarian Anda." : "Buat halaman Link-in-Bio pertama Anda untuk menampilkan semua link penting Anda di satu tempat."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                Buat Halaman Pertama Anda
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-extrabold text-xl text-slate-800">Buat Halaman Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-transparent hover:border-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition-all">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-5">
                <Input
                  label={<span className="text-slate-700 font-bold">Judul Halaman</span>}
                  placeholder="Contoh: Portofolio Keren Saya"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                  required
                />
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">URL Khusus</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-4 py-2.5 h-[46px] flex items-center text-slate-500 font-medium">
                      ryz.my.id/p/
                    </span>
                    <input
                      type="text"
                      placeholder="portofolio-saya"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-r-xl transition-all outline-none px-4 py-2.5 h-[46px]"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Ini akan menjadi URL publik halaman Link-in-Bio Anda.</p>
                </div>

                {createError && (
                  <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                    {createError}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">
                  Buat Halaman
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      <ConfirmModal
        isOpen={pageToDelete !== null}
        onClose={() => setPageToDelete(null)}
        onConfirm={async () => {
          if (pageToDelete) {
            await deletePage(pageToDelete)
            setPageToDelete(null)
            import('react-hot-toast').then(({ default: toast }) => toast.success('Halaman telah dihapus.'))
          }
        }}
        title="Hapus Halaman"
        message="Anda tidak akan bisa mengembalikan ini! Halaman akan dihapus secara permanen. Apakah Anda yakin?"
      />
    </DashboardLayout>
  )
}
