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
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-[#e8ebf2] p-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f26d21] text-white">
            <span className="font-bold text-lg font-serif">b</span>
          </div>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-[#273144]">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-[260px] bg-white border-r border-[#e8ebf2] flex-shrink-0 z-40 fixed md:sticky top-[65px] md:top-0 h-[calc(100vh-65px)] md:h-screen overflow-y-auto transition-all
      `}>
        <div className="hidden md:flex h-16 items-center px-6 mb-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f26d21] text-white">
              <span className="font-bold text-lg font-serif leading-none mt-0.5">b</span>
            </div>
          </Link>
        </div>

        <div className="px-4 mb-4 mt-2">
          <Button onClick={() => setIsCreateModalOpen(true)} className="bitly-button-sidebar text-base py-3">
            Create new
          </Button>
        </div>

        <div className="py-2 px-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            // For Bitly clone: active if paths match exactly or starts with
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors font-bold text-sm ${
                  isActive
                    ? 'bg-[#ebf3ff] text-[#0b5cff]'
                    : 'text-[#273144] hover:bg-[#f4f6fa]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#0b5cff]' : 'text-[#8290a3]'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#e8ebf2] mt-auto">
          <Link to="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-2 py-2 mb-3 cursor-pointer hover:bg-[#f4f6fa] rounded transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#273144] flex items-center justify-center text-xs font-bold text-white uppercase group-hover:bg-[#0b5cff] transition-colors">
              {user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#273144] truncate">{user?.user_metadata?.full_name || 'Settings'}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded text-[#273144] hover:bg-[#f4f6fa] transition-colors font-bold text-sm"
          >
            <LogOut className="h-4 w-4 text-[#8290a3]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="h-16 bg-white border-b border-[#e8ebf2] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
          <div className="relative w-full max-w-md hidden md:block mx-auto ml-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8290a3]" />
            <input type="text" placeholder="Search..." className="bitly-input pl-10 h-10 bg-[#f4f6fa] border-transparent focus:bg-white" />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <Button size="md" className="bitly-button-upgrade text-sm px-5 py-2 hidden sm:flex">
              Upgrade
            </Button>
            <button className="text-[#273144] hover:text-black hidden sm:block p-2 rounded-full hover:bg-[#f4f6fa]">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#273144] flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.email?.[0] || 'U'}
            </div>
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
