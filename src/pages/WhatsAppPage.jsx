import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/whatsapp/sessions/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
        if (data.data.length > 0) {
          setSelectedSession(data.data[0]);
          loadMessages(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Load sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/messages/${user.id}?page=1&limit=20`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!sessionName.trim() || !user) return;

    try {
      const res = await fetch(`${API_URL}/whatsapp/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_name: sessionName.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Session berhasil dibuat! Silakan scan QR Code.');
        setSessionName('');
        await loadSessions();
      }
    } catch (err) {
      console.error('Create session error:', err);
      alert('Gagal membuat session: ' + err.message);
    }
  };

  const refreshQR = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/session/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, qr_code: data.data.qr_code } : s
        ));
      }
    } catch (err) {
      console.error('Refresh QR error:', err);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Hapus session ini?')) return;

    try {
      const res = await fetch(`${API_URL}/whatsapp/session/${sessionId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        alert('Session dihapus');
        setSelectedSession(null);
        await loadSessions();
      }
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSession || !recipient || !messageContent || !user) return;

    try {
      setSending(true);
      const res = await fetch(`${API_URL}/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          user_id: user.id,
          recipient: recipient,
          message_type: messageType,
          message_content: messageContent,
          media_url: messageType !== 'text' ? mediaUrl : null
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Pesan berhasil dikirim!');
        setRecipient('');
        setMessageContent('');
        setMediaUrl('');
        await loadMessages(selectedSession.id);
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Gagal mengirim pesan: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="WhatsApp API - RYZ Shortlink" description="Kelola WhatsApp API" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LucideIcons.MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">WhatsApp API</h1>
          </div>
          <p className="text-slate-600">Kelola session dan kirim pesan WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Daftar Session */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LucideIcons.Smartphone className="w-5 h-5" /> Sessions
              </h2>

              <form onSubmit={createSession} className="mb-4">
                <input
                  type="text"
                  placeholder="Nama Session (misal: Personal)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  Buat Session Baru
                </button>
              </form>

              <div className="space-y-2">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{session.session_id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'connected' ? 'bg-green-100 text-green-700' :
                        session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); refreshQR(session.id); }}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                      >
                        Refresh QR
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Code Section */}
            {selectedSession && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Session Details</h2>
                
                {selectedSession.status === 'pending' && selectedSession.qr_code && (
                  <div className="text-center">
                    <img
                      src={selectedSession.qr_code}
                      alt="QR Code"
                      className="mx-auto w-64 h-64"
                    />
                    <p className="text-slate-600 mt-4">Scan QR Code ini dengan WhatsApp Anda</p>
                    <p className="text-sm text-slate-500">QR Code akan kadaluarsa dalam 1 menit</p>
                  </div>
                )}

                {selectedSession.status === 'connected' && (
                  <div className="text-center py-8">
                    <LucideIcons.CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900">Session Terhubung!</p>
                  </div>
                )}
              </div>
            )}

            {/* Kirim Pesan */}
            {selectedSession && selectedSession.status === 'connected' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Kirim Pesan Baru</h2>
                
                <form onSubmit={sendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pesan</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                    >
                      <option value="text">Teks</option>
                      <option value="image">Gambar</option>
                    </select>
                  </div>

                  {messageType !== 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">URL Media</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Isi Pesan</label>
                    <textarea
                      placeholder="Tulis pesan Anda disini..."
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <LucideIcons.Send className="w-5 h-5" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Riwayat Pesan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Riwayat Pesan</h2>
              
              {messages.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Belum ada pesan</p>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                      <LucideIcons.MessageCircle className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900">{msg.recipient}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            msg.status === 'sent' ? 'bg-green-100 text-green-700' :
                            msg.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{msg.message_content}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(msg.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
