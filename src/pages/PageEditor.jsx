import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Link2, GripVertical, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { usePages } from '@/hooks/usePages'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import IconPicker from '@/components/IconPicker'
import SEO from '@/components/SEO'
import toast from 'react-hot-toast'

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Outfit', 'Space Grotesk']

const GRADIENTS = [
  'linear-gradient(to right, #ff7e5f, #feb47b)',
  'linear-gradient(to right, #00c6ff, #0072ff)',
  'linear-gradient(to right, #11998e, #38ef7d)',
  'linear-gradient(to bottom right, #fc466b, #3f5efb)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
]

const TEMPLATES = [
  {
    name: 'Minimal Light',
    theme: { font_family: 'Inter', bg_type: 'color', bg_value: '#f4f6fa', text_color: '#273144', button_bg: '#ffffff', button_text: '#273144', button_style: 'rounded-xl', button_shadow: 'shadow-sm', button_border: 'border-transparent', button_animation: 'hover:scale-105 transition-transform' }
  },
  {
    name: 'Midnight Dark',
    theme: { font_family: 'Outfit', bg_type: 'color', bg_value: '#0f172a', text_color: '#f8fafc', button_bg: '#1e293b', button_text: '#f8fafc', button_style: 'rounded-xl', button_shadow: 'shadow-md', button_border: 'border-slate-700', button_animation: 'hover:scale-105 transition-transform' }
  },
  {
    name: 'Sunset Glass',
    theme: { font_family: 'Space Grotesk', bg_type: 'gradient', bg_value: 'linear-gradient(to bottom right, #fc466b, #3f5efb)', text_color: '#ffffff', button_bg: 'rgba(255, 255, 255, 0.1)', button_text: '#ffffff', button_style: 'rounded-xl backdrop-blur-md', button_shadow: 'shadow-xl', button_border: 'border-white/20', button_animation: 'hover:bg-white/20 transition-all' }
  },
  {
    name: 'Cyberpunk',
    theme: { font_family: 'Space Grotesk', bg_type: 'color', bg_value: '#000000', text_color: '#00ff00', button_bg: '#000000', button_text: '#00ff00', button_style: 'rounded-none', button_shadow: 'shadow-[4px_4px_0_#00ff00]', button_border: 'border-[#00ff00]', button_animation: 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all' }
  },
  {
    name: 'Elegant',
    theme: { font_family: 'Playfair Display', bg_type: 'color', bg_value: '#fdfbf7', text_color: '#2c3e50', button_bg: '#ffffff', button_text: '#2c3e50', button_style: 'rounded-none', button_shadow: 'shadow-none', button_border: 'border-slate-300', button_animation: 'hover:bg-slate-50 transition-colors' }
  },
  {
    name: 'Neon Cyber',
    theme: { font_family: 'Space Grotesk', bg_type: 'color', bg_value: '#09090b', text_color: '#f8fafc', button_bg: 'transparent', button_text: '#06b6d4', button_style: 'rounded-md', button_shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', button_border: 'border-2 border-[#06b6d4]', button_animation: 'hover:scale-105 transition-transform' }
  },
  {
    name: 'Pastel Dream',
    theme: { font_family: 'Outfit', bg_type: 'gradient', bg_value: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', text_color: '#475569', button_bg: '#ffffff', button_text: '#334155', button_style: 'rounded-full', button_shadow: 'shadow-xl', button_border: 'border-transparent', button_animation: 'hover:-translate-y-1 transition-transform' }
  },
  {
    name: 'Emerald Glass',
    theme: { font_family: 'Inter', bg_type: 'gradient', bg_value: 'linear-gradient(to right, #11998e, #38ef7d)', text_color: '#ffffff', button_bg: 'rgba(255, 255, 255, 0.2)', button_text: '#ffffff', button_style: 'rounded-2xl backdrop-blur-lg', button_shadow: 'shadow-lg', button_border: 'border border-white/30', button_animation: 'hover:bg-white/30 transition-colors' }
  },
  {
    name: 'Monochrome Pro',
    theme: { font_family: 'Roboto', bg_type: 'color', bg_value: '#ffffff', text_color: '#000000', button_bg: '#000000', button_text: '#ffffff', button_style: 'rounded-none', button_shadow: 'shadow-none', button_border: 'border-2 border-black', button_animation: 'hover:bg-gray-800 transition-colors' }
  },
  {
    name: 'Ocean Wave',
    theme: { font_family: 'Playfair Display', bg_type: 'gradient', bg_value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', text_color: '#ffffff', button_bg: '#ffffff', button_text: '#0284c7', button_style: 'rounded-full', button_shadow: 'shadow-md', button_border: 'border-transparent', button_animation: 'hover:shadow-xl transition-shadow' }
  }
]

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPage, updatePage, uploadImage } = usePages()
  
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [theme, setTheme] = useState({
    font_family: 'Inter',
    bg_type: 'color', // color, gradient, image
    bg_value: '#f4f6fa',
    bg_color: '#f4f6fa', // legacy/fallback
    text_color: '#273144',
    button_bg: '#ffffff',
    button_text: '#273144',
    button_style: 'rounded-xl', // rounded-md, rounded-xl, rounded-full
    button_shadow: 'shadow-sm', // shadow-none, shadow-sm, shadow-md, shadow-xl
    button_border: 'border-transparent', // border-transparent, border-white, border-black, etc
    button_animation: 'hover:scale-105 transition-transform',
    social_links: {
      instagram: '',
      twitter: '',
      github: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    }
  })
  const [links, setLinks] = useState([])
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [currentEditingLinkIndex, setCurrentEditingLinkIndex] = useState(null)

  useEffect(() => {
    const fetchPageData = async () => {
      const res = await getPage(id)
      if (res.success && res.data) {
        setPage(res.data)
        setTitle(res.data.title || '')
        setDescription(res.data.description || '')
        setAvatarUrl(res.data.avatar_url || '')
        setTheme(res.data.theme || {
          font_family: 'Inter',
          bg_type: 'color',
          bg_value: '#f4f6fa',
          bg_color: '#f4f6fa', 
          text_color: '#273144', 
          button_bg: '#ffffff', 
          button_text: '#273144', 
          button_style: 'rounded-xl',
          button_shadow: 'shadow-sm',
          button_border: 'border-transparent',
          button_animation: 'hover:scale-105 transition-transform',
          social_links: { instagram: '', twitter: '', github: '', linkedin: '', youtube: '', tiktok: '' }
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

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setIsUploadingBg(true)
    const res = await uploadImage(file)
    setIsUploadingBg(false)

    if (res.success) {
      setTheme({ ...theme, bg_type: 'image', bg_value: res.url, bg_color: '#000000' })
      toast.success('Background uploaded!')
    } else {
      toast.error(res.error || 'Failed to upload background')
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

            {/* Social Links Section */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                Social Links
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={<span className="text-sm font-bold text-slate-700">Instagram</span>}
                  placeholder="https://instagram.com/username"
                  value={theme.social_links?.instagram || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, instagram: e.target.value}})}
                  className="bitly-input"
                />
                <Input
                  label={<span className="text-sm font-bold text-slate-700">Twitter / X</span>}
                  placeholder="https://twitter.com/username"
                  value={theme.social_links?.twitter || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, twitter: e.target.value}})}
                  className="bitly-input"
                />
                <Input
                  label={<span className="text-sm font-bold text-slate-700">TikTok</span>}
                  placeholder="https://tiktok.com/@username"
                  value={theme.social_links?.tiktok || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, tiktok: e.target.value}})}
                  className="bitly-input"
                />
                <Input
                  label={<span className="text-sm font-bold text-slate-700">YouTube</span>}
                  placeholder="https://youtube.com/@username"
                  value={theme.social_links?.youtube || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, youtube: e.target.value}})}
                  className="bitly-input"
                />
                <Input
                  label={<span className="text-sm font-bold text-slate-700">GitHub</span>}
                  placeholder="https://github.com/username"
                  value={theme.social_links?.github || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, github: e.target.value}})}
                  className="bitly-input"
                />
                <Input
                  label={<span className="text-sm font-bold text-slate-700">LinkedIn</span>}
                  placeholder="https://linkedin.com/in/username"
                  value={theme.social_links?.linkedin || ''}
                  onChange={(e) => setTheme({...theme, social_links: {...theme.social_links, linkedin: e.target.value}})}
                  className="bitly-input"
                />
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
                      
                      <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentEditingLinkIndex(index);
                            setIsIconPickerOpen(true);
                          }}
                          className={`w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${link.icon ? 'border-solid border-[#0b5cff]/20 bg-[#0b5cff]/5 text-[#0b5cff]' : 'border-slate-300 hover:border-[#0b5cff]/50 hover:bg-slate-50 text-slate-400'}`}
                          title="Choose Icon"
                        >
                          {link.icon && LucideIcons[link.icon] ? (
                            (() => {
                              const IconComponent = LucideIcons[link.icon];
                              return <IconComponent className="w-6 h-6" />;
                            })()
                          ) : (
                            <Plus className="w-5 h-5 opacity-50" />
                          )}
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
              
              {/* Templates Gallery */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">Premium Templates</label>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => setTheme({ ...theme, ...tpl.theme })}
                      className="flex-shrink-0 w-32 h-40 rounded-2xl border-2 border-transparent hover:border-[#0b5cff]/50 focus:border-[#0b5cff] shadow-sm relative overflow-hidden group transition-all"
                      style={{ 
                        background: tpl.theme.bg_type === 'gradient' ? tpl.theme.bg_value : tpl.theme.bg_type === 'image' ? `url(${tpl.theme.bg_value}) center/cover` : tpl.theme.bg_value 
                      }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-2">
                        <div className="w-10 h-10 rounded-full bg-black/20 mb-2"></div>
                        <div className={`w-full h-6 ${tpl.theme.button_style} ${tpl.theme.button_shadow} ${tpl.theme.button_border} border`} style={{ background: tpl.theme.button_bg }}></div>
                        <div className={`w-full h-6 ${tpl.theme.button_style} ${tpl.theme.button_shadow} ${tpl.theme.button_border} border`} style={{ background: tpl.theme.button_bg }}></div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm p-2 text-center text-xs font-bold text-slate-900">
                        {tpl.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Font Family */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Font Family</label>
                  <select 
                    value={theme.font_family || 'Inter'} 
                    onChange={(e) => setTheme({...theme, font_family: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]"
                  >
                    {FONTS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                {/* Background Selector */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Background</label>
                  
                  <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
                    {['color', 'gradient', 'image'].map(type => (
                      <button
                        key={type}
                        onClick={() => setTheme({...theme, bg_type: type})}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${theme.bg_type === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {theme.bg_type === 'color' && (
                    <div className="flex gap-3 items-center">
                      <input 
                        type="color" 
                        value={theme.bg_color || theme.bg_value} 
                        onChange={(e) => setTheme({...theme, bg_value: e.target.value, bg_color: e.target.value})}
                        className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                      />
                      <Input 
                        value={theme.bg_color || theme.bg_value} 
                        onChange={(e) => setTheme({...theme, bg_value: e.target.value, bg_color: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  )}

                  {theme.bg_type === 'gradient' && (
                    <div className="grid grid-cols-6 gap-2">
                      {GRADIENTS.map((grad, i) => (
                        <button
                          key={i}
                          onClick={() => setTheme({...theme, bg_value: grad})}
                          className={`h-12 rounded-lg border-2 transition-all ${theme.bg_value === grad ? 'border-[#0b5cff] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ background: grad }}
                        />
                      ))}
                    </div>
                  )}

                  {theme.bg_type === 'image' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 font-bold text-sm cursor-pointer transition-colors ${isUploadingBg ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'}`}>
                          {isUploadingBg ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                          {isUploadingBg ? 'Uploading...' : 'Upload Background Image'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} disabled={isUploadingBg} />
                        </label>
                      </div>
                      {theme.bg_value && theme.bg_type === 'image' && (
                        <div className="h-24 rounded-xl border border-slate-200 overflow-hidden relative">
                          <img src={theme.bg_value} alt="Background" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Text & Button Colors */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={theme.text_color} onChange={(e) => setTheme({...theme, text_color: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
                    <Input value={theme.text_color} onChange={(e) => setTheme({...theme, text_color: e.target.value})} className="flex-1" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={theme.button_text} onChange={(e) => setTheme({...theme, button_text: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
                    <Input value={theme.button_text} onChange={(e) => setTheme({...theme, button_text: e.target.value})} className="flex-1" />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Background (Hex or RGBA)</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={theme.button_bg.startsWith('#') ? theme.button_bg : '#ffffff'} onChange={(e) => setTheme({...theme, button_bg: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
                    <Input value={theme.button_bg} onChange={(e) => setTheme({...theme, button_bg: e.target.value})} placeholder="e.g. #ffffff or rgba(255,255,255,0.1)" className="flex-1" />
                  </div>
                </div>

                {/* Button Style & Shadows */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Radius</label>
                  <select value={theme.button_style?.split(' ')[0] || 'rounded-xl'} onChange={(e) => setTheme({...theme, button_style: e.target.value + (theme.button_style?.includes('backdrop-blur') ? ' backdrop-blur-md' : '')})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
                    <option value="rounded-none">Square</option>
                    <option value="rounded-md">Rounded</option>
                    <option value="rounded-xl">Rounded XL</option>
                    <option value="rounded-full">Pill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Animation</label>
                  <select value={theme.button_animation || ''} onChange={(e) => setTheme({...theme, button_animation: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
                    <option value="">None</option>
                    <option value="hover:scale-105 transition-transform">Scale Up</option>
                    <option value="hover:-translate-y-1 transition-transform">Float Up</option>
                    <option value="hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Press Down</option>
                    <option value="hover:opacity-80 transition-opacity">Fade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Button Shadow</label>
                  <select value={theme.button_shadow || 'shadow-sm'} onChange={(e) => setTheme({...theme, button_shadow: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
                    <option value="shadow-none">None</option>
                    <option value="shadow-sm">Small</option>
                    <option value="shadow-md">Medium</option>
                    <option value="shadow-xl">Large</option>
                    <option value="shadow-[4px_4px_0_#000000]">Hard Shadow</option>
                    <option value="shadow-[4px_4px_0_#00ff00]">Neon Shadow</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-700">Enable Glassmorphism</div>
                  <button 
                    onClick={() => setTheme({...theme, button_style: theme.button_style?.includes('backdrop-blur') ? theme.button_style.replace(' backdrop-blur-md', '') : theme.button_style + ' backdrop-blur-md'})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${theme.button_style?.includes('backdrop-blur') ? 'bg-[#0b5cff]' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme.button_style?.includes('backdrop-blur') ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
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
              style={{ 
                fontFamily: theme.font_family || 'Inter',
                background: theme.bg_type === 'gradient' ? theme.bg_value : theme.bg_type === 'image' ? `url(${theme.bg_value}) center/cover` : theme.bg_value || theme.bg_color,
                color: theme.text_color 
              }}
            >
              <div className="px-6 py-12 flex flex-col items-center">
                {/* Avatar */}
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4 shadow-md border-2 border-white/20" />
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

                {/* Social Links */}
                {(theme.social_links?.instagram || theme.social_links?.twitter || theme.social_links?.github || theme.social_links?.linkedin || theme.social_links?.youtube || theme.social_links?.tiktok) && (
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {theme.social_links?.instagram && <a href={theme.social_links.instagram} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>}
                    {theme.social_links?.twitter && <a href={theme.social_links.twitter} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.15H5.078z"/></svg></a>}
                    {theme.social_links?.github && <a href={theme.social_links.github} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg></a>}
                    {theme.social_links?.linkedin && <a href={theme.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
                    {theme.social_links?.youtube && <a href={theme.social_links.youtube} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>}
                    {theme.social_links?.tiktok && <a href={theme.social_links.tiktok} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform" style={{ color: theme.text_color }}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.68-.39 3.32-1.14 4.8-.75 1.48-1.84 2.75-3.15 3.68-1.31.93-2.82 1.5-4.4 1.68-1.58.18-3.19-.02-4.66-.58-1.47-.56-2.77-1.43-3.8-2.58-1.03-1.15-1.77-2.55-2.16-4.08-.39-1.53-.44-3.12-.14-4.63.3-1.51.93-2.92 1.84-4.14 1.15-1.52 2.68-2.65 4.43-3.23 1.75-.58 3.65-.58 5.4.01v4.06c-1.14-.37-2.39-.37-3.53.01-1.14.38-2.12 1.12-2.78 2.09-.66.97-.97 2.15-.89 3.32.08 1.17.56 2.27 1.37 3.12.81.85 1.89 1.36 3.07 1.45 1.18.09 2.37-.23 3.37-.91 1-.68 1.71-1.68 2.01-2.83.3-1.15.25-2.36-.15-3.48V.02h3.91z"/></svg></a>}
                  </div>
                )}

                {/* Links */}
                <div className="w-full space-y-4">
                  {links.length > 0 ? (
                    links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full py-4 px-6 font-bold transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-95 ${theme.button_style} ${theme.button_shadow} ${theme.button_border} border relative overflow-hidden`}
                        style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
                      >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                          {link.icon && LucideIcons[link.icon] && (
                            (() => {
                              const IconComponent = LucideIcons[link.icon];
                              return <IconComponent className="w-5 h-5" />;
                            })()
                          )}
                          <span>{link.title || 'Link Title'}</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div 
                      className={`block w-full text-center py-4 px-6 font-bold opacity-50 ${theme.button_style} ${theme.button_shadow} ${theme.button_border} border`}
                      style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
                    >
                      Sample Link
                    </div>
                  )}
                </div>
                
                <div className="mt-12 opacity-50 text-xs font-medium tracking-wider flex items-center gap-1" style={{ color: theme.text_color }}>
                  <div className="w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: theme.text_color, color: theme.bg_type === 'color' ? theme.bg_value : '#000' }}>R</div>
                  RYZLink
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <IconPicker 
        isOpen={isIconPickerOpen}
        onClose={() => {
          setIsIconPickerOpen(false);
          setCurrentEditingLinkIndex(null);
        }}
        onSelect={(iconName) => {
          if (currentEditingLinkIndex !== null) {
            updateLink(currentEditingLinkIndex, 'icon', iconName);
          }
        }}
      />
    </DashboardLayout>
  )
}
