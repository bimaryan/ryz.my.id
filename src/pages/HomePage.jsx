import { Link } from 'react-router-dom'
import { Link2, Zap, BarChart3, Shield, ArrowRight } from 'lucide-react'
import { useSession } from '@/hooks/useSession'

export default function HomePage() {
  const { session } = useSession()

  return (
    <div className="min-h-screen bg-white text-[#273144] font-sans selection:bg-[#0b5cff]/20">
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-[#e8ebf2] bg-white sticky top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0b5cff] text-white transition-transform duration-300">
                <span className="font-extrabold text-lg font-sans tracking-wide">R</span>
              </div>
              <span className="text-2xl font-bold text-[#273144] tracking-tight">
                RYZ<span className="text-[#0b5cff]">Link</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link to="/dashboard">
                  <button className="bitly-button-primary">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-[15px] font-semibold text-[#273144] hover:text-[#0b5cff] transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup">
                    <button className="bitly-button-primary">
                      Sign up Free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 px-4 bg-white overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-[#f4f6fa] rounded-full blur-[80px] opacity-70 pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="mx-auto max-w-4xl font-extrabold text-[48px] sm:text-[64px] tracking-tight text-[#273144] mb-6 leading-[1.1]">
            Build stronger digital <br className="hidden sm:block" />
            <span className="text-[#0b5cff]">connections</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-[20px] text-[#566b8f] mb-10 leading-relaxed font-medium">
            Use our URL shortener, QR Codes, and landing pages to engage your audience and connect them to the right information.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={session ? "/dashboard" : "/signup"}>
              <button className="w-full sm:w-auto h-14 px-8 bg-[#0b5cff] hover:bg-[#094bdd] text-white font-bold text-lg rounded-[4px] shadow-sm transition-all duration-200 flex items-center justify-center group">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/docs">
              <button className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-[#f4f6fa] text-[#0b5cff] border-2 border-[#0b5cff] font-bold text-lg rounded-[4px] transition-all duration-200">
                View API Docs
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="py-24 bg-[#f4f6fa] border-t border-[#e8ebf2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#273144] mb-4 tracking-tight">The RYZLink Connections Platform</h2>
            <p className="text-[#566b8f] text-[18px] max-w-2xl mx-auto font-medium">All the products you need to build brand connections, manage links and QR Codes, and connect with audiences everywhere.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group rounded-[8px] p-8 bg-white border border-[#e8ebf2] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f6fa] text-[#0b5cff] mb-6 group-hover:bg-[#0b5cff] group-hover:text-white transition-colors duration-300">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-[22px] font-bold text-[#273144] mb-3">Lightning Fast</h3>
              <p className="text-[#566b8f] leading-relaxed text-[16px] font-medium">
                Global edge network ensures your links redirect in milliseconds, anywhere in the world. Speed matters for conversion.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-[8px] p-8 bg-white border border-[#e8ebf2] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f6fa] text-[#0b5cff] mb-6 group-hover:bg-[#0b5cff] group-hover:text-white transition-colors duration-300">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-[22px] font-bold text-[#273144] mb-3">Deep Analytics</h3>
              <p className="text-[#566b8f] leading-relaxed text-[16px] font-medium">
                Track clicks, geographic data, devices, and referrers in real-time. Understand your audience better.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-[8px] p-8 bg-white border border-[#e8ebf2] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f6fa] text-[#0b5cff] mb-6 group-hover:bg-[#0b5cff] group-hover:text-white transition-colors duration-300">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-[22px] font-bold text-[#273144] mb-3">Secure & Reliable</h3>
              <p className="text-[#566b8f] leading-relaxed text-[16px] font-medium">
                Password protection, link expiration, and HTTPS on all custom domains. Your data is safe with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center bg-[#273144] text-white">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-[#273144]">
            <span className="font-extrabold text-sm font-sans tracking-wide">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            RYZ<span className="text-[#0b5cff]">Link</span>
          </span>
        </div>
        <p className="text-[#a4b1cd] text-sm">© 2026 RYZ. All rights reserved.</p>
      </footer>
    </div>
  )
}
