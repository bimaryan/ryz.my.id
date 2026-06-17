import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Link2, GripVertical, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react'
import { usePages } from '@/hooks/usePages'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SEO from '@/components/SEO'
import toast from 'react-hot-toast'

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPage, updatePage, uploadImage } = usePages()
  
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [theme, setTheme] = useState({
    bg_color: '#f4f6fa',
    text_color: '#273144',
    button_bg: '#ffffff',
    button_text: '#273144',
    button_style: 'rounded-xl' // rounded-md, rounded-xl, rounded-full
  })
  const [links, setLinks] = useState([])

  useEffect(() => {
    const fetchPageData = async () => {
      const res = await getPage(id)
      if (res.success && res.data) {
        setPage(res.data)
        setTitle(res.data.title || '')
        setDescription(res.data.description || '')
        setAvatarUrl(res.data.avatar_url || '')
        setTheme(res.data.theme || {
          bg_color: '#f4f6fa', text_color: '#273144', button_bg: '#ffffff', button_text: '#273144', button_style: 'rounded-xl'
        })
        setLinks(res.data.links || [])
      } else {
        toast.error('Page not found')
        navigate('/dashboard/pages')
      }
      setIsLoading(false)
    }
    fetchPageData()
  }, [id, getPage, navigate])

  const handleSave = async () => {
    setIsSaving(true)
    const updates = {
      title,
      description,
      avatar_url: avatarUrl,
      theme,
      links
    }
    
    const res = await updatePage(id, updates)
    setIsSaving(false)
    
    if (res.success) {
      toast.success('Page saved successfully!')
      setPage(res.data)
    } else {
      toast.error(res.error || 'Failed to save page')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setIsUploadingAvatar(true)
    const res = await uploadImage(file)
    setIsUploadingAvatar(false)

    if (res.success) {
      setAvatarUrl(res.url)
      toast.success('Avatar uploaded!')
    } else {
      toast.error(res.error || 'Failed to upload avatar')
    }
  }

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: '', url: '', icon: '' }])
  }

  const updateLink = (index, field, value) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const removeLink = (index) => {
    const newLinks = [...links]
    newLinks.splice(index, 1)
    setLinks(newLinks)
  }

  const moveLink = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newLinks = [...links]
      const temp = newLinks[index]
      newLinks[index] = newLinks[index - 1]
      newLinks[index - 1] = temp
      setLinks(newLinks)
    } else if (direction === 'down' && index < links.length - 1) {
      const newLinks = [...links]
      const temp = newLinks[index]
      newLinks[index] = newLinks[index + 1]
      newLinks[index + 1] = temp
      setLinks(newLinks)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b5cff]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SEO title="Edit Page | RYZ Shortlink" />

      {/* Header bar */}
      <div className="bg-white rounded-t-2xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/pages" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Editing Page</h1>
            <a href={`/p/${page?.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0b5cff] hover:underline flex items-center">
              ryz.my.id/p/{page?.slug} <span className="ml-1 opacity-50 text-[10px]">↗</span>
            </a>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="bitly-button-primary shadow-sm w-full sm:w-auto justify-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Editor & Preview Split Screen inside a card */}
      <div className="flex flex-col lg:flex-row bg-white border border-t-0 border-slate-200 rounded-b-2xl overflow-hidden min-h-[700px] mb-10 shadow-sm">
        
        {/* Editor Panel (Left) */}
        <div className="w-full lg:w-[60%] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="max-w-2xl mx-auto space-y-10">
            
            {/* Profile Section */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                Profile
              </h2>
              <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex gap-6 items-start">
                  <div className="w-24 h-24 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Profile Picture</label>
                      <div className="flex items-center gap-3">
                        <label className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 font-medium text-sm cursor-pointer transition-colors ${isUploadingAvatar ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                          {isUploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}
                          {isUploadingAvatar ? 'Uploading...' : 'Upload Image'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                        </label>
                        {avatarUrl && (
                          <button type="button" onClick={() => setAvatarUrl('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1">
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Max size: 2MB. Recommended 256x256px.</p>
                    </div>

                    <Input
                      label={<span className="text-sm font-bold text-slate-700">Profile Title</span>}
                      placeholder="e.g. John Doe or My Business"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bitly-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bio / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Tell your visitors a little about yourself..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff] transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Links Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  Links
                </h2>
                <Button type="button" onClick={addLink} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-4">
                {links.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                    <Link2 className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">You haven't added any links yet.</p>
                  </div>
                ) : (
                  links.map((link, index) => (
                    <div key={link.id || index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-4 group">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-300">
                        <button type="button" onClick={() => moveLink(index, 'up')} disabled={index === 0} className="hover:text-slate-600 disabled:opacity-30">
                          <span className="text-lg leading-none">▲</span>
                        </button>
                        <GripVertical className="h-5 w-5" />
                        <button type="button" onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="hover:text-slate-600 disabled:opacity-30">
                          <span className="text-lg leading-none">▼</span>
                        </button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <Input
                          placeholder="Title (e.g. My Website)"
                          value={link.title}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          className="font-bold text-slate-800 border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 text-lg py-2"
                        />
                        <Input
                          placeholder="URL (e.g. https://ryz.my.id/site)"
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          className="border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 h-fit"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Appearance Section */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Appearance</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={theme.bg_color} 
                      onChange={(e) => setTheme({...theme, bg_color: e.target.value})}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                    />
                    <Input 
                      value={theme.bg_color} 
                      onChange={(e) => setTheme({...theme, bg_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={theme.text_color} 
                      onChange={(e) => setTheme({...theme, text_color: e.target.value})}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                    />
                    <Input 
                      value={theme.text_color} 
                      onChange={(e) => setTheme({...theme, text_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Background</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={theme.button_bg} 
                      onChange={(e) => setTheme({...theme, button_bg: e.target.value})}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                    />
                    <Input 
                      value={theme.button_bg} 
                      onChange={(e) => setTheme({...theme, button_bg: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={theme.button_text} 
                      onChange={(e) => setTheme({...theme, button_text: e.target.value})}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                    />
                    <Input 
                      value={theme.button_text} 
                      onChange={(e) => setTheme({...theme, button_text: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Style</label>
                  <div className="flex gap-4">
                    {['rounded-md', 'rounded-xl', 'rounded-full'].map(style => (
                      <button
                        key={style}
                        onClick={() => setTheme({...theme, button_style: style})}
                        className={`flex-1 py-3 border-2 transition-all ${style} ${theme.button_style === style ? 'border-[#0b5cff] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <div className={`mx-auto w-3/4 h-3 bg-slate-300 ${style}`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Spacer for bottom scrolling */}
            <div className="h-10"></div>
          </div>
        </div>

        {/* Live Preview Panel (Right) */}
        <div className="w-full lg:w-[40%] bg-[#f8f9fb] flex items-start justify-center p-6 sm:p-8">
          <div className="relative w-full max-w-[360px] h-[750px] bg-black rounded-[40px] border-[8px] border-black shadow-2xl overflow-hidden shrink-0">
            {/* Mobile Status Bar Simulation */}
            <div className="absolute top-0 inset-x-0 h-6 z-20 flex justify-center pt-1">
              <div className="w-24 h-5 bg-black rounded-b-xl"></div>
            </div>

            {/* Actual Preview Content */}
            <div 
              className="absolute inset-0 z-10 overflow-y-auto no-scrollbar"
              style={{ backgroundColor: theme.bg_color, color: theme.text_color }}
            >
              <div className="px-6 py-12 flex flex-col items-center">
                {/* Avatar */}
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 shadow-md flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                
                {/* Profile Info */}
                <h1 className="text-xl font-bold mb-2 text-center" style={{ color: theme.text_color }}>
                  {title || '@your_username'}
                </h1>
                <p className="text-sm text-center mb-8 opacity-80" style={{ color: theme.text_color }}>
                  {description || 'Your bio goes here. Tell people about what you do.'}
                </p>

                {/* Links */}
                <div className="w-full space-y-4">
                  {links.length > 0 ? (
                    links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full text-center py-4 px-6 font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-sm ${theme.button_style}`}
                        style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
                      >
                        {link.title || 'Link Title'}
                      </a>
                    ))
                  ) : (
                    <div 
                      className={`block w-full text-center py-4 px-6 font-bold opacity-50 ${theme.button_style}`}
                      style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
                    >
                      Sample Link
                    </div>
                  )}
                </div>
                
                <div className="mt-12 opacity-50 text-xs font-medium tracking-wider flex items-center gap-1" style={{ color: theme.text_color }}>
                  <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center font-bold text-[10px]">R</div>
                  RYZLink
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
