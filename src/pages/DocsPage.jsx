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
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans">
      <SEO title="API Documentation | RYZ Shortlink" />
      
      {/* Header */}
      <header className="bg-white border-b border-[#e8ebf2] py-4 px-6 sm:px-12 sticky top-0 z-30 shadow-sm">
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

      <main className="max-w-7xl mx-auto py-12 px-6 sm:px-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-28">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Getting Started</h3>
            <ul className="space-y-3 mb-8 border-l-2 border-[#e8ebf2] pl-3">
              <li><a href="#introduction" className="text-sm font-bold text-[#0b5cff]">Introduction</a></li>
              <li><a href="#authentication" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Authentication</a></li>
            </ul>

            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Core API</h3>
            <ul className="space-y-3 mb-8 border-l-2 border-[#e8ebf2] pl-3">
              <li><a href="#links" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Links</a></li>
              <li><a href="#analytics" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Analytics</a></li>
            </ul>

            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Advanced API</h3>
            <ul className="space-y-3 mb-8 border-l-2 border-[#e8ebf2] pl-3">
              <li><a href="#custom-domains" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Custom Domains</a></li>
              <li><a href="#webhooks" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Webhooks</a></li>
              <li><a href="#teams" className="text-sm font-medium text-slate-600 hover:text-[#0b5cff]">Teams & Sharing</a></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 max-w-4xl">
          
          {/* Introduction */}
          <section id="introduction" className="mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">REST API Documentation</h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Welcome to the complete RYZ Shortlink developer API documentation. Our RESTful API allows you to programmatically create short links, manage custom domains, retrieve detailed click analytics, and configure webhooks for real-time notifications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-[#e8ebf2] rounded-xl shadow-sm">
                <LinkIcon className="h-6 w-6 text-[#0b5cff] mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Links</h3>
                <p className="text-xs text-slate-500">Create & manage URLs</p>
              </div>
              <div className="p-5 bg-white border border-[#e8ebf2] rounded-xl shadow-sm">
                <BarChart3 className="h-6 w-6 text-[#0b5cff] mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Analytics</h3>
                <p className="text-xs text-slate-500">Track clicks & visitors</p>
              </div>
              <div className="p-5 bg-white border border-[#e8ebf2] rounded-xl shadow-sm">
                <Webhook className="h-6 w-6 text-[#0b5cff] mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Webhooks</h3>
                <p className="text-xs text-slate-500">Real-time events</p>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <Shield className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Authentication</h2>
            </div>
            <p className="text-slate-600 mb-4">
              All API requests must be authenticated using an API Key. You can generate multiple API keys in your <Link to="/dashboard/api-keys" className="text-[#0b5cff] font-bold hover:underline">Dashboard → API Keys</Link>. 
              Pass the API key in the `Authorization` header of your HTTP requests.
            </p>
            <div className="bg-[#273144] rounded-xl p-4 mb-6">
              <code className="text-sm text-blue-200 font-mono">
                Authorization: Bearer sk_live_your_api_key_here
              </code>
            </div>
          </section>

          {/* Links API */}
          <section id="links" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <LinkIcon className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Links</h2>
            </div>
            <p className="text-slate-600 mb-8">Endpoints for creating, reading, updating, and deleting your short links.</p>

            <EndpointBlock 
              method="POST"
              path="/api/v1/links"
              description="Create a new short link. You can specify a custom short code and domain, or let the system generate one automatically."
              requestBody={`{
  "original_url": "https://example.com/very-long-url-campaign",
  "short_code": "summer-promo", // Optional
  "domain": "ryz.my.id", // Optional
  "title": "Summer Promo 2026", // Optional
  "category": "Marketing" // Optional
}`}
              responseBody={`{
  "id": "uuid-1234",
  "short_code": "summer-promo",
  "original_url": "https://example.com/very-long-url-campaign",
  "domain": "ryz.my.id",
  "short_url": "https://ryz.my.id/summer-promo",
  "created_at": "2026-06-17T10:00:00Z"
}`}
            />

            <EndpointBlock 
              method="GET"
              path="/api/v1/links"
              description="Retrieve a paginated list of your short links."
              responseBody={`{
  "data": [
    {
      "id": "uuid-1234",
      "short_code": "summer-promo",
      "clicks_count": 142
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 1 }
}`}
            />

            <EndpointBlock 
              method="PATCH"
              path="/api/v1/links/:id"
              description="Update the destination URL or metadata of an existing link."
              requestBody={`{
  "original_url": "https://example.com/new-destination",
  "title": "Updated Summer Promo"
}`}
            />

            <EndpointBlock 
              method="DELETE"
              path="/api/v1/links/:id"
              description="Permanently delete a short link and its associated analytics."
            />
          </section>

          {/* Analytics API */}
          <section id="analytics" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <BarChart3 className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
            </div>
            
            <EndpointBlock 
              method="GET"
              path="/api/v1/analytics/link/:id"
              description="Get detailed analytics for a specific link, including device, referrer, and country data."
              responseBody={`{
  "total_clicks": 142,
  "unique_visitors": 130,
  "devices": [
    { "name": "Mobile", "value": 90 },
    { "name": "Desktop", "value": 52 }
  ],
  "countries": [
    { "name": "ID", "value": 100 },
    { "name": "US", "value": 42 }
  ]
}`}
            />
          </section>

          {/* Custom Domains API */}
          <section id="custom-domains" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <Globe className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Custom Domains</h2>
            </div>
            
            <EndpointBlock 
              method="POST"
              path="/api/v1/domains"
              description="Register a new custom domain. Requires DNS verification (CNAME pointing to cname.ryz.my.id)."
              requestBody={`{
  "domain": "promo.yourbrand.com"
}`}
            />
            
            <EndpointBlock 
              method="POST"
              path="/api/v1/domains/:id/verify"
              description="Trigger a manual DNS verification check for your domain."
              responseBody={`{
  "status": "verified",
  "message": "Domain successfully verified and secured with SSL."
}`}
            />
          </section>

          {/* Webhooks API */}
          <section id="webhooks" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <Webhook className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Webhooks</h2>
            </div>
            <p className="text-slate-600 mb-6">Receive real-time HTTP POST requests when events occur in your account.</p>

            <EndpointBlock 
              method="POST"
              path="/api/v1/webhooks"
              description="Register a new webhook endpoint."
              requestBody={`{
  "url": "https://your-server.com/webhook",
  "event_type": "link.clicked"
}`}
            />

            <h3 className="font-bold text-slate-900 mb-3 mt-8">Webhook Payload Structure</h3>
            <p className="text-sm text-slate-600 mb-3">When a <code>link.clicked</code> event occurs, your server will receive:</p>
            <div className="bg-[#273144] rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono">
{`{
  "event_id": "evt_12345",
  "type": "link.clicked",
  "created_at": "2026-06-17T12:00:00Z",
  "data": {
    "link_id": "uuid-1234",
    "short_code": "summer-promo",
    "click": {
      "ip_address": "192.168.1.1",
      "country_code": "ID",
      "device_type": "mobile",
      "referrer": "twitter.com",
      "user_agent": "Mozilla/5.0..."
    }
  }
}`}
              </pre>
            </div>
          </section>

          {/* Teams API */}
          <section id="teams" className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <Users className="h-6 w-6 text-[#0b5cff]" />
              <h2 className="text-2xl font-bold text-slate-900">Teams & Sharing</h2>
            </div>
            <EndpointBlock 
              method="POST"
              path="/api/v1/shares"
              description="Share access to a specific link with another registered user."
              requestBody={`{
  "link_id": "uuid-1234",
  "email": "colleague@company.com",
  "permission": "edit"
}`}
            />
          </section>

        </div>
      </main>
    </div>
  )
}
