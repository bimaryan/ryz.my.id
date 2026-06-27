import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Link2, GripVertical, Image as ImageIcon, UploadCloud, Loader2, X, Video, Link as LinkIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { FaInstagram, FaXTwitter, FaGithub, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa6'
import { usePages } from '@/hooks/usePages'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import IconPicker from '@/components/IconPicker'
import BlockPickerModal from '@/components/BlockPickerModal'
import SEO from '@/components/SEO'
import ComplexBlockRender from '@/components/ComplexBlockRender'
import FloatingParticles from '@/components/FloatingParticles'
import ProductEditorModal from '@/components/ProductEditorModal'
import BlogEditorModal from '@/components/BlogEditorModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner';

const getYouTubeEmbedUrl = (url) => {
 if (!url) return null;
 const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
 const match = url.match(regExp);
 return (match && match[2].length === 11)
 ? `https://www.youtube.com/embed/${match[2]}`
 : null;
};

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Outfit', 'Space Grotesk', 'Poppins', 'Montserrat', 'Lora', 'Plus Jakarta Sans', 'DM Sans', 'Syne', 'Oswald', 'Bebas Neue', 'Lexend', 'Caveat', 'Comfortaa', 'Cinzel']

const BRAND_COLORS = {
 instagram: '#E1306C',
 twitter: '#1DA1F2',
 github: '#333333',
 linkedin: '#0077b5',
 youtube: '#FF0000',
 tiktok: '#000000'
}

const GRADIENTS = [
 'linear-gradient(to right, #ff7e5f, #feb47b)',
 'linear-gradient(to right, #00c6ff, #0072ff)',
 'linear-gradient(to right, #11998e, #38ef7d)',
 'linear-gradient(to bottom right, #fc466b, #3f5efb)',
 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
 'linear-gradient(to right, #fa709a 0%, #fee140 100%)'
]

const TEMPLATES = [
 {
 name: 'Minimal Light',
 theme: { font_family: 'Inter', bg_type: 'color', bg_value: '#f4f6fa', text_color: '#273144', button_bg: '#ffffff', button_text: '#273144', button_style: 'rounded-xl', button_shadow: 'shadow-sm', button_border: 'border-transparent', button_animation: 'hover:scale-105 transition-transform', bg_animation: 'none' }
 },
 {
 name: 'Midnight Dark',
 theme: { font_family: 'Outfit', bg_type: 'color', bg_value: '#0f172a', text_color: '#f8fafc', button_bg: '#1e293b', button_text: '#f8fafc', button_style: 'rounded-xl', button_shadow: 'shadow-md', button_border: 'border-slate-700', button_animation: 'hover:scale-105 transition-transform', bg_animation: 'none' }
 },
 {
 name: 'Animated Aurora',
 theme: { font_family: 'Space Grotesk', bg_type: 'gradient', bg_value: 'linear-gradient(45deg, #ff9a9e, #fecfef, #a1c4fd)', text_color: '#1e293b', button_bg: 'rgba(255, 255, 255, 0.5)', button_text: '#1e293b', button_style: 'rounded-2xl backdrop-blur-md', button_shadow: 'shadow-xl', button_border: 'border-white/40', button_animation: 'hover:bg-white/70 transition-all', bg_animation: 'animate-gradient-xy' }
 },
 {
 name: 'Moving Cyber',
 theme: { font_family: 'Space Grotesk', bg_type: 'gradient', bg_value: 'linear-gradient(to right, #000000, #1a0033, #000000)', text_color: '#00ff00', button_bg: 'rgba(0, 0, 0, 0.8)', button_text: '#00ff00', button_style: 'rounded-none', button_shadow: 'shadow-[4px_4px_0_#00ff00]', button_border: 'border border-[#00ff00]', button_animation: 'hover:translate-x-1 hover:shadow-none transition-all', bg_animation: 'animate-gradient-x' }
 },
 {
 name: 'Elegant',
 theme: { font_family: 'Playfair Display', bg_type: 'color', bg_value: '#fdfbf7', text_color: '#2c3e50', button_bg: '#ffffff', button_text: '#2c3e50', button_style: 'rounded-none', button_shadow: 'shadow-none', button_border: 'border border-slate-300', button_animation: 'hover:bg-slate-50 transition-colors', bg_animation: 'none' }
 },
 {
 name: 'Flowing Ocean',
 theme: { font_family: 'Plus Jakarta Sans', bg_type: 'gradient', bg_value: 'linear-gradient(to right, #4facfe, #00f2fe, #4facfe)', text_color: '#ffffff', button_bg: 'rgba(255, 255, 255, 0.2)', button_text: '#ffffff', button_style: 'rounded-full backdrop-blur-sm', button_shadow: 'shadow-md', button_border: 'border border-transparent', button_animation: 'hover:shadow-xl transition-shadow hover:bg-white/30', bg_animation: 'animate-gradient-x' }
 },
 {
 name: 'Sunset Glass',
 theme: { font_family: 'Space Grotesk', bg_type: 'gradient', bg_value: 'linear-gradient(to bottom right, #fc466b, #3f5efb)', text_color: '#ffffff', button_bg: 'rgba(255, 255, 255, 0.1)', button_text: '#ffffff', button_style: 'rounded-xl backdrop-blur-md', button_shadow: 'shadow-xl', button_border: 'border-white/20', button_animation: 'hover:bg-white/20 transition-all', bg_animation: 'none' }
 },
 {
 name: 'Pastel Dream',
 theme: { font_family: 'Outfit', bg_type: 'gradient', bg_value: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', text_color: '#475569', button_bg: '#ffffff', button_text: '#334155', button_style: 'rounded-full', button_shadow: 'shadow-xl', button_border: 'border border-transparent', button_animation: ' transition-transform', bg_animation: 'none' }
 },
 {
 name: 'Brutalist Neo',
 theme: { font_family: 'Syne', bg_type: 'color', bg_value: '#f4f4f0', text_color: '#111111', button_bg: '#e8ff5a', button_text: '#111111', button_style: 'rounded-none', button_shadow: 'shadow-[6px_6px_0_#111111]', button_border: 'border-2 border-[#111111]', button_animation: 'hover:translate-x-1 hover:shadow-[2px_2px_0_#111111] transition-all', bg_animation: 'none' }
 },
 {
 name: 'Monochrome Noir',
 theme: { font_family: 'DM Sans', bg_type: 'color', bg_value: '#111111', text_color: '#fdfdfd', button_bg: '#fdfdfd', button_text: '#111111', button_style: 'rounded-full', button_shadow: 'shadow-none', button_border: 'border border-transparent', button_animation: 'hover:scale-95 transition-transform', bg_animation: 'none' }
 },
 {
 name: 'Retro Pop',
 theme: { font_family: 'Oswald', bg_type: 'color', bg_value: '#ff90e8', text_color: '#000000', button_bg: '#fff200', button_text: '#000000', button_style: 'rounded-full', button_shadow: 'shadow-[4px_4px_0_#000000]', button_border: 'border-2 border-black', button_animation: ' hover:shadow-[6px_6px_0_#000000] transition-all', bg_animation: 'none' }
 },
 {
 name: 'Deep Pulse',
 theme: { font_family: 'Lexend', bg_type: 'color', bg_value: '#1a0b2e', text_color: '#ffffff', button_bg: '#31105e', button_text: '#ffffff', button_style: 'rounded-2xl', button_shadow: 'shadow-[0_0_20px_rgba(49,16,94,0.6)]', button_border: 'border border-[#552599]', button_animation: 'hover:scale-105 transition-transform', bg_animation: 'animate-pulse-slow' }
 },
 {
 name: 'Neon Tokyo',
 theme: { font_family: 'Syne', bg_type: 'gradient', bg_value: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)', text_color: '#ffffff', button_bg: 'rgba(0,0,0,0.4)', button_text: '#ff007f', button_style: 'rounded-tr-3xl rounded-bl-3xl backdrop-blur-md', button_shadow: 'shadow-[0_0_20px_rgba(255,0,127,0.4)]', button_border: 'border border-[#ff007f]', button_animation: 'hover:shadow-[0_0_30px_rgba(255,0,127,0.7)] transition-all', bg_animation: 'none' }
 },
 {
 name: 'Floating Elements',
 theme: { font_family: 'Comfortaa', bg_type: 'gradient', bg_value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', text_color: '#333333', button_bg: '#ffffff', button_text: '#333333', button_style: 'rounded-full', button_shadow: 'shadow-lg shadow-blue-200/50', button_border: 'border border-white', button_animation: 'animate-float', bg_animation: 'none' }
 },
 {
 name: 'Lava Lamp',
 theme: { font_family: 'Outfit', bg_type: 'gradient', bg_value: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%, #ff0844)', text_color: '#ffffff', button_bg: 'rgba(255,255,255,0.2)', button_text: '#ffffff', button_style: 'rounded-3xl backdrop-blur-md', button_shadow: 'shadow-lg', button_border: 'border border-white/30', button_animation: 'hover:scale-105 transition-all', bg_animation: 'animate-gradient-x' }
 },
 {
 name: 'Northern Lights',
 theme: { font_family: 'Space Grotesk', bg_type: 'gradient', bg_value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', text_color: '#000000', button_bg: 'rgba(0,0,0,0.8)', button_text: '#43e97b', button_style: 'rounded-2xl', button_shadow: 'shadow-[0_4px_20px_rgba(67,233,123,0.5)]', button_border: 'border border-[#43e97b]', button_animation: 'hover:bg-black transition-all', bg_animation: 'animate-aurora' }
 },
 {
 name: 'Ocean Wave',
 theme: { font_family: 'Plus Jakarta Sans', bg_type: 'gradient', bg_value: 'linear-gradient(90deg, #0099f7 0%, #2193b0 50%, #0099f7 100%)', text_color: '#ffffff', button_bg: '#ffffff', button_text: '#0099f7', button_style: 'rounded-xl', button_shadow: 'shadow-xl', button_border: 'border border-transparent', button_animation: ' transition-transform', bg_animation: 'animate-moving-bg' }
 },
 {
 name: 'Holographic',
 theme: { font_family: 'Syne', bg_type: 'gradient', bg_value: 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)', text_color: '#111111', button_bg: '#111111', button_text: '#85FFBD', button_style: 'rounded-[40px]', button_shadow: 'shadow-none', button_border: 'border-none', button_animation: 'hover:opacity-90 transition-opacity', bg_animation: 'animate-gradient-xy' }
 },
 {
 name: 'Stellar Spin',
 theme: { font_family: 'DM Sans', bg_type: 'gradient', bg_value: 'linear-gradient(135deg, #050505 0%, #1a1a1a 100%, #050505)', text_color: '#ffffff', button_bg: '#1a1a1a', button_text: '#ffffff', button_style: 'rounded-full', button_shadow: 'shadow-[0_0_15px_#ffffff]', button_border: 'border border-white', button_animation: 'hover:scale-110 transition-transform', bg_animation: 'animate-gradient-xy' }
 },
 {
 name: 'Wobbly Neon',
 theme: { font_family: 'Lexend', bg_type: 'gradient', bg_value: 'linear-gradient(45deg, #120458 0%, #000000 100%)', text_color: '#ffffff', button_bg: '#ff007f', button_text: '#ffffff', button_style: 'rounded-xl', button_shadow: 'shadow-[4px_4px_0_#00ffff]', button_border: 'border-2 border-[#00ffff]', button_animation: 'hover:scale-105 transition-transform', bg_animation: 'animate-pulse-slow' }
 }
]

export default function PageEditor() {
 const { id } = useParams()
 const navigate = useNavigate()
 const { getPage, updatePage, uploadImage } = usePages()
 const { user } = useAuth()
 
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
 layout: 'list', // list, grid
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
 button_animation: 'hover:scale-105 transition-transform',
 avatar_shape: 'rounded-full', // rounded-full, rounded-2xl, clip-hexagon
 button_align: 'justify-center', // justify-center, justify-start
 social_style: 'mono', // mono, brand
 bg_animated: false,
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
 const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
 const [blogToDeleteIndex, setBlogToDeleteIndex] = useState(null)
 const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false)
 const [currentEditingLinkIndex, setCurrentEditingLinkIndex] = useState(null)
 const [editingProductIndex, setEditingProductIndex] = useState(null)
 const [editingBlogIndex, setEditingBlogIndex] = useState(null)
 const [activeLinkTabs, setActiveLinkTabs] = useState({})

 const setLinkTab = (index, tab) => setActiveLinkTabs(prev => ({ ...prev, [index]: tab }))

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
 layout: 'list',
 bg_type: 'color',
 bg_value: '#f4f6fa',
 bg_color: '#f4f6fa', 
 text_color: '#273144', 
 button_bg: '#ffffff', 
 button_text: '#273144', 
 button_style: 'rounded-xl',
 button_shadow: 'shadow-sm',
 button_border: 'border-transparent',
 button_border: 'border-transparent',
 button_animation: 'hover:scale-105 transition-transform',
 avatar_shape: 'rounded-full',
 button_align: 'justify-center',
 social_style: 'mono',
 bg_animated: false,
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

 const handleAddBlock = (blockId) => {
 setIsBlockPickerOpen(false)

 const isMonetization = ['digital_product', 'appointment', 'event', 'physical_product', 'blog'].includes(blockId);
 if (isMonetization && !user?.user_metadata?.whatsapp_number) {
 toast.error('Silakan isi Nomor WhatsApp di menu Profile terlebih dahulu.', { duration: 4000 });
 navigate('/settings');
 return;
 }

 if (blockId === 'header') {
 setLinks([...links, { id: Date.now().toString(), type: 'header', title: 'New Section' }])
 } else if (blockId === 'link') {
 setLinks([...links, { id: Date.now().toString(), type: 'link', title: '', subtitle: '', url: '', icon: '', thumbnail_url: '' }])
 } else if (blockId === 'page_break') {
 setLinks([...links, { id: Date.now().toString(), type: 'page_break', title: 'Page Break' }])
 } else {
 // For now, other blocks behave exactly like links but maybe with a pre-filled title/icon
 setLinks([...links, { id: Date.now().toString(), type: blockId, title: `New ${blockId}`, subtitle: 'Coming soon feature', url: '', icon: '', thumbnail_url: '' }])
 }
 }

 const updateLink = (index, field, value, fullObject = null) => {
 const newLinks = [...links]
 if (fullObject) {
 newLinks[index] = fullObject;
 } else {
 newLinks[index] = { ...newLinks[index], [field]: value }
 }
 setLinks(newLinks)
 }

 const removeLink = async (index) => {
 const linkToDelete = links[index];
 
 // If it's a blog and has a valid UUID, delete from DB
 if (linkToDelete.type === 'blog' && linkToDelete.id && linkToDelete.id.length === 36) {
 setBlogToDeleteIndex(index);
 return;
 }

 const newLinks = [...links];
 newLinks.splice(index, 1);
 setLinks(newLinks);
 
 // Auto save the layout so it syncs immediately
 await updatePage(id, { title, description, avatar_url: avatarUrl, theme, links: newLinks });
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
 <LoadingSpinner size="large" />
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
 <Link to="/dashboard/pages" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200" title="Back to Pages">
 <ArrowLeft className="h-5 w-5" />
 </Link>
 <div>
 <div className="flex items-center gap-2">
 <h1 className="font-bold text-slate-800 text-lg">Editing Page</h1>
 <Link to="/dashboard/pages" className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200 transition-colors">
 <LucideIcons.LayoutTemplate className="w-3 h-3" /> Switch Page
 </Link>
 </div>
 <a href={`/p/${page?.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0b5cff] hover:underline flex items-center mt-0.5">
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
 <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
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
 <div className="mt-4">
 <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Shape</label>
 <select 
 value={theme.avatar_shape || 'rounded-full'} 
 onChange={(e) => setTheme({...theme, avatar_shape: e.target.value})}
 className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-[#0b5cff]/20"
 >
 <option value="rounded-full">Circle</option>
 <option value="rounded-2xl">Rounded Square</option>
 <option value="clip-hexagon">Hexagon</option>
 </select>
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
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-slate-900 flex items-center">
 Social Links
 </h2>
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-slate-700">Style:</span>
 <select
 value={theme.social_style || 'mono'}
 onChange={(e) => setTheme({...theme, social_style: e.target.value})}
 className="text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
 >
 <option value="mono">Monochrome</option>
 <option value="brand">Brand Colors</option>
 </select>
 </div>
 </div>
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
 Links & Blocks
 </h2>
 <Button type="button" onClick={() => setIsBlockPickerOpen(true)} className="bg-[#0b5cff] hover:bg-blue-700 shadow-lg shadow-blue-500/30 text-white rounded-xl px-5 py-2.5 text-sm font-black transition-all">
 <Plus className="h-4 w-4 mr-1 stroke-[3]" />
 Add Block
 </Button>
 </div>

 <div className="space-y-4">
 {links.length === 0 ? (
 <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
 <Link2 className="h-8 w-8 text-slate-400 mx-auto mb-3" />
 <p className="text-slate-500 font-medium">You haven't added any blocks yet.</p>
 </div>
 ) : (
 links.map((link, index) => (
 <div key={link.id || index} className={`bg-white border ${link.type === 'header' ? 'border-indigo-200 shadow-sm' : 'border-slate-200 shadow-sm'} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 group`}>
 <div className="flex flex-row sm:flex-col items-center justify-center gap-2 text-slate-300 w-full sm:w-auto border-b sm:border-b-0 border-slate-100 pb-2 sm:pb-0">
 <button type="button" onClick={() => moveLink(index, 'up')} disabled={index === 0} className="hover:text-slate-600 disabled:opacity-30">
 <span className="text-lg leading-none sm:block hidden">▲</span>
 <span className="text-lg leading-none sm:hidden">◀</span>
 </button>
 <GripVertical className="h-5 w-5 rotate-90 sm:rotate-0" />
 <button type="button" onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="hover:text-slate-600 disabled:opacity-30">
 <span className="text-lg leading-none sm:block hidden">▼</span>
 <span className="text-lg leading-none sm:hidden">▶</span>
 </button>
 </div>
 
 {link.type === 'page_break' ? (
 <div className="flex-1 flex flex-col justify-center text-center py-4 relative">
 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-200"></div>
 <div className="relative z-10 bg-white border-2 border-dashed border-amber-300 mx-auto px-4 py-2 rounded-xl text-amber-600 font-bold flex items-center gap-2">
 <LucideIcons.Layers className="w-5 h-5" />
 Page Break (New Tab)
 </div>
 </div>
 ) : link.type === 'header' ? (
 <div className="flex-1 flex flex-col justify-center">
 <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Header Block</div>
 <Input
 placeholder="Header Title"
 value={link.title || ''}
 onChange={(e) => updateLink(index, 'title', e.target.value)}
 className="font-bold text-slate-800 border-none bg-indigo-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-lg py-3"
 />
 </div>
 ) : link.type === 'video' ? (
 <div className="flex-1 flex flex-col justify-center space-y-3">
 <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Video className="w-4 h-4"/> Video Embed</div>
 <Input
 placeholder="YouTube or TikTok URL"
 value={link.url || ''}
 onChange={(e) => updateLink(index, 'url', e.target.value)}
 className="font-bold text-slate-800 border-none bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 py-3"
 />
 <p className="text-[10px] text-slate-400">Paste a YouTube or TikTok link to embed a video player.</p>
 </div>
 ) : link.type === 'image' ? (
 <>
 <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-4 gap-3">
 {link.thumbnail_url ? (
 <div className="relative group w-24 h-24">
 <img src={link.thumbnail_url} alt="img" className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
 <button onClick={() => updateLink(index, 'thumbnail_url', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
 </div>
 ) : (
 <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500/50 hover:bg-emerald-50 text-slate-400 flex flex-col items-center justify-center cursor-pointer transition-all">
 <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
 <span className="text-[10px] font-bold">Upload</span>
 <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
 const file = e.target.files?.[0];
 if(!file) return;
 const res = await uploadImage(file);
 if(res.success) updateLink(index, 'thumbnail_url', res.url);
 }} />
 </label>
 )}
 </div>
 <div className="flex-1 flex flex-col justify-center space-y-3">
 <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Image Block</div>
 <Input
 placeholder="Destination URL (Optional)"
 value={link.url || ''}
 onChange={(e) => updateLink(index, 'url', e.target.value)}
 className="border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 py-2"
 />
 <p className="text-[10px] text-slate-400">Make the image clickable by adding a destination URL.</p>
 </div>
 </>
 ) : link.type === 'folder' ? (
 <div className="flex-1 flex flex-col justify-center space-y-3">
 <div className="text-xs font-bold text-[#0b5cff] uppercase tracking-wider mb-1 flex items-center gap-1"><LucideIcons.Folder className="w-4 h-4"/> Folder</div>
 <Input
 placeholder="Folder Title (e.g. My Socials)"
 value={link.title || ''}
 onChange={(e) => updateLink(index, 'title', e.target.value)}
 className="font-bold text-slate-800 border-none bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 py-3"
 />
 <div className="space-y-2 mt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
 {(link.items || []).map((subLink, subIndex) => (
 <div key={subIndex} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm relative group">
 <div className="flex-1 flex flex-col gap-2">
 <input type="text" placeholder="Title" value={subLink.title} onChange={(e) => { const newItems = [...(link.items||[])]; newItems[subIndex].title = e.target.value; updateLink(index, 'items', newItems); }} className="w-full text-sm font-medium outline-none px-2" />
 <div className="h-px w-full bg-slate-100"></div>
 <input type="text" placeholder="URL" value={subLink.url} onChange={(e) => { const newItems = [...(link.items||[])]; newItems[subIndex].url = e.target.value; updateLink(index, 'items', newItems); }} className="w-full text-xs text-slate-500 outline-none px-2" />
 </div>
 <button onClick={() => { const newItems = [...(link.items||[])]; newItems.splice(subIndex, 1); updateLink(index, 'items', newItems); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
 </div>
 ))}
 <Button type="button" onClick={() => { const newItems = [...(link.items||[])]; newItems.push({ title: 'New Link', url: '' }); updateLink(index, 'items', newItems); }} variant="secondary" className="w-full justify-center text-xs py-2 bg-white border-dashed"><Plus className="w-3 h-3 mr-1" /> Add Link</Button>
 </div>
 </div>
 ) : (
 <div className="flex flex-col w-full">
 <div className="flex flex-row sm:flex-col items-center justify-center sm:border-r border-b sm:border-b-0 border-slate-100 sm:pr-4 pb-4 sm:pb-0 gap-3 w-full sm:w-auto sm:mb-0 mb-4 self-center sm:self-start sm:float-left">
 {link.thumbnail_url ? (
 <div className="relative group w-16 h-16">
 <img src={link.thumbnail_url} alt="thumb" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
 <button onClick={() => updateLink(index, 'thumbnail_url', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
 </div>
 ) : (
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
 )}
 
 {!link.thumbnail_url && (
 <label className="text-[10px] font-bold text-slate-400 hover:text-[#0b5cff] cursor-pointer flex items-center gap-1">
 <ImageIcon className="w-3 h-3" /> Image
 <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
 const file = e.target.files?.[0];
 if(!file) return;
 const res = await uploadImage(file);
 if(res.success) updateLink(index, 'thumbnail_url', res.url);
 }} />
 </label>
 )}
 </div>

 {(() => {
 const isComplex = ['digital_product', 'appointment', 'event', 'physical_product', 'blog'].includes(link.type);
 const tab = activeLinkTabs[index] || 'content';
 
 if (!isComplex) {
 return (
 <div className="flex-1 space-y-3">
 <Input
 placeholder="Title (e.g. My Website)"
 value={link.title || ''}
 onChange={(e) => updateLink(index, 'title', e.target.value)}
 className="font-bold text-slate-800 border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 text-lg py-2"
 />
 <Input
 placeholder="Subtitle (Optional)"
 value={link.subtitle || ''}
 onChange={(e) => updateLink(index, 'subtitle', e.target.value)}
 className="text-sm text-slate-600 border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 py-2"
 />
 <Input
 placeholder="URL (e.g. https://ryz.my.id/site)"
 value={link.url || ''}
 onChange={(e) => updateLink(index, 'url', e.target.value)}
 className="border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20"
 />
 </div>
 );
 }

 return (
 <div className="flex-1 flex flex-col justify-center gap-2">
 <div>
 <div className="text-sm font-bold text-slate-800">{link.title || 'Untitled Product'}</div>
 <div className="text-xs font-semibold text-emerald-600">{link.price ? `Rp ${parseInt(link.price).toLocaleString('id-ID')}` : 'FREE'}</div>
 </div>
 <button
 type="button"
 onClick={() => link.type === 'blog' ? setEditingBlogIndex(index) : setEditingProductIndex(index)}
 className="self-start px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
 >
 ⚙️ Edit Details
 </button>
 </div>
 );
 })()}
 </div>
 )}
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

 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="col-span-1 md:col-span-2">
 <h3 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">Layout & Structure</h3>
 </div>

 {/* Navbar Settings */}
 <div className="col-span-1 md:col-span-2">
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-slate-700">Enable Top Navbar</label>
 <button 
 type="button"
 onClick={() => setTheme({...theme, navbar_enabled: !theme.navbar_enabled})}
 className={`w-12 h-6 rounded-full transition-colors relative ${theme.navbar_enabled ? 'bg-[#0b5cff]' : 'bg-slate-300'}`}
 >
 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme.navbar_enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
 </button>
 </div>
 {theme.navbar_enabled && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200 mt-2">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Navbar Title</label>
 <Input value={theme.navbar_title || ''} onChange={e => setTheme({...theme, navbar_title: e.target.value})} placeholder="e.g. My Link in Bio" className="text-sm px-3 py-2 h-9" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Navbar Style</label>
 <select value={theme.navbar_style || 'glass'} onChange={e => setTheme({...theme, navbar_style: e.target.value})} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0b5cff] focus:outline-none">
 <option value="solid">Solid Color</option>
 <option value="transparent">Transparent</option>
 <option value="glass">Glassmorphism</option>
 </select>
 </div>
 </div>
 )}
 </div>

 {/* Profile Layout */}
 <div className="col-span-1 md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">Profile Layout</label>
 <select 
 value={theme.profile_layout || 'classic'} 
 onChange={(e) => setTheme({...theme, profile_layout: e.target.value})}
 className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]"
 >
 <option value="classic">Classic (Avatar top, Bio below)</option>
 <option value="compact">Compact (Smaller avatar, tight spacing)</option>
 <option value="side-by-side">Side by Side (Avatar left, Bio right)</option>
 <option value="hidden">Hidden (Don't show profile info)</option>
 </select>
 </div>

 {/* Footer Settings */}
 <div className="col-span-1 md:col-span-2">
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-slate-700">Enable Footer</label>
 <button 
 type="button"
 onClick={() => setTheme({...theme, footer_enabled: !theme.footer_enabled})}
 className={`w-12 h-6 rounded-full transition-colors relative ${theme.footer_enabled ? 'bg-[#0b5cff]' : 'bg-slate-300'}`}
 >
 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme.footer_enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
 </button>
 </div>
 {theme.footer_enabled && (
 <div className="p-4 bg-white rounded-xl border border-slate-200 mt-2">
 <label className="block text-xs font-bold text-slate-700 mb-1">Footer Text</label>
 <Input value={theme.footer_text || ''} onChange={e => setTheme({...theme, footer_text: e.target.value})} placeholder={`e.g. © ${new Date().getFullYear()} My Business`} className="text-sm px-3 py-2 h-9" />
 </div>
 )}
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

 {theme.bg_type === 'gradient' && (
 <div className="flex items-center gap-2 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
 <input 
 type="checkbox" 
 id="bg_animated"
 checked={theme.bg_animated || false}
 onChange={(e) => setTheme({...theme, bg_animated: e.target.checked})}
 className="rounded text-[#0b5cff] focus:ring-[#0b5cff]"
 />
 <label htmlFor="bg_animated" className="text-sm font-bold text-slate-700 cursor-pointer">Animate Gradient Background</label>
 </div>
 )}

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

 {/* Background Pattern */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Background Pattern</label>
 <select value={theme.bg_pattern || 'none'} onChange={(e) => setTheme({...theme, bg_pattern: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="none">None</option>
 <option value="grid">Grid</option>
 <option value="dots">Polka Dots</option>
 <option value="topography">Topography</option>
 <option value="noise">Noise Texture</option>
 </select>
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

 {/* Layout Style */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Link Layout</label>
 <select value={theme.layout || 'list'} onChange={(e) => setTheme({...theme, layout: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="list">List</option>
 <option value="grid">Grid (2 Columns)</option>
 </select>
 </div>

 {/* Button Style & Shadows */}
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Button Style</label>
 <select value={theme.button_style?.split(' ')[0] || 'rounded-xl'} onChange={(e) => setTheme({...theme, button_style: e.target.value + (theme.button_style?.includes('backdrop-blur') ? ' backdrop-blur-md' : '')})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="rounded-none">Square</option>
 <option value="rounded-md">Rounded</option>
 <option value="rounded-xl">Rounded XL</option>
 <option value="rounded-full">Pill</option>
 <option value="rounded-[2rem]">Large Pill (2rem)</option>
 <option value="rounded-tl-2xl rounded-br-2xl">Leaf Shape</option>
 <option value="rounded-tr-3xl rounded-bl-3xl">Opposite Leaf</option>
 <option value="rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">Brutalism</option>
 <option value="rounded-2xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border-transparent bg-[#f4f6fa] text-[#273144]">Neumorphism</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Button Text Align</label>
 <select value={theme.button_align || 'justify-center'} onChange={(e) => setTheme({...theme, button_align: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="justify-center">Center</option>
 <option value="justify-start">Left</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Button Animation</label>
 <select value={theme.button_animation || ''} onChange={(e) => setTheme({...theme, button_animation: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="">None</option>
 <option value="hover:scale-105 transition-transform">Scale Up</option>
 <option value=" transition-transform">Float Up</option>
 <option value="hover:translate-x-1 hover:shadow-none transition-all">Press Down</option>
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

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Button Border</label>
 <select value={theme.button_border || 'border-transparent'} onChange={(e) => setTheme({...theme, button_border: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/20 focus:border-[#0b5cff]">
 <option value="border-transparent">None</option>
 <option value="border border-white/20">Thin Glass</option>
 <option value="border border-slate-300">Thin Solid</option>
 <option value="border-2 border-black">Thick Dark</option>
 <option value="border-2 border-[#0b5cff]">Accent Color</option>
 <option value="border-b-4 border-black">Bottom Bold</option>
 <option value="border-l-4 border-[#0b5cff]">Left Accent</option>
 <option value="border-l-4 border-transparent">Left Transparent</option>
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

 {/* Navbar Preview */}
 {theme.navbar_enabled && (
 <div className={`absolute top-0 inset-x-0 z-30 px-4 py-3 flex items-center justify-between transition-colors
 ${theme.navbar_style === 'solid' ? 'bg-white text-slate-900 border-b border-slate-200' : 
 theme.navbar_style === 'transparent' ? 'bg-transparent' : 
 'bg-white/70 backdrop-blur-md text-slate-900 border-b border-white/20'}`}
 style={theme.navbar_style === 'transparent' ? { color: theme.text_color } : {}}
 >
 <div className="font-bold text-sm truncate pr-4">{theme.navbar_title || title || '@' + page?.slug}</div>
 <button className={`p-1 rounded-full transition-colors ${theme.navbar_style === 'transparent' ? 'hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
 <LucideIcons.Share2 className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* Actual Preview Content */}
 <div 
 className={`absolute inset-0 z-10 overflow-y-auto no-scrollbar ${theme.bg_animation && theme.bg_animation !== 'none' ? theme.bg_animation : ''} ${theme.bg_animated && theme.bg_type === 'gradient' ? 'animate-gradient' : ''} ${theme.navbar_enabled ? 'pt-14' : ''} ${theme.bg_pattern ? 'bg-pattern-' + theme.bg_pattern : ''}`}
 style={{ 
 fontFamily: theme.font_family || 'Inter',
 background: theme.bg_type === 'gradient' ? theme.bg_value : theme.bg_type === 'image' ? `url(${theme.bg_value}) center/cover` : theme.bg_value || theme.bg_color,
 color: theme.text_color 
 }}
 >
 <FloatingParticles count={40} color={theme.text_color} />
 <div className="px-6 py-12 flex flex-col items-center relative z-10">
 {/* Profile Layout Logic */}
 {theme.profile_layout !== 'hidden' && (
 <div className={`w-full flex ${theme.profile_layout === 'side-by-side' ? 'flex-row items-center text-left gap-4 mb-8' : 'flex-col items-center mb-8'}`}>
 {/* Avatar */}
 {avatarUrl ? (
 <img src={avatarUrl} alt="Avatar" className={`object-cover shadow-md border-2 border-white/20 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'} ${theme.profile_layout === 'compact' ? 'w-16 h-16' : theme.profile_layout === 'side-by-side' ? 'w-20 h-20 shrink-0' : 'w-24 h-24 mb-4'}`} />
 ) : (
 <div className={`bg-slate-200 shadow-md flex items-center justify-center text-slate-400 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'} ${theme.profile_layout === 'compact' ? 'w-16 h-16' : theme.profile_layout === 'side-by-side' ? 'w-20 h-20 shrink-0' : 'w-24 h-24 mb-4'}`}>
 <ImageIcon className={`${theme.profile_layout === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}`} />
 </div>
 )}
 
 {/* Profile Text */}
 <div className={`${theme.profile_layout === 'side-by-side' ? 'flex-1' : 'w-full'}`}>
 <h1 className={`${theme.profile_layout === 'compact' ? 'text-lg mt-3' : 'text-xl'} font-bold mb-1 ${theme.profile_layout === 'side-by-side' ? 'text-left' : 'text-center'}`} style={{ color: theme.text_color }}>
 {title || '@your_username'}
 </h1>
 <p className={`text-sm opacity-80 ${theme.profile_layout === 'side-by-side' ? 'text-left' : 'text-center'} ${theme.profile_layout === 'compact' ? 'mt-1' : 'mt-2'}`} style={{ color: theme.text_color }}>
 {description || 'Your bio goes here. Tell people about what you do.'}
 </p>
 </div>
 </div>
 )}

 {/* Social Links */}
 {(theme.social_links?.instagram || theme.social_links?.twitter || theme.social_links?.github || theme.social_links?.linkedin || theme.social_links?.youtube || theme.social_links?.tiktok) && (
 <div className="flex flex-wrap justify-center gap-4 mb-8">
 {theme.social_links?.instagram && <a href={theme.social_links.instagram} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.instagram : theme.text_color }}><FaInstagram className="w-6 h-6" /></a>}
 {theme.social_links?.twitter && <a href={theme.social_links.twitter} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.twitter : theme.text_color }}><FaXTwitter className="w-6 h-6" /></a>}
 {theme.social_links?.github && <a href={theme.social_links.github} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.github : theme.text_color }}><FaGithub className="w-6 h-6" /></a>}
 {theme.social_links?.linkedin && <a href={theme.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.linkedin : theme.text_color }}><FaLinkedin className="w-6 h-6" /></a>}
 {theme.social_links?.youtube && <a href={theme.social_links.youtube} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.youtube : theme.text_color }}><FaYoutube className="w-6 h-6" /></a>}
 {theme.social_links?.tiktok && <a href={theme.social_links.tiktok} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.tiktok : theme.text_color }}><FaTiktok className="w-6 h-6" /></a>}
 </div>
 )}

 {/* Links & Blocks */}
 <div className={`w-full ${theme.layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}`}>
 {links.length > 0 ? (
 links.map((link, i) => {
 if (link.type === 'header') {
 return (
 <div key={i} className={`w-full pt-8 pb-4 flex items-center justify-center gap-3 ${theme.layout === 'grid' ? 'col-span-2' : ''}`} style={{ color: theme.text_color }}>
 <div className="h-[2px] bg-current opacity-20 flex-1 max-w-[30px] rounded-full"></div>
 <h2 className="text-xs md:text-sm font-black tracking-[0.2em] uppercase text-center">
 {link.title}
 </h2>
 <div className="h-[2px] bg-current opacity-20 flex-1 max-w-[30px] rounded-full"></div>
 </div>
 )
 }
 
 if (link.type === 'page_break') {
 return (
 <div key={i} className={`w-full py-6 flex items-center justify-center gap-3 ${theme.layout === 'grid' ? 'col-span-2' : ''}`} style={{ color: theme.text_color }}>
 <div className="h-[2px] border-b-2 border-dashed bg-current opacity-30 w-full relative">
 <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-inherit px-2 text-[10px] opacity-70 tracking-widest uppercase">Page Break</span>
 </div>
 </div>
 )
 }

 if (link.type === 'video') {
 const embedUrl = getYouTubeEmbedUrl(link.url);
 return (
 <div key={i} className={`w-full overflow-hidden ${theme.button_style} ${theme.layout === 'grid' ? 'col-span-2' : ''}`}>
 {embedUrl ? (
 <div className="relative w-full pb-[56.25%]">
 <iframe
 src={embedUrl}
 className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 ></iframe>
 </div>
 ) : (
 <div className="w-full py-12 bg-black/5 flex flex-col items-center justify-center text-current opacity-60">
 <LucideIcons.Video className="w-8 h-8 mb-2" />
 <span className="text-xs font-medium">Invalid Video URL</span>
 </div>
 )}
 </div>
 )
 }

 if (link.type === 'image') {
 return (
 <div key={i} className={`w-full overflow-hidden ${theme.button_style} ${theme.button_animation || 'hover:scale-[1.02]'} transition-transform ${theme.layout === 'grid' ? 'col-span-2' : ''}`}>
 {link.url ? (
 <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full">
 <img src={link.thumbnail_url || 'https://via.placeholder.com/600x200?text=Image+Placeholder'} alt="Image Block" className="w-full object-cover" />
 </a>
 ) : (
 <img src={link.thumbnail_url || 'https://via.placeholder.com/600x200?text=Image+Placeholder'} alt="Image Block" className="w-full object-cover" />
 )}
 </div>
 )
 }

 if (link.type === 'folder') {
 return (
 <div key={i} className={`w-full overflow-hidden ${theme.button_style} ${theme.button_border || 'border border-transparent'} ${theme.button_shadow || 'shadow-sm'} transition-transform ${theme.layout === 'grid' ? 'col-span-2' : ''}`} style={{ backgroundColor: theme.button_bg, color: theme.button_text }}>
 <div className="w-full py-4 px-6 flex items-center justify-between">
 <span className="font-bold flex items-center gap-3">{link.icon && LucideIcons[link.icon] ? React.createElement(LucideIcons[link.icon], { className:"w-4 h-4" }) : <LucideIcons.Folder className="w-4 h-4"/>} {link.title || 'Folder'}</span>
 <LucideIcons.ChevronDown className="w-4 h-4 opacity-50" />
 </div>
 </div>
 )
 }

 const isComplex = ['digital_product', 'appointment', 'event', 'physical_product', 'blog'].includes(link.type);
 if (isComplex) {
 return (
 <div key={i} className="pointer-events-none">
 <ComplexBlockRender link={link} theme={theme} />
 </div>
 )
 }

 return (
 <a
 key={i}
 href={link.url || '#'}
 target="_blank"
 rel="noopener noreferrer"
 className={`block w-full font-bold transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-95 ${theme.button_style} ${theme.button_border || 'border border-transparent'} ${theme.button_shadow || 'shadow-sm'} relative overflow-hidden ${theme.layout === 'grid' ? 'aspect-square p-4 flex flex-col items-center justify-center text-center gap-2' : 'py-4 px-6 text-sm'}`}
 style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
 >
 <div className={`flex relative z-10 w-full ${theme.layout === 'grid' ? 'flex-col items-center justify-center' : `items-center gap-3 ${theme.button_align || 'justify-center'}`}`}>
 {link.thumbnail_url ? (
 <div className="shrink-0">
 <img src={link.thumbnail_url} alt="thumbnail" className={`${theme.layout === 'grid' ? 'w-12 h-12 mb-2' : 'w-8 h-8'} rounded-lg object-cover shadow-sm`} />
 </div>
 ) : (link.icon && LucideIcons[link.icon]) && (
 <div className="flex items-center justify-center shrink-0">
 {(() => {
 const IconComponent = LucideIcons[link.icon];
 return <IconComponent className={`${theme.layout === 'grid' ? 'w-8 h-8 mb-2' : 'w-5 h-5'}`} />;
 })()}
 </div>
 )}
 
 <div className={`flex flex-col w-full ${theme.layout === 'grid' ? 'items-center text-center' : (theme.button_align === 'justify-start' ? 'items-start text-left' : 'items-center text-center')}`}>
 <span className="truncate w-full leading-tight">{link.title || 'Link Title'}</span>
 {link.subtitle && <span className="text-[11px] font-medium opacity-80 truncate w-full mt-1 leading-none">{link.subtitle}</span>}
 </div>
 </div>
 </a>
 )
 })
 ) : null}
 {links.length === 0 && (
 <div className="w-full text-center p-6 bg-black/5 rounded-xl text-sm font-medium opacity-60 text-current">
 No blocks yet.
 </div>
 )}
 </div>

 {/* Footer Preview */}
 {theme.footer_enabled && (
 <div className="w-full mt-12 mb-6 text-center">
 <p className="text-xs font-medium opacity-60" style={{ color: theme.text_color }}>
 {theme.footer_text || `© ${new Date().getFullYear()} ${title || 'RYZ Shortlink'}`}
 </p>
 </div>
 )}
 
 {/* Watermark (Always below footer) */}
 {!theme.hide_branding && (
 <a href="/" target="_blank" rel="noopener noreferrer" className="mt-8 text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5" style={{ color: theme.text_color }}>
 <div className="w-4 h-4 rounded bg-current opacity-20"></div>
 Powered by RYZ
 </a>
 )}
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
 
 <BlockPickerModal
 isOpen={isBlockPickerOpen}
 onClose={() => setIsBlockPickerOpen(false)}
 onSelect={handleAddBlock}
 />

 <ProductEditorModal
 isOpen={editingProductIndex !== null}
 onClose={() => setEditingProductIndex(null)}
 initialData={editingProductIndex !== null ? links[editingProductIndex] : null}
 onSave={async (updatedLink) => {
 updateLink(editingProductIndex, null, null, updatedLink);
 setEditingProductIndex(null);
 
 const newLinks = [...links];
 newLinks[editingProductIndex] = updatedLink;
 await updatePage(id, { title, description, avatar_url: avatarUrl, theme, links: newLinks });
 }}
 />
 
 <BlogEditorModal
 isOpen={editingBlogIndex !== null}
 onClose={() => setEditingBlogIndex(null)}
 initialData={editingBlogIndex !== null ? links[editingBlogIndex] : null}
 onSave={async (updatedLink) => {
 updateLink(editingBlogIndex, null, null, updatedLink);
 setEditingBlogIndex(null);

 const newLinks = [...links];
 newLinks[editingBlogIndex] = updatedLink;
 await updatePage(id, { title, description, avatar_url: avatarUrl, theme, links: newLinks });
 }}
 />

 <ConfirmModal
 isOpen={blogToDeleteIndex !== null}
 onClose={() => setBlogToDeleteIndex(null)}
 onConfirm={async () => {
 if (blogToDeleteIndex === null) return;
 const index = blogToDeleteIndex;
 const linkToDelete = links[index];
 
 toast.loading("Deleting blog...", { id: 'del-blog' });
 const { error } = await supabase.from('blogs').delete().eq('id', linkToDelete.id);
 if (error) {
 toast.error("Failed to delete blog", { id: 'del-blog' });
 return;
 }
 toast.success("Blog deleted", { id: 'del-blog' });

 const newLinks = [...links];
 newLinks.splice(index, 1);
 setLinks(newLinks);
 await updatePage(id, { title, description, avatar_url: avatarUrl, theme, links: newLinks });
 setBlogToDeleteIndex(null);
 }}
 title="Delete Blog"
 message="This will permanently delete this blog and all its chapters from the database. Are you sure?"
 />
 </DashboardLayout>
 )
}
