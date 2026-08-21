import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Link2, BarChart3, Shield, Menu, X, Plus, Search,
  Webhook, Users, LogOut, LayoutTemplate, Settings, User, ShoppingCart,
  AlertTriangle, FileText, MessageSquare, ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import CreateLinkModal from "@/components/CreateLinkModal";
import LoadingSpinner from "@/components/LoadingSpinner";

const NAV = [
  { label: "Dashboard",  path: "/dashboard",           icon: LayoutDashboard },
  { label: "Links",      path: "/dashboard/links",      icon: Link2 },
  { label: "Analytics",  path: "/dashboard/analytics",  icon: BarChart3 },
  { label: "Orders",     path: "/dashboard/orders",     icon: ShoppingCart },
  { label: "Forms",      path: "/dashboard/forms",      icon: FileText },
  { label: "Pages",      path: "/dashboard/pages",      icon: LayoutTemplate },
  { label: "WhatsApp",   path: "/dashboard/whatsapp",   icon: MessageSquare },
  { label: "Webhooks",   path: "/dashboard/webhooks",   icon: Webhook },
  { label: "API Keys",   path: "/dashboard/api-keys",   icon: Shield },
  { label: "Teams",      path: "/dashboard/teams",      icon: Users },
];
const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[6], NAV[4]];

const s = {
  sidebar: {
    width: 232,
    bg: "#ffffff",
    border: "1px solid #e8e8e8",
  },
};

export default function DashboardLayout({ children }) {
  const { user, isSessionLoading } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [expiredBanner, setExpiredBanner] = useState(false);
  const profileRef = useRef(null);
  const path = location.pathname;
  const q    = searchParams.get("q") || "";

  useEffect(() => { setExpiredBanner(!!user?.user_metadata?.subscription_expired_at); }, [user]);
  useEffect(() => { if (!isSessionLoading && !user) navigate("/login"); }, [isSessionLoading, user, navigate]);
  useEffect(() => { setMobileOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
  useEffect(() => {
    const fn = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isActive = (item) => path === item.path || (item.path !== "/dashboard" && path.startsWith(item.path));
  const signOut   = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };
  const dismissBanner = async () => {
    setExpiredBanner(false);
    await supabase.auth.updateUser({ data: { subscription_expired_at: null } });
  };
  const handleSearch = (e) => {
    const v = e.target.value;
    if (v) { setSearchParams({ q: v }); if (path !== "/dashboard") navigate(`/dashboard?q=${encodeURIComponent(v)}`); }
    else setSearchParams({});
  };

  const name    = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const initial = name[0]?.toUpperCase() || "U";
  const plan    = user?.user_metadata?.plan_type || "free";

  if (isSessionLoading) return (
    <div style={{ minHeight: "100vh", background: "#f7f7f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner text="Loading..." />
    </div>
  );
  if (!user) return null;

  /* ────────────────── Sidebar markup ────────────────── */
  function SidebarInner({ onClose }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>

        {/* Wordmark */}
        <div style={{ padding: "20px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "#0B5CFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 4px rgba(11,92,255,0.4)",
            }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: "#fff", letterSpacing: -1, fontFamily: "system-ui, sans-serif" }}>rz</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#111", letterSpacing: -0.4, lineHeight: 1 }}>RYZLink</div>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 500, marginTop: 3, letterSpacing: 0.3, textTransform: "capitalize" }}>{plan} plan</div>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", display: "flex", padding: 4, borderRadius: 6 }}>
              <X size={17} />
            </button>
          )}
        </div>

        {/* Create */}
        <div style={{ padding: "0 14px 16px" }}>
          <button
            onClick={() => { setCreateOpen(true); onClose?.(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "8px 0", borderRadius: 9, background: "#0B5CFF", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              letterSpacing: -0.2, boxShadow: "0 1px 6px rgba(11,92,255,0.35)",
              transition: "opacity 0.1s, transform 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Plus size={14} strokeWidth={2.5} /> Create new
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#ccc", textTransform: "uppercase", letterSpacing: 0.8, padding: "0 8px 6px" }}>
            Menu
          </div>
          {NAV.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "7px 10px", borderRadius: 7, marginBottom: 1,
                  textDecoration: "none", fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#0B5CFF" : "#555",
                  background: active ? "rgba(11,92,255,0.07)" : "transparent",
                  borderLeft: `2px solid ${active ? "#0B5CFF" : "transparent"}`,
                  transition: "all 0.1s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f6f6f7"; e.currentTarget.style.color = "#111"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; } }}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings + user */}
        <div style={{ padding: "10px 8px 14px", borderTop: "1px solid #f2f2f2" }}>
          <Link
            to="/dashboard/settings"
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 9, padding: "7px 10px",
              borderRadius: 7, marginBottom: 6, textDecoration: "none", fontSize: 13,
              fontWeight: path === "/dashboard/settings" ? 600 : 500,
              color: path === "/dashboard/settings" ? "#0B5CFF" : "#555",
              background: path === "/dashboard/settings" ? "rgba(11,92,255,0.07)" : "transparent",
              borderLeft: `2px solid ${path === "/dashboard/settings" ? "#0B5CFF" : "transparent"}`,
              transition: "all 0.1s",
            }}
            onMouseEnter={e => { if (path !== "/dashboard/settings") { e.currentTarget.style.background = "#f6f6f7"; e.currentTarget.style.color = "#111"; } }}
            onMouseLeave={e => { if (path !== "/dashboard/settings") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; } }}
          >
            <Settings size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            Settings
          </Link>

          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, background: "#f9f9f9", border: "1px solid #eee" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0B5CFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 10, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 4, borderRadius: 6, display: "flex", flexShrink: 0, transition: "color 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#e53e3e"}
              onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────── Render ────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f7f8", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', color: "#111" }}>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside style={{ position: "relative", width: 240, height: "100%", boxShadow: "2px 0 24px rgba(0,0,0,0.1)", animation: "ryzslidein 0.2s ease", zIndex: 1 }}>
            <SidebarInner onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside style={{ display: "none", flexDirection: "column", width: s.sidebar.width, flexShrink: 0, height: "100vh", position: "sticky", top: 0, background: s.sidebar.bg, borderRight: s.sidebar.border }} className="ryz-aside">
        <SidebarInner onClose={null} />
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>

        {/* Top bar */}
        <header style={{
          height: 50, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center",
          padding: "0 18px", position: "sticky", top: 0, zIndex: 30, gap: 12,
        }}>
          {/* Mobile: toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="ryz-hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "none", padding: 5, borderRadius: 7, flexShrink: 0 }}
          >
            <Menu size={20} />
          </button>

          {/* Mobile: wordmark */}
          <Link to="/" className="ryz-mobile-logo" style={{ display: "none", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 27, height: 27, borderRadius: 8, background: "#0B5CFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 12, color: "#fff", letterSpacing: -0.5 }}>rz</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#111", letterSpacing: -0.4 }}>RYZLink</span>
          </Link>

          {/* Search — desktop */}
          <div className="ryz-search" style={{ flex: 1, maxWidth: 380, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
            <input
              type="text"
              value={q}
              onChange={handleSearch}
              placeholder="Search links, domains, tags..."
              style={{
                width: "100%", padding: "6px 12px 6px 32px", border: "1.5px solid #e8e8e8",
                borderRadius: 8, fontSize: 13, color: "#111", outline: "none",
                background: "#f7f7f8", fontFamily: "inherit", transition: "all 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#0B5CFF"; e.target.style.boxShadow = "0 0 0 3px rgba(11,92,255,0.08)"; }}
              onBlur={e => { e.target.style.background = "#f7f7f8"; e.target.style.borderColor = "#e8e8e8"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Profile */}
          <div style={{ position: "relative", flexShrink: 0 }} ref={profileRef}>
            <button
              onClick={() => setProfileOpen(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 5px",
                background: profileOpen ? "#f4f4f5" : "transparent", border: "none", cursor: "pointer",
                borderRadius: 9, transition: "background 0.12s",
              }}
              onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = "#f4f4f5"; }}
              onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0B5CFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial}
              </div>
              <span className="ryz-uname" style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{name.split(" ")[0]}</span>
              <ChevronDown size={12} style={{ color: "#bbb", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {profileOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", width: 210,
                background: "#fff", border: "1px solid #e8e8e8", borderRadius: 11,
                boxShadow: "0 6px 24px rgba(0,0,0,0.1)", padding: "5px 0", zIndex: 50,
                animation: "ryzfadein 0.12s ease",
              }}>
                <div style={{ padding: "9px 14px 9px", borderBottom: "1px solid #f2f2f2" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: "4px 0" }}>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#444", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f7f7f8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <User size={14} style={{ flexShrink: 0 }} /> Profile & Settings
                  </Link>
                </div>
                <div style={{ borderTop: "1px solid #f2f2f2", padding: "4px 0" }}>
                  <button
                    onClick={() => { setProfileOpen(false); signOut(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#e53e3e", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={14} style={{ flexShrink: 0 }} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: "auto", padding: "22px 22px 100px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {expiredBanner && (
              <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 10, background: "#fff5f5", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <AlertTriangle size={15} style={{ color: "#e53e3e", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c53030" }}>Langganan Anda Telah Berakhir</div>
                    <div style={{ fontSize: 12, color: "#f56565", marginTop: 1 }}>Perbarui untuk memulihkan fitur Premium.</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link to="/dashboard/settings" style={{ padding: "5px 12px", background: "#e53e3e", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Perbarui</Link>
                  <button onClick={dismissBanner} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 3, display: "flex", borderRadius: 5 }}><X size={13} /></button>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="ryz-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(14px)", borderTop: "1px solid #ebebeb", display: "none", justifyContent: "space-around", padding: "8px 4px 10px", alignItems: "center" }}>
        {MOBILE_NAV.map(item => {
          const Icon   = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9, textDecoration: "none" }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#0B5CFF" : "transparent", transition: "all 0.12s" }}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? "#fff" : "#aaa" }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#0B5CFF" : "#aaa", letterSpacing: 0.2 }}>{item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMobileOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Menu size={17} strokeWidth={1.8} style={{ color: "#aaa" }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 500, color: "#aaa" }}>More</span>
        </button>
      </nav>

      <CreateLinkModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={() => window.location.reload()} />

      <style>{`
        @media (min-width: 768px) {
          .ryz-aside         { display: flex !important; }
          .ryz-search        { display: block !important; }
          .ryz-uname         { display: inline !important; }
        }
        @media (max-width: 767px) {
          .ryz-aside         { display: none !important; }
          .ryz-bottom-nav    { display: flex !important; }
          .ryz-search        { display: none !important; }
          .ryz-hamburger     { display: flex !important; }
          .ryz-mobile-logo   { display: flex !important; }
          .ryz-uname         { display: none !important; }
        }
        @keyframes ryzslidein { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes ryzfadein  { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
