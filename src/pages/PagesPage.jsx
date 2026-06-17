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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pages</h1>
            <p className="text-slate-500 font-medium mt-1">Create beautiful Link-in-Bio pages to share multiple links.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bitly-button-primary shadow-lg shadow-blue-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Create Page
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#f4f6fa] border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-[#0b5cff]/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b5cff]"></div>
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map(page => (
              <div key={page.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-[#0b5cff]/30 hover:shadow-md transition-all duration-300 group">
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
                  <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{page.title || 'Untitled Page'}</h3>
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
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center animate-fade-in-up">
            <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <LayoutTemplate className="h-8 w-8 text-[#0b5cff]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No pages found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {searchQuery ? "We couldn't find any pages matching your search." : "Create your first Link-in-Bio page to showcase all your important links in one place."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bitly-button-primary">
                Create Your First Page
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Create New Page</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Trash2 className="h-5 w-5 opacity-0 absolute" /> {/* Just for spacing trick if needed, actually use X */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-5">
                <Input
                  label={<span className="text-slate-700 font-bold">Page Title</span>}
                  placeholder="e.g. My Awesome Portfolio"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bitly-input"
                  required
                />
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Custom Slug</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-300 border-r-0 rounded-l-lg px-4 h-11 flex items-center text-slate-500 font-medium">
                      ryz.my.id/p/
                    </span>
                    <input
                      type="text"
                      placeholder="my-portfolio"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="bitly-input rounded-l-none flex-1"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">This will be your public Link-in-Bio URL.</p>
                </div>

                {createError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {createError}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="bitly-button-primary">
                  Create Page
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
            import('react-hot-toast').then(({ default: toast }) => toast.success('The page has been deleted.'))
          }
        }}
        title="Delete Page"
        message="You won't be able to revert this! The page will be deleted permanently. Are you sure?"
      />
    </DashboardLayout>
  )
}
