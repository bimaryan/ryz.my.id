import { Link } from 'react-router-dom'
import { Link2, Zap, BarChart3, Shield, ArrowRight } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const { session } = useSession()

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-primary-500/30 overflow-hidden font-sans">
      
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-primary-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
                <Link2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                RYZ<span className="font-light text-primary-400">Link</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link to="/dashboard">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/10 border-none transition-all duration-300 hover:scale-105">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/25 border-none transition-all duration-300 hover:shadow-primary-500/40">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-20 sm:pt-32 sm:pb-24 lg:pb-32 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            RYZ Shortlink v2.0 is now live
          </div>
          
          <h1 className="mx-auto max-w-4xl font-extrabold text-5xl sm:text-7xl tracking-tight text-white mb-8 leading-[1.1]">
            Make Every Link <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 animate-gradient-x">
              Work Harder
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed">
            A premium, lightning-fast URL shortener designed to boost your click-through rates. Track, manage, and optimize your links with powerful analytics and beautiful QR codes.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={session ? "/dashboard" : "/signup"}>
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white border-none shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] hover:shadow-[0_0_60px_-15px_rgba(14,165,233,0.7)] transition-all duration-300 hover:-translate-y-1 group text-lg">
                Start Shortening for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 text-lg">
              View Documentation
            </Button>
          </div>
        </div>
      </main>

      {/* Feature Section with Glass Cards */}
      <section className="relative z-10 py-24 border-t border-white/5 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built for modern teams and creators who need more than just a redirect.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-2xl p-8 bg-slate-800/40 border border-white/5 hover:border-primary-500/30 hover:bg-slate-800/60 transition-all duration-500 backdrop-blur-md overflow-hidden hover:-translate-y-1 shadow-xl shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-primary-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-400 leading-relaxed">
                Global edge network ensures your links redirect in milliseconds, anywhere in the world. Speed matters for conversion.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-2xl p-8 bg-slate-800/40 border border-white/5 hover:border-accent-500/30 hover:bg-slate-800/60 transition-all duration-500 backdrop-blur-md overflow-hidden hover:-translate-y-1 shadow-xl shadow-black/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/20 text-accent-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-accent-500/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Deep Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Track clicks, geographic data, devices, and referrers in real-time. Understand your audience better.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-2xl p-8 bg-slate-800/40 border border-white/5 hover:border-success-500/30 hover:bg-slate-800/60 transition-all duration-500 backdrop-blur-md overflow-hidden hover:-translate-y-1 shadow-xl shadow-black/50 sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-500/20 text-success-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-success-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Reliable</h3>
              <p className="text-slate-400 leading-relaxed">
                Password protection, link expiration, and HTTPS on all custom domains. Your data is safe with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-slate-500 bg-slate-950/80 backdrop-blur-md">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Link2 className="h-5 w-5 text-slate-600" />
          <span className="font-semibold text-slate-400">RYZ Shortlink</span>
        </div>
        <p>© 2026 RYZ. All rights reserved.</p>
      </footer>
    </div>
  )
}

