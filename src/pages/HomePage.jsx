import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Zap, BarChart3, Shield, ArrowRight, QrCode, LayoutTemplate, Globe2 } from 'lucide-react'
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
  const [stats, setStats] = useState({ links: 0, clicks: 0 })

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_global_stats')
        if (data && !error) {
          setStats({
            links: data.total_links || 0,
            clicks: data.total_clicks || 0
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchGlobalStats()

    // Realtime subscriptions are disabled because the WebSocket connection
    // to your Supabase instance (wss://supabase.ryaze.my.id) is failing.
    // This is typically due to Nginx/proxy missing WebSocket Upgrade headers.
    // The stats will just load once on mount.
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
            Platform utama untuk <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b5cff] via-indigo-500 to-purple-600">
              koneksi digital Anda.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Bangun merek Anda, lacak analitik, dan arahkan pengguna dengan mudah melalui penyingkat tautan yang super cepat, Kode QR, dan halaman Link-in-Bio.
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
                Baca Dokumentasi
              </button>
            </Link>
          </div>

          {/* Abstract Mockup / Floating Cards */}
          <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fafbfc] z-10 pointer-events-none"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600"><Link2 className="w-6 h-6" /></div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-4/5 bg-slate-100 rounded-full"></div>
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
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600"><QrCode className="w-6 h-6" /></div>
                  <div>
                    <div className="h-4 w-20 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-28 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-300" />
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
                {stats.clicks > 0 ? <AnimatedCounter value={stats.clicks} /> : "0"}
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Klik Terlacak</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">
                <AnimatedCounter value={99.9} decimals={1} suffix="%" />
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">SLA Waktu Aktif</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">24/7</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Akses API</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 sm:py-32 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Semua yang Anda butuhkan.</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">Satu platform terpadu untuk kreator dan bisnis modern.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
            {/* Bento 1: Analytics (Large) */}
            <div className="md:col-span-2 md:row-span-2 bg-white rounded-[32px] p-8 sm:p-12 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group flex flex-col">
              <div className="relative z-10 max-w-sm">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Analitik Mendalam</h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Lacak setiap klik dengan akurat. Lihat lokasi, perangkat, perujuk, dan sistem operasi di dasbor real-time yang memukau.
                </p>
              </div>
              {/* Decorative Visual */}
              <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[70%] bg-gradient-to-tr from-indigo-50 to-white border border-slate-100 rounded-tl-3xl shadow-2xl flex items-end justify-between p-6 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-[15%] bg-indigo-200 h-[30%] rounded-t-lg"></div>
                <div className="w-[15%] bg-indigo-300 h-[50%] rounded-t-lg"></div>
                <div className="w-[15%] bg-[#0b5cff] h-[80%] rounded-t-lg"></div>
                <div className="w-[15%] bg-indigo-400 h-[60%] rounded-t-lg"></div>
                <div className="w-[15%] bg-indigo-200 h-[40%] rounded-t-lg"></div>
              </div>
            </div>

            {/* Bento 2: Pages (Medium) */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden flex flex-col">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Halaman Link-in-Bio</h3>
                <p className="text-slate-600 font-medium">Buat halaman arahan yang memukau dan dapat disesuaikan untuk profil media sosial Anda.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-40 bg-pink-50 rounded-tl-3xl border-t border-l border-pink-100 p-4">
                <div className="w-10 h-10 rounded-full bg-pink-200 mx-auto mb-3"></div>
                <div className="w-full h-3 bg-white rounded-full mb-2"></div>
                <div className="w-full h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Bento 3: QR Codes (Medium) */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">QR Dinamis</h3>
                <p className="text-slate-600 font-medium mb-6">Buat kode QR yang dapat disesuaikan sepenuhnya, melacak pindaian, dan dapat diperbarui kapan saja.</p>
                <div className="w-16 h-16 mx-auto bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mt-auto">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Bento 4: Edge Network (Wide) */}
            <div className="md:col-span-3 bg-[#0f172a] rounded-[32px] p-8 sm:p-12 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              <div className="relative z-10 max-w-2xl">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-cyan-400 mb-6 border border-white/10">
                  <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Jaringan Edge Global</h3>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  Setiap tautan didistribusikan melalui CDN global. Baik pengguna Anda di Tokyo atau Jakarta, pengalihan terjadi dalam hitungan milidetik. Kecepatan adalah konversi.
                </p>
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
            
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight relative z-10">Siap untuk meningkatkan tautan Anda?</h2>
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
