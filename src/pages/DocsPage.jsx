import React from 'react'
import SEO from '@/components/SEO'
import { Book, Code, Webhook, Globe, ArrowRight, Server, Shield, Link as LinkIcon, BarChart3, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DocsPage() {
  const EndpointBlock = ({ method, path, description, requestBody, responseBody }) => (
    <div className="mb-10 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide
          ${method === 'POST' ? 'bg-green-100 text-green-700' : 
            method === 'GET' ? 'bg-blue-100 text-blue-700' : 
            method === 'PATCH' ? 'bg-amber-100 text-amber-700' : 
            'bg-red-100 text-red-700'}`}>
          {method}
        </span>
        <code className="font-mono text-sm font-bold text-slate-800">{path}</code>
      </div>
      <div className="p-5">
        <p className="text-slate-600 mb-4 text-sm font-medium">{description}</p>
        
        {requestBody && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Request Body</p>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
              <pre className="text-sm text-slate-300 font-mono">{requestBody}</pre>
            </div>
          </div>
        )}
        
        {responseBody && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Response</p>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
              <pre className="text-sm text-green-300 font-mono">{responseBody}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-hidden selection:bg-[#0b5cff]/20">
      <SEO title="Dokumentasi API | RYZ Shortlink" />
      
      {/* Decorative bg */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-4 px-6 sm:px-12 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="font-extrabold text-xl font-sans tracking-wide">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              RYZ<span className="text-[#0b5cff]">Link</span> Docs
            </span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Masuk</Link>
            <Link to="/dashboard" className="text-sm font-bold bg-gradient-to-r from-[#0b5cff] to-indigo-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 animate-fade-in-up">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-slate-200/60 mb-8 relative">
            <Code className="h-10 w-10 text-[#0b5cff]" />
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-md animate-pulse">
              SEGERA
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-6">
            API Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b5cff] to-indigo-500">Segera Hadir</span>
          </h1>
          
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed max-w-xl mx-auto">
            Kami sedang bekerja keras membangun REST API yang tangguh, aman, dan super cepat untuk RYZLink. Anda akan segera dapat mengintegrasikan manajemen tautan dan analitik kami langsung ke aplikasi Anda.
          </p>
          
          <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] shadow-xl border border-slate-200/60 max-w-lg mx-auto text-left transition-transform hover:scale-[1.02] duration-300">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-amber-500" />
              Yang akan datang:
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <LinkIcon className="h-5 w-5 text-[#0b5cff]" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Endpoint Manajemen Tautan</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Buat, perbarui, dan hapus tautan pendek secara terprogram.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Analitik Lanjutan</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Ambil statistik mendetail, perujuk, dan data perangkat.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                  <Webhook className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Webhook Real-time</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Dapatkan notifikasi instan saat tautan Anda diklik.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="mt-12">
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 gap-2 group">
              <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
