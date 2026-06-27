import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Code, ClipboardList, BarChart3, LayoutTemplate, ShieldCheck, Zap, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'

const AnimatedCounter = ({ value, suffix ="", decimals = 0 }) => {
 const [count, setCount] = useState(0);
 
 useEffect(() => {
 let start = 0;
 const duration = 2000;
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

 return <>{Math.floor(count).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
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
 messages: 125430
 })
 }
 } catch (err) {
 console.error(err)
 }
 }

 fetchGlobalStats()
 }, [])

 return (
 <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary-100 overflow-hidden relative">
 <SEO />

 {/* Very Subtle Background Gradients */}
 <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-primary-50/50 via-white to-white pointer-events-none -z-10"></div>
 
 {/* Navigation */}
 <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-100">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex h-[72px] items-center justify-between">
 <Link to="/" className="flex items-center gap-2 group">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
 <span className="font-extrabold text-xl font-sans tracking-wide">R</span>
 </div>
 <span className="text-xl font-bold text-slate-800 tracking-tight">
 RYZ<span className="text-primary-600">Link</span>
 </span>
 </Link>
 <div className="flex items-center gap-3 sm:gap-4">
 {session ? (
 <Link to="/dashboard">
 <button className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full text-sm transition-all shadow-sm">
 Dashboard
 </button>
 </Link>
 ) : (
 <>
 <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
 Log in
 </Link>
 <Link to="/signup">
 <button className="h-10 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full text-sm transition-all shadow-sm hover:shadow-md transform">
 Get Started
 </button>
 </Link>
 </>
 )}
 </div>
 </div>
 </div>
 </nav>

 {/* Hero Section (Split Screen) */}
 <main className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 z-10">
 <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
 
 {/* Left Text */}
 <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-6">
 <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
 <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">RYZLINK</span>
 </div>
 
 <h1 className="font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter text-slate-900 mb-6 leading-[1.1]">
 The smart way to <br className="hidden sm:block" />
 <span className="text-primary-600">automate work.</span>
 </h1>
 
 <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed font-medium">
 One clean platform to shorten links, automate WhatsApp messaging, collect data with forms, and track your audience.
 </p>
 
 <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
 <Link to={session ?"/dashboard" :"/signup"} className="w-full sm:w-auto">
 <button className="w-full sm:w-auto h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform">
 Start for free
 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
 </button>
 </Link>
 <Link to="/docs" className="w-full sm:w-auto flex items-center justify-center gap-1 text-slate-500 hover:text-slate-900 font-medium transition-colors h-14 px-4">
 View Documentation <ChevronRight size={18} />
 </Link>
 </div>
 </div>

 {/* Right Visual Mockup */}
 <div className="flex-1 w-full max-w-2xl lg:max-w-none relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
 <div className="relative rounded-2xl sm:rounded-[32px] bg-white border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-4 sm:p-6 overflow-hidden">
 {/* Fake Browser/App Header */}
 <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
 </div>
 
 {/* App Content Mockup */}
 <div className="flex gap-6">
 {/* Sidebar mock */}
 <div className="hidden sm:flex flex-col gap-3 w-1/4 border-r border-slate-100 pr-4">
 <div className="h-8 w-full bg-slate-50 rounded-md"></div>
 <div className="h-8 w-full bg-primary-50 rounded-md border-l-2 border-primary-500"></div>
 <div className="h-8 w-full bg-slate-50 rounded-md"></div>
 <div className="h-8 w-full bg-slate-50 rounded-md"></div>
 </div>
 {/* Main content mock */}
 <div className="flex-1 space-y-4">
 <div className="h-6 w-1/3 bg-slate-100 rounded-full mb-6"></div>
 <div className="grid grid-cols-2 gap-4">
 <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 p-4">
 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3"><BarChart3 size={16}/></div>
 <div className="h-3 w-16 bg-slate-200 rounded-full mb-2"></div>
 <div className="h-4 w-24 bg-slate-300 rounded-full"></div>
 </div>
 <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 p-4">
 <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3"><Bot size={16}/></div>
 <div className="h-3 w-16 bg-slate-200 rounded-full mb-2"></div>
 <div className="h-4 w-24 bg-slate-300 rounded-full"></div>
 </div>
 </div>
 <div className="h-40 bg-slate-50 rounded-xl border border-slate-100 flex items-end p-4 gap-2 mt-4">
 <div className="w-full h-[40%] bg-indigo-100 rounded-t-md"></div>
 <div className="w-full h-[60%] bg-indigo-200 rounded-t-md"></div>
 <div className="w-full h-[30%] bg-indigo-100 rounded-t-md"></div>
 <div className="w-full h-[80%] bg-indigo-300 rounded-t-md"></div>
 <div className="w-full h-[100%] bg-primary-500 rounded-t-md shadow-sm"></div>
 </div>
 </div>
 </div>
 </div>
 
 {/* Floating Element */}
 <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
 <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Bot size={20}/></div>
 <div>
 <div className="text-sm font-bold text-slate-800">Auto-reply active</div>
 <div className="text-xs text-slate-500 font-medium">WhatsApp gateway running</div>
 </div>
 </div>
 </div>

 </div>
 </main>

 {/* Social Proof (Minimalist Stats) */}
 <section className="py-12 border-y border-slate-100 bg-slate-50/50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200">
 <div>
 <div className="text-4xl font-black text-slate-900 mb-1">
 {stats.links > 0 ? <AnimatedCounter value={stats.links} /> :"0"}
 </div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Links Created</div>
 </div>
 <div>
 <div className="text-4xl font-black text-slate-900 mb-1">
 <AnimatedCounter value={stats.messages} />+
 </div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Messages Sent</div>
 </div>
 <div>
 <div className="text-4xl font-black text-slate-900 mb-1">
 <AnimatedCounter value={99.9} decimals={1} suffix="%" />
 </div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uptime SLA</div>
 </div>
 <div>
 <div className="text-4xl font-black text-slate-900 mb-1">24/7</div>
 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dev Support</div>
 </div>
 </div>
 </div>
 </section>

 {/* Features Section (Alternating Side-by-Side) */}
 <section className="py-24 sm:py-32 overflow-hidden">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32">
 
 <div className="text-center max-w-2xl mx-auto mb-10">
 <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Everything you need, cleanly organized.</h2>
 <p className="text-slate-500 text-lg font-medium">No more fragmented tools. We built the essential features into one cohesive, lightning-fast platform.</p>
 </div>

 {/* Feature 1: WhatsApp */}
 <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
 <div className="flex-1 lg:max-w-lg">
 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
 <Bot size={24} />
 </div>
 <h3 className="text-3xl font-bold text-slate-900 mb-4">WhatsApp Automation</h3>
 <p className="text-lg text-slate-500 mb-8 leading-relaxed">
 Turn your number into an automated machine. Easily set up auto-responders, send OTPs, or broadcast messages directly from our dashboard or via API.
 </p>
 <ul className="space-y-4">
 <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Keyword-based Auto-replies</li>
 <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Mass Broadcasts</li>
 <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Developer REST API</li>
 </ul>
 </div>
 <div className="flex-1 w-full relative">
 <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
 <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl rounded-bl-sm self-end max-w-[80%] text-sm font-medium">
 POST /api/v1/messages
 </div>
 <div className="bg-green-50 text-green-700 p-3 rounded-2xl rounded-br-sm self-start max-w-[80%] text-sm font-medium flex items-center gap-2">
 <ShieldCheck size={16}/> Message delivered instantly
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Feature 2: Form Builder */}
 <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
 <div className="flex-1 lg:max-w-lg">
 <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
 <ClipboardList size={24} />
 </div>
 <h3 className="text-3xl font-bold text-slate-900 mb-4">Interactive Forms</h3>
 <p className="text-lg text-slate-500 mb-8 leading-relaxed">
 Build beautiful custom forms to collect leads, feedback, or orders. Instantly trigger WhatsApp notifications to your phone whenever someone submits a form.
 </p>
 <Link to="/signup" className="text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
 Try the Form Builder <ArrowRight size={18}/>
 </Link>
 </div>
 <div className="flex-1 w-full relative">
 <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
 <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-200"></div>
 <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-200"></div>
 <div className="h-10 w-2/3 bg-orange-500 rounded-lg shadow-sm"></div>
 </div>
 </div>
 </div>
 </div>

 {/* Feature 3: Links & Analytics */}
 <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
 <div className="flex-1 lg:max-w-lg">
 <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
 <BarChart3 size={24} />
 </div>
 <h3 className="text-3xl font-bold text-slate-900 mb-4">Links & Deep Analytics</h3>
 <p className="text-lg text-slate-500 mb-8 leading-relaxed">
 Transform long URLs into powerful branded links or build custom Link-in-Bio pages. Track every click, device, and location in real-time.
 </p>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><LayoutTemplate size={18} className="text-indigo-500"/> Link-in-Bio</div>
 <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Code size={18} className="text-indigo-500"/> Developer API</div>
 </div>
 </div>
 <div className="flex-1 w-full relative">
 <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-48 flex items-end gap-2">
 <div className="flex-1 bg-indigo-100 rounded-t-lg h-[30%]"></div>
 <div className="flex-1 bg-indigo-200 rounded-t-lg h-[50%]"></div>
 <div className="flex-1 bg-indigo-300 rounded-t-lg h-[70%]"></div>
 <div className="flex-1 bg-indigo-500 rounded-t-lg shadow-sm h-[100%]"></div>
 </div>
 </div>
 </div>
 </div>

 </div>
 </section>

 {/* Minimal CTA Section */}
 <section className="py-24 bg-slate-50 border-t border-slate-100">
 <div className="max-w-4xl mx-auto text-center px-4">
 <h2 className="text-4xl font-black text-slate-900 mb-6">Ready to streamline your workflow?</h2>
 <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
 Join thousands of creators and businesses building on RYZ. Setup takes less than a minute.
 </p>
 <Link to="/signup">
 <button className="h-14 px-10 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all transform">
 Create your free account
 </button>
 </Link>
 </div>
 </section>

 {/* Footer */}
 <footer className="py-10 border-t border-slate-200 bg-white">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
 <span className="font-extrabold text-sm font-sans tracking-wide">R</span>
 </div>
 <span className="font-bold text-xl tracking-tight text-slate-800">
 RYZ<span className="text-primary-600">Link</span>
 </span>
 </div>
 <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
 <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
 <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
 <span>© 2026 RYZ. All rights reserved.</span>
 </div>
 </div>
 </footer>

 </div>
 )
}
