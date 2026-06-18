import { useState } from 'react'
import { X, Image as ImageIcon, Link as LinkIcon, Type, PlaySquare, ShoppingBag, Calendar, Star, DollarSign, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

const BLOCKS = [
  {
    id: 'link',
    title: 'Link',
    description: 'Add a link shortcut',
    icon: LinkIcon,
    color: 'text-[#0b5cff]',
    bg: 'bg-blue-50',
    category: 'Basic'
  },
  {
    id: 'header',
    title: 'Text',
    description: 'Add headlines and descriptions',
    icon: Type,
    color: 'text-[#0b5cff]',
    bg: 'bg-blue-50',
    category: 'Basic'
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Add images',
    icon: ImageIcon,
    color: 'text-[#0b5cff]',
    bg: 'bg-blue-50',
    category: 'Basic',
    badge: 'NEW'
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Play video from other platform',
    icon: PlaySquare,
    color: 'text-[#0b5cff]',
    bg: 'bg-blue-50',
    category: 'Basic'
  },
  {
    id: 'digital_product',
    title: 'Digital Product',
    description: 'Sell digital products',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    category: 'Monetization'
  },
  {
    id: 'appointment',
    title: 'Appointment',
    description: 'Create paid calendar booking',
    icon: Calendar,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    category: 'Monetization'
  },
  {
    id: 'event',
    title: 'Event',
    description: 'Create events for your fans',
    icon: Star,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    category: 'Monetization'
  },
  {
    id: 'physical_product',
    title: 'Physical Product',
    description: 'Sell physical products',
    icon: ShoppingBag,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    category: 'Monetization',
    isPro: true
  },
  {
    id: 'blog',
    title: 'Blog / E-Learning',
    description: 'Create multi-chapter web novels or guides',
    icon: BookOpen,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    category: 'Monetization'
  }
]

export default function BlockPickerModal({ isOpen, onClose, onSelect }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('All Blocks')
  
  if (!isOpen) return null

  const isProUser = ['pro', 'enterprise'].includes(user?.user_metadata?.plan_type);
  const tabs = ['All Blocks', 'Basic', 'Monetization']

  const filteredBlocks = BLOCKS.filter(b => {
    if (activeTab === 'All Blocks') return true
    return b.category === activeTab
  })

  // Group by category for 'All Blocks' view
  const basicBlocks = filteredBlocks.filter(b => b.category === 'Basic')
  const monetizationBlocks = filteredBlocks.filter(b => b.category === 'Monetization')

  const handleSelectBlock = (block) => {
    if (block.isPro && !isProUser) {
      toast.error('🌟 Fitur ini khusus pengguna PRO. Silakan upgrade plan Anda di menu Settings.');
      return;
    }
    onSelect(block.id);
  }

  const BlockItem = ({ block }) => {
    const Icon = block.icon
    const isLocked = block.isPro && !isProUser;
    return (
      <button 
        onClick={() => handleSelectBlock(block)}
        className={`flex items-center gap-4 p-4 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl transition-all text-left group w-full relative ${isLocked ? 'opacity-70' : ''}`}
      >
        <div className={`w-14 h-14 rounded-2xl ${block.bg} ${block.color} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-sm mb-0.5 flex items-center gap-2">
            {block.title}
          </div>
          <div className="text-xs text-slate-500 leading-snug pr-8">{block.description}</div>
        </div>
        {block.isPro && (
          <span className="absolute right-4 top-4 bg-amber-400 shadow-sm shadow-amber-500/30 text-amber-950 text-[9px] font-black tracking-widest px-2 py-1 rounded-full uppercase">
            PRO
          </span>
        )}
        {!block.isPro && block.badge && (
          <span className="absolute right-4 top-4 bg-[#0b5cff] shadow-sm shadow-blue-500/30 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-full uppercase">
            {block.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in-up">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
        
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Block</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Select a block to add to your page</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 transition-all p-2 hover:bg-slate-50 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex px-8 border-b border-slate-100 shrink-0 gap-8">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
          {activeTab === 'All Blocks' || activeTab === 'Basic' ? (
            <div className="mb-10">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-slate-300"></span> Basic Blocks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {basicBlocks.map(block => <BlockItem key={block.id} block={block} />)}
              </div>
            </div>
          ) : null}

          {activeTab === 'All Blocks' || activeTab === 'Monetization' ? (
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-slate-300"></span> Monetization Blocks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {monetizationBlocks.map(block => <BlockItem key={block.id} block={block} />)}
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  )
}
