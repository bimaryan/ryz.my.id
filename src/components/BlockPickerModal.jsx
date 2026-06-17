import { useState } from 'react'
import { X, Image as ImageIcon, Link as LinkIcon, Type, PlaySquare, ShoppingBag, Calendar, Star, DollarSign } from 'lucide-react'

const BLOCKS = [
  {
    id: 'link',
    title: 'Link',
    description: 'Add a link shortcut',
    icon: LinkIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    category: 'Basic'
  },
  {
    id: 'header',
    title: 'Text',
    description: 'Add headlines and descriptions',
    icon: Type,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    category: 'Basic'
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Add images',
    icon: ImageIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    category: 'Basic',
    badge: 'NEW'
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Play video from other platform',
    icon: PlaySquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    category: 'Basic'
  },
  {
    id: 'digital_product',
    title: 'Digital Product',
    description: 'Sell digital products',
    icon: DollarSign,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    category: 'Monetization'
  },
  {
    id: 'appointment',
    title: 'Appointment',
    description: 'Create paid calendar booking',
    icon: Calendar,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    category: 'Monetization'
  },
  {
    id: 'event',
    title: 'Event',
    description: 'Create events for your fans',
    icon: Star,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    category: 'Monetization'
  },
  {
    id: 'physical_product',
    title: 'Physical Product',
    description: 'Sell physical products',
    icon: ShoppingBag,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    category: 'Monetization'
  }
]

export default function BlockPickerModal({ isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('All Blocks')
  
  if (!isOpen) return null

  const tabs = ['All Blocks', 'Basic', 'Monetization']

  const filteredBlocks = BLOCKS.filter(b => {
    if (activeTab === 'All Blocks') return true
    return b.category === activeTab
  })

  // Group by category for 'All Blocks' view
  const basicBlocks = filteredBlocks.filter(b => b.category === 'Basic')
  const monetizationBlocks = filteredBlocks.filter(b => b.category === 'Monetization')

  const BlockItem = ({ block }) => {
    const Icon = block.icon
    return (
      <button 
        onClick={() => onSelect(block.id)}
        className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group w-full relative"
      >
        <div className={`w-12 h-12 rounded-xl ${block.bg} ${block.color} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-sm">{block.title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{block.description}</div>
        </div>
        {block.badge && (
          <span className="absolute right-4 top-4 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {block.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">Add new block</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex px-6 border-b border-slate-100 shrink-0 gap-6">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'All Blocks' || activeTab === 'Basic' ? (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Basic</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {basicBlocks.map(block => <BlockItem key={block.id} block={block} />)}
              </div>
            </div>
          ) : null}

          {activeTab === 'All Blocks' || activeTab === 'Monetization' ? (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Monetization</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {monetizationBlocks.map(block => <BlockItem key={block.id} block={block} />)}
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  )
}
