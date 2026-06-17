import React from 'react'
import SEO from '@/components/SEO'
import { Book, Code, Webhook, Globe, ArrowRight, Server, Shield, Link as LinkIcon, BarChart3, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DocsPage() {
  const EndpointBlock = ({ method, path, description, requestBody, responseBody }) => (
    <div className="mb-10 border border-[#e8ebf2] rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b border-[#e8ebf2] bg-slate-50/50">
        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide
          ${method === 'POST' ? 'bg-green-100 text-green-700' : 
            method === 'GET' ? 'bg-blue-100 text-blue-700' : 
            method === 'PATCH' ? 'bg-amber-100 text-amber-700' : 
            'bg-red-100 text-red-700'}`}>
          {method}
        </span>
        <code className="font-mono text-sm font-bold text-slate-800">{path}</code>
      </div>
      <div className="p-5">
        <p className="text-slate-600 mb-4 text-sm">{description}</p>
        
        {requestBody && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Request Body</p>
            <div className="bg-[#273144] rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono">{requestBody}</pre>
            </div>
          </div>
        )}
        
        {responseBody && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Response</p>
            <div className="bg-[#273144] rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-300 font-mono">{responseBody}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex flex-col">
      <SEO title="API Documentation | RYZ Shortlink" />
      
      {/* Header */}
      <header className="bg-white border-b border-[#e8ebf2] py-4 px-6 sm:px-12 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f26d21] text-white">
              <span className="font-extrabold text-lg font-sans tracking-wide">R</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">RYZ Docs</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Sign In</Link>
            <Link to="/dashboard" className="text-sm font-bold bg-[#0b5cff] text-white px-4 py-2 rounded-full hover:bg-[#094bdd] transition-colors shadow-sm">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#0b5cff]/10 to-[#f26d21]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-2xl w-full text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl border border-slate-100 mb-8 relative">
            <Code className="h-10 w-10 text-[#0b5cff]" />
            <div className="absolute -top-2 -right-2 bg-[#f26d21] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-md animate-pulse">
              WIP
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Developer API is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b5cff] to-[#f26d21]">Coming Soon</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto">
            We are working hard to build a powerful, secure, and blazing-fast REST API for RYZ Shortlink. You will soon be able to integrate our link management and analytics directly into your own applications.
          </p>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e8ebf2] max-w-lg mx-auto text-left">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#f26d21]" />
              What to expect:
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <LinkIcon className="h-3.5 w-3.5 text-[#0b5cff]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Link Management endpoints</p>
                  <p className="text-xs text-slate-500 mt-0.5">Create, update, and delete short links programmatically.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="h-3.5 w-3.5 text-[#0b5cff]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Advanced Analytics</p>
                  <p className="text-xs text-slate-500 mt-0.5">Fetch detailed stats, referrers, and device data.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Webhook className="h-3.5 w-3.5 text-[#0b5cff]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Real-time Webhooks</p>
                  <p className="text-xs text-slate-500 mt-0.5">Get notified instantly when your links get clicked.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="mt-12">
            <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg gap-2 group">
              <ArrowRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
