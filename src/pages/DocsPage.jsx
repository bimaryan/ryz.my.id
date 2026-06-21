import React from 'react'
import SEO from '@/components/SEO'
import { Book, Code, Webhook, Globe, ArrowRight, Server, Shield, Link as LinkIcon, BarChart3, Users, Zap, Bot, MessageSquare } from 'lucide-react'
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
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Shield className="text-[#0b5cff] w-8 h-8"/> Autentikasi</h2>
             <p className="text-slate-600 mb-6 leading-relaxed">Setiap request ke REST API RYZLink wajib menyertakan API Key yang valid. Anda dapat membuat API Key di halaman Pengaturan Dashboard.</p>
             <div className="bg-slate-900 p-5 rounded-2xl shadow-inner overflow-x-auto">
               <code className="text-green-400 font-mono text-sm">Authorization: Bearer sk_live_xxxxxxxxxxx</code>
             </div>
          </div>

          {/* Section 2: WhatsApp API */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm mb-10 transition-transform hover:scale-[1.01] duration-300">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Bot className="text-green-500 w-8 h-8"/> WhatsApp Gateway API</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">Kirim pesan WhatsApp otomatis (Notifikasi, OTP, Broadcast) dari sistem eksternal Anda menggunakan REST API kami.</p>
             
             <EndpointBlock 
               method="POST" 
               path="/api/v1/whatsapp/send" 
               description="Mengirim pesan teks langsung ke nomor tujuan yang diinginkan." 
               requestBody={`{\n  "session_id": "ID_SESI_WA_ANDA",\n  "recipient": "6281234567890",\n  "message_type": "text",\n  "message_content": "Halo! Pesanan Anda dengan nomor #ORD-001 telah dikirim. Terima kasih!"\n}`}
               responseBody={`{\n  "success": true,\n  "data": {\n    "message_id": "msg_xyz123",\n    "status": "queued",\n    "recipient": "6281234567890"\n  }\n}`}
             />
             
             <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-slate-500"/> Pengiriman Media (Gambar, Video, Audio, Dokumen)</h3>
               <p className="text-sm text-slate-600 mb-5">Untuk mengirim file media, gunakan format <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-pink-600">multipart/form-data</code> dan lampirkan file Anda pada parameter <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-pink-600">media_file</code>.</p>
               <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto shadow-inner">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed">{`curl -X POST https://ryz.my.id/api/v1/whatsapp/send \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -F "session_id=ID_SESI_WA_ANDA" \\
  -F "recipient=6281234567890" \\
  -F "message_type=image" \\
  -F "message_content=Ini adalah bukti pembayaran Anda" \\
  -F "media_file=@/path/to/image.jpg"`}</pre>
               </div>
             </div>
          </div>

          {/* Section 3: Webhooks & Chatbot */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm transition-transform hover:scale-[1.01] duration-300">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Webhook className="text-purple-500 w-8 h-8"/> Webhook & Integrasi Chatbot</h2>
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

             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Bot className="w-24 h-24 text-indigo-500"/></div>
               <h3 className="font-black text-indigo-900 mb-4 flex items-center gap-2 text-lg relative z-10"><Code className="w-5 h-5 text-indigo-600"/> Contoh Alur Pembuatan Chatbot AI</h3>
               <ol className="list-decimal list-inside text-sm text-indigo-800 space-y-3 font-medium relative z-10">
                 <li>Pelanggan mengirim pesan WA ke nomor bisnis Anda.</li>
                 <li>RYZLink langsung meneruskan pesan tersebut (via metode POST) ke <strong>URL Webhook</strong> Server Anda.</li>
                 <li>Server Anda membaca isi pesan, memproses *logic* internal, atau meneruskannya ke API ChatGPT/Gemini untuk mendapatkan respon yang relevan.</li>
                 <li>Setelah meracik balasan, Server Anda menembak balik <strong>POST /api/v1/whatsapp/send</strong> RYZLink menggunakan respon teks dari AI tersebut.</li>
                 <li>Pesan sukses dibalas secara otomatis dalam hitungan detik!</li>
               </ol>
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}
