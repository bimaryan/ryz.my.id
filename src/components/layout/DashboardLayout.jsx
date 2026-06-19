import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Shield,
  Menu,
  X,
  Plus,
  Search,
  Globe,
  Webhook,
  Users,
  LogOut,
  LayoutTemplate,
  Settings,
  User,
  ShoppingCart,
  AlertTriangle,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import CreateLinkModal from "@/components/CreateLinkModal";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [showExpiredBanner, setShowExpiredBanner] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.subscription_expired_at) {
      setShowExpiredBanner(true);
    } else {
      setShowExpiredBanner(false);
    }
  }, [user]);

  const dismissExpiredBanner = async () => {
    setShowExpiredBanner(false);
    await supabase.auth.updateUser({
      data: {
        subscription_expired_at: null
      }
    });
  };

  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
      if (currentPath !== "/dashboard") {
        navigate(`/dashboard?q=${encodeURIComponent(value)}`);
      }
    } else {
      setSearchParams({});
    }
  };

  // Otomatis menutup menu mobile saat rute (URL) berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Mengunci scroll body saat menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Links", path: "/dashboard/links", icon: Link2 },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { name: "Orders", path: "/dashboard/orders", icon: ShoppingCart },
    // { name: "Forms", path: "/dashboard/forms", icon: FileText },
    { name: "Pages", path: "/dashboard/pages", icon: LayoutTemplate },
    { name: "Webhooks", path: "/dashboard/webhooks", icon: Webhook },
    { name: "API Keys", path: "/dashboard/api-keys", icon: Shield },
    { name: "Teams", path: "/dashboard/teams", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#273144] font-sans flex">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] bg-white border border-[#e8ebf2]/50 flex flex-col shadow-2xl md:shadow-xl md:shadow-slate-200/50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl flex-shrink-0
        `}
      >
        {/* SIDEBAR LOGO SECTION */}
        <div className="flex h-16 items-center justify-between px-6 mb-2 border-b border-slate-100/50">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#0b5cff] to-[#094acc] text-white shadow-sm">
              <span className="font-extrabold text-lg font-sans tracking-wide">
                R
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight hidden md:block text-[#273144]">
              RYZLink
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-[#8290a3] hover:text-[#273144] hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 mb-4 mt-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Create new
          </Button>
        </div>

        <div className="py-2 px-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (item.path !== "/dashboard" && currentPath.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group
                  ${
                    isActive
                      ? "bg-blue-50/80 text-[#0b5cff] shadow-sm shadow-blue-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0b5cff] hover:translate-x-1"
                  }
                `}
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive
                      ? "text-[#0b5cff]"
                      : "text-[#8290a3] group-hover:text-[#0b5cff]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Top Navbar */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0 mt-0 md:mt-4 md:mr-4 md:rounded-2xl md:border md:shadow-sm">
          {/* MOBILE LOGO SECTION */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-2 text-[#5c6b81] hover:text-[#273144] hover:bg-[#f4f6fa] rounded-md transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#0b5cff] to-[#094acc] text-white shadow-sm">
                <span className="font-extrabold text-lg font-sans tracking-wide">
                  R
                </span>
              </div>
              <span className="font-bold text-lg tracking-tight text-[#273144]">
                RYZ
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative w-full max-w-md hidden md:block ml-4 lg:ml-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#8290a3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search links, domains, or tags..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-full text-sm transition-all outline-none"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button className="md:hidden p-2 text-[#8290a3] hover:text-[#273144] hover:bg-[#f4f6fa] rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#273144] to-[#4a5568] flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm cursor-pointer hover:ring-2 hover:ring-[#0b5cff]/50 transition-all overflow-hidden border-2 border-white"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/80 py-2 z-50 animate-fade-in-up origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      to="/dashboard/settings" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0b5cff] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile & Settings
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 py-2">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {showExpiredBanner && (
              <div className="mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-500/20 text-white animate-fade-in-up relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Langganan Anda Telah Berakhir</h3>
                    <p className="text-red-100 font-medium text-sm mt-0.5">Paket Premium Anda telah kedaluwarsa. Anda kini menggunakan paket Gratis. Perbarui untuk memulihkan fitur Premium.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link 
                    to="/dashboard/settings" 
                    className="flex-1 sm:flex-none text-center bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    Perbarui Sekarang
                  </Link>
                  <button 
                    onClick={dismissExpiredBanner}
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0"
                    title="Tutup Peringatan"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>

      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
