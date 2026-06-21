import React from 'react'
import SEO from '@/components/SEO'
import { Book, Code, Webhook, Globe, ArrowRight, Server, Shield, Link as LinkIcon, BarChart3, Users, Zap, Bot, MessageSquare, MousePointerClick } from 'lucide-react'
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
      <SEO title="Dokumentasi API | RYZLink" />
      
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

      <main className="flex-1 p-6 sm:p-12 relative z-10 animate-fade-in-up pb-32">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-6">
            Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0b5cff] to-indigo-500">API</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
            Dokumentasi lengkap untuk mengintegrasikan layanan RYZLink (Tautan pendek, Analitik, & WhatsApp Gateway) ke dalam sistem dan aplikasi Anda.
          </p>
          
          {/* Section 1: Auth */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300" id="auth">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Shield className="text-[#0b5cff] w-8 h-8"/> Autentikasi</h2>
             <p className="text-slate-600 mb-6 leading-relaxed">Setiap request ke REST API RYZLink wajib menyertakan API Key yang valid. Anda dapat membuat API Key di halaman Pengaturan Dashboard.</p>
             <div className="bg-slate-900 p-5 rounded-2xl shadow-inner overflow-x-auto">
               <code className="text-green-400 font-mono text-sm">Authorization: Bearer sk_live_xxxxxxxxxxx</code>
             </div>
          </div>

          {/* Section 2: WhatsApp API */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300" id="whatsapp-api">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Bot className="text-green-500 w-8 h-8"/> WhatsApp Gateway API</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">Kirim pesan WhatsApp otomatis (Notifikasi, OTP, Broadcast) dari sistem eksternal Anda menggunakan REST API kami.</p>
             
             <EndpointBlock 
               method="POST" 
               path="/api/whatsapp/v1/send-message" 
               description="Mengirim pesan teks langsung ke nomor tujuan yang diinginkan." 
               requestBody={`{\n  "session_id": "ID_SESI_WA_ANDA", // Opsional jika hanya punya 1 session\n  "to": "6281234567890",\n  "message": "Halo! Pesanan Anda dengan nomor #ORD-001 telah dikirim. Terima kasih!"\n}`}
               responseBody={`{\n  "success": true,\n  "data": {\n    "message_id": "msg_xyz123",\n    "status": "queued",\n    "recipient": "6281234567890"\n  }\n}`}
             />
             
             <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-slate-500"/> Pengiriman Media (Gambar, Video, Audio, Dokumen)</h3>
               <p className="text-sm text-slate-600 mb-5">Untuk mengirim file media, gunakan format <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-pink-600">multipart/form-data</code> dan lampirkan file Anda pada parameter <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-pink-600">media_file</code>.</p>
               <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto shadow-inner">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed">{`curl -X POST https://ryz.my.id/api/whatsapp/v1/send-message \\
  -H "Authorization: Bearer ryz_your_api_key" \\
  -F "session_id=ID_SESI_WA_ANDA" \\
  -F "to=6281234567890" \\
  -F "media_file=@/path/to/image.jpg"`}</pre>
               </div>
             </div>
          </div>

          {/* Section 3: WhatsApp Webhooks */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300" id="whatsapp-webhook">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Webhook className="text-purple-500 w-8 h-8"/> WhatsApp Webhook (Chatbot)</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">Webhook digunakan agar server Anda menerima notifikasi secara <strong>real-time</strong> setiap kali ada pesan masuk ke nomor WhatsApp Anda. Ini adalah fondasi utama untuk membangun Chatbot AI atau Customer Service Otomatis.</p>
             
             <div className="mb-8">
                <p className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3">Payload Pesan Masuk (Dikirim RYZLink ke URL Webhook Anda)</p>
                <div className="bg-slate-900 p-5 rounded-2xl shadow-inner overflow-x-auto">
<pre className="text-sm text-slate-300 font-mono leading-relaxed">{`{
  "event": "message.received",
  "session_id": "ID_SESI_WA_ANDA",
  "timestamp": "2026-06-21T10:00:00Z",
  "data": {
    "message_id": "wamsg_12345",
    "sender_number": "6281234567890",
    "sender_name": "Budi Santoso",
    "message_type": "text",
    "text": "Halo min, mau tanya info promo dong?",
    "is_group": false
  }
}`}</pre>
                </div>
             </div>
          </div>

          {/* Section 4: Shortlink API */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300" id="shortlink-api">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><LinkIcon className="text-blue-500 w-8 h-8"/> Shortlink API</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">Buat tautan pendek (shortlink) secara otomatis dari aplikasi Anda. Sangat berguna untuk menyingkat URL sebelum dikirim via WhatsApp atau SMS agar lebih rapi.</p>
             
             <EndpointBlock 
               method="POST" 
               path="/api/v1/links" 
               description="Membuat tautan pendek baru ke dalam akun Anda." 
               requestBody={`{\n  "original_url": "https://website-anda.com/promo/ramadhan-2026?utm_source=wa",\n  "short_code": "promo-ramadhan", // Opsional (Dulu disebut custom_slug)\n  "title": "Promo Ramadhan", // Opsional\n  "category": "promo" // Opsional\n}`}
               responseBody={`{\n  "success": true,\n  "data": {\n    "id": "lnk_abc123",\n    "original_url": "https://website-anda.com/promo/ramadhan-2026?utm_source=wa",\n    "short_code": "promo-ramadhan",\n    "short_url": "https://ryz.my.id/promo-ramadhan",\n    "created_at": "2026-06-21T10:00:00Z"\n  }\n}`}
             />
          </div>

          {/* Section 5: Shortlink Webhooks */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm transition-transform hover:scale-[1.01] duration-300" id="shortlink-webhook">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><MousePointerClick className="text-orange-500 w-8 h-8"/> Shortlink Webhook (Event Klik)</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">Dapatkan notifikasi <strong>real-time</strong> ke server Anda setiap kali tautan Anda diklik. Sangat berguna untuk memicu *event* lanjutan atau *tracking* kustom.</p>
             
             <div className="mb-8">
                <p className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3">Payload Klik Tautan (Dikirim RYZLink ke URL Webhook Anda)</p>
                <div className="bg-slate-900 p-5 rounded-2xl shadow-inner overflow-x-auto">
<pre className="text-sm text-slate-300 font-mono leading-relaxed">{`{
  "event": "link.clicked",
  "link_id": "lnk_abc123",
  "timestamp": "2026-06-21T10:05:30Z",
  "data": {
    "short_code": "promo-ramadhan",
    "ip_address": "114.122.x.x",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0...)",
    "country": "Indonesia",
    "city": "Jakarta",
    "device_type": "mobile",
    "browser": "Safari",
    "referrer": "instagram.com"
  }
}`}</pre>
                </div>
             </div>
             
             <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-sm text-orange-800">
               <strong className="block mb-2 text-orange-900">💡 Tips Penggunaan Super Canggih:</strong>
               Gabungkan Webhook Shortlink dengan WhatsApp API! Misalnya: Ketika pelanggan mengklik link penagihan <code>ryz.my.id/inv-123</code>, server Anda menerima notifikasi klik (webhook), dan seketika itu juga Anda bisa menggunakan API WhatsApp untuk mengirim pesan *"Terima kasih sudah membuka invoice, silakan balas pesan ini jika ada kendala pembayaran"*. 
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}
