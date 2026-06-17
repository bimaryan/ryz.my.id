import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Link2, BarChart3, Shield, Menu, X, Plus, Search, HelpCircle, Globe, Webhook, Users, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import CreateLinkModal from '@/components/CreateLinkModal'

export default function DashboardLayout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Links', path: '/dashboard/links', icon: Link2 },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Custom Domains', path: '/dashboard/domains', icon: Globe },
    { name: 'Webhooks', path: '/dashboard/webhooks', icon: Webhook },
    { name: 'API Keys', path: '/dashboard/api-keys', icon: Shield },
    { name: 'Teams', path: '/dashboard/teams', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#0b1021] p-4 text-white z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#ebf3ff] text-[#0b5cff]">
            <Link2 className="h-4 w-4 font-bold" />
          </div>
          <span className="text-xl font-black tracking-tight">RYZ<span className="font-light text-slate-400">Link</span></span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-[260px] bg-[#0b1021] text-white flex-shrink-0 z-40 fixed md:sticky top-14 md:top-0 h-[calc(100vh-56px)] md:h-screen overflow-y-auto transition-all
      `}>
        <div className="hidden md:flex h-16 items-center px-6 mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ebf3ff] text-[#0b5cff]">
              <Link2 className="h-5 w-5 font-bold" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              RYZ<span className="font-light text-slate-400">Link</span>
            </span>
          </Link>
        </div>

        <div className="py-2 px-4 space-y-1 flex-1">
          <div className="mb-4 px-2 hidden md:block">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dashboard</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            // For Bitly clone: active if paths match exactly or starts with
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors relative font-semibold text-sm ${
                  isActive
                    ? 'bg-[#1c2237] text-white'
                    : 'text-slate-400 hover:bg-[#1c2237] hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0b5cff] rounded-r-full"></div>
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#0b5cff]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#1c2237] mt-auto">
          <Link to="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-2 py-2 mb-3 cursor-pointer hover:bg-[#1c2237] rounded transition-colors group">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase group-hover:bg-[#0b5cff] transition-colors">
              {user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate group-hover:text-slate-300">Settings & Profile</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-[#1c2237] transition-colors font-semibold text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search links, tags, or campaigns..." className="bitly-input pl-10 h-10 bg-slate-50 border-transparent focus:bg-white" />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button className="text-slate-400 hover:text-slate-600 hidden sm:block p-2">
              <HelpCircle className="h-5 w-5" />
            </button>
            <Button size="md" onClick={() => setIsCreateModalOpen(true)} className="bitly-button-primary">
              <Plus className="h-4 w-4 mr-1.5" /> Create new
            </Button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>

      <CreateLinkModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  )
}
