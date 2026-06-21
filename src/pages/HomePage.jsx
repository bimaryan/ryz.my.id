import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, BarChart3, ArrowRight, QrCode, LayoutTemplate, Globe2, MessageSquare, Bot, Code, ClipboardList, Zap } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'

const AnimatedCounter = ({ value, suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = value / (duration / 16);
    
    if (value === 0) {
      setCount(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
};

export default function HomePage() {
  const { session } = useSession()
  const [stats, setStats] = useState({ links: 0, clicks: 0, messages: 0 })

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_global_stats')
        if (data && !error) {
          setStats({
            links: data.total_links || 0,
            clicks: data.total_clicks || 0,
            messages: 125430 // Mock stat for now since we don't have a global RPC for messages yet
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchGlobalStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-[#0b5cff]/20 overflow-hidden relative">
      <SEO />
      
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-400/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Navigation (Glassmorphism) */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="font-extrabold text-xl font-sans tracking-wide">R</span>
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                RYZ<span className="text-[#0b5cff]">Link</span>
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              {session ? (
                <Link to="/dashboard">
                  <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Masuk
                  </Link>
                  <Link to="/signup">
                    <button className="h-10 px-6 bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094bdd] hover:to-indigo-700 text-white font-bold rounded-full text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Daftar Gratis
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 sm:pt-48 sm:pb-32 px-4 z-10">
        <div className="relative mx-auto max-w-7xl text-center flex flex-col items-center">

          <h1 className="mx-auto max-w-5xl font-black text-5xl sm:text-6xl md:text-7xl lg:text-[80px] tracking-tighter text-slate-900 mb-8 leading-[1.05] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Platform All-in-One untuk <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b5cff] via-indigo-500 to-purple-600">
              Otomatisasi & Koneksi.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Bangun merek Anda, otomatisasi pesan WhatsApp, kumpulkan data lewat Form interaktif, dan lacak analitik audiens Anda secara real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to={session ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 flex items-center justify-center group transform hover:-translate-y-1">
                Mulai gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/docs" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-8 bg-white/80 backdrop-blur-md hover:bg-white text-slate-800 border border-slate-200 font-bold text-lg rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                Baca Dokumentasi API
              </button>
            </Link>
          </div>

          {/* Abstract Mockup / Floating Cards */}
          <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fafbfc] z-10 pointer-events-none"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600"><MessageSquare className="w-6 h-6" /></div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-4/5 bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl transform translate-y-8 hover:translate-y-4 transition-transform duration-500 z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-slate-800">Analitik</div>
                  <div className="text-green-500 text-sm font-bold">+24%</div>
                </div>
                <div className="flex items-end gap-2 h-24">
                  <div className="flex-1 bg-indigo-100 rounded-t-md h-1/3"></div>
                  <div className="flex-1 bg-indigo-200 rounded-t-md h-1/2"></div>
                  <div className="flex-1 bg-indigo-300 rounded-t-md h-3/4"></div>
                  <div className="flex-1 bg-[#0b5cff] rounded-t-md h-full"></div>
                  <div className="flex-1 bg-indigo-400 rounded-t-md h-4/5"></div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600"><ClipboardList className="w-6 h-6" /></div>
                  <div>
                    <div className="h-4 w-20 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-28 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-2">
                   <div className="h-8 w-full bg-white border border-slate-200 rounded-md"></div>
                   <div className="h-8 w-full bg-[#0b5cff] rounded-md"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Social Proof */}
      <section className="py-10 border-y border-slate-200/50 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">
                {stats.links > 0 ? <AnimatedCounter value={stats.links} /> : "0"}
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tautan Dibuat</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">
                <AnimatedCounter value={stats.messages} />+
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pesan WA Terkirim</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">
                <AnimatedCounter value={99.9} decimals={1} suffix="%" />
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">SLA Waktu Aktif</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">24/7</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dukungan API</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 sm:py-32 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Lebih dari sekadar pemendek tautan.</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">Platform lengkap untuk meningkatkan konversi dan melayani pelanggan dengan efisien.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[340px]">
            {/* Bento 1: WhatsApp API (Large/Hero) */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-[32px] p-8 sm:p-12 border border-green-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group flex flex-col">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">WhatsApp Gateway API</h3>
                <p className="text-lg text-slate-700 font-medium leading-relaxed mb-6">
                  Ubah nomor Anda menjadi mesin otomatis. Mendukung Auto-Responder, pengiriman OTP, integrasi Webhook, Broadcast, dan REST API penuh untuk *developer*.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/60 text-green-700 text-sm font-bold rounded-full">Auto-Reply</span>
                  <span className="px-3 py-1 bg-white/60 text-green-700 text-sm font-bold rounded-full">Broadcast</span>
                  <span className="px-3 py-1 bg-white/60 text-green-700 text-sm font-bold rounded-full">REST API</span>
                </div>
              </div>
              {/* Decorative Visual */}
              <div className="absolute right-[-5%] bottom-[-5%] w-[60%] h-[60%] bg-white rounded-tl-3xl shadow-2xl p-6 opacity-90 group-hover:opacity-100 transition-opacity border border-green-100 flex flex-col gap-3">
                 <div className="bg-green-100 text-green-800 p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl self-start max-w-[80%] text-sm font-medium shadow-sm">
                   "Ketik INFO untuk harga promo bulan ini."
                 </div>
                 <div className="bg-slate-100 text-slate-800 p-3 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl self-end max-w-[80%] text-sm font-medium shadow-sm">
                   INFO
                 </div>
                 <div className="bg-green-100 text-green-800 p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl self-start max-w-[80%] text-sm font-medium shadow-sm flex items-center gap-2">
                   <Zap className="w-4 h-4 text-orange-500" />
                   Promo bulan ini diskon 50%! 🎉
                 </div>
              </div>
            </div>

            {/* Bento 2: Form Builder (Medium) */}
            <div className="md:col-span-2 bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden flex flex-col group">
              <div className="relative z-10 w-full flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Form Builder Interaktif</h3>
                  <p className="text-slate-600 font-medium">Buat formulir kustom (drag & drop) untuk mengumpulkan data prospek, dan otomatis terima notifikasi di WhatsApp Anda.</p>
                </div>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-[50%] h-[70%] bg-orange-50 rounded-tl-3xl border-t border-l border-orange-100 p-6 flex flex-col gap-3">
                 <div className="w-full h-8 bg-white rounded border border-orange-200"></div>
                 <div className="w-full h-8 bg-white rounded border border-orange-200"></div>
                 <div className="w-1/2 h-8 bg-orange-500 rounded"></div>
              </div>
            </div>

            {/* Bento 3: Analytics (Small) */}
            <div className="md:col-span-1 bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Analitik Akurat</h3>
                <p className="text-slate-600 font-medium text-sm">Lacak setiap interaksi, perangkat, lokasi, dan konversi.</p>
                <div className="mt-auto flex items-end gap-1 h-16 w-full opacity-60">
                  <div className="flex-1 bg-indigo-200 rounded-t-sm h-1/3"></div>
                  <div className="flex-1 bg-indigo-300 rounded-t-sm h-1/2"></div>
                  <div className="flex-1 bg-indigo-400 rounded-t-sm h-3/4"></div>
                  <div className="flex-1 bg-[#0b5cff] rounded-t-sm h-full"></div>
                </div>
              </div>
            </div>

            {/* Bento 4: Code/Developer (Small) */}
            <div className="md:col-span-1 bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-2">API First</h3>
                <p className="text-slate-400 font-medium text-sm mb-4">Integrasikan WhatsApp dan Form ke sistem backend Anda sendiri.</p>
                <div className="mt-auto w-full p-3 bg-black/50 rounded-lg text-xs font-mono text-green-400 border border-slate-700">
                  POST /api/wa/send<br/>
                  <span className="text-cyan-300">"message"</span>: <span className="text-orange-300">"Hi"</span>
                </div>
              </div>
            </div>

            {/* Bento 5: Links & QR (Medium/Wide) */}
            <div className="md:col-span-2 bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden flex justify-between items-center group">
              <div className="relative z-10 max-w-[60%]">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Tautan & Link-in-Bio</h3>
                <p className="text-slate-600 font-medium">Ubah URL panjang jadi cantik. Buat Bio Link khusus untuk profil Anda.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                 <QrCode className="w-16 h-16 text-pink-500" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0b5cff] via-indigo-600 to-purple-700 rounded-[40px] p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3)_0%,transparent_70%)] pointer-events-none"></div>
            
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight relative z-10">Siap untuk otomatisasi bisnis Anda?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium relative z-10">
              Bergabunglah dengan ribuan kreator dan bisnis yang telah menggunakan RYZLink. Penyiapan kurang dari satu menit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/signup">
                <button className="h-14 px-8 bg-white text-indigo-600 hover:bg-indigo-50 font-black text-lg rounded-full shadow-lg transition-transform transform hover:-translate-y-1 w-full sm:w-auto">
                  Buat akun gratis Anda
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
              <span className="font-extrabold text-sm font-sans tracking-wide">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              RYZ<span className="text-[#0b5cff]">Link</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Ketentuan</Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privasi</Link>
            <span>© 2026 RYZ. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Background Blob Animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
