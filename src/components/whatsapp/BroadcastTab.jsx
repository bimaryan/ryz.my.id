import React, { useState, useEffect } from 'react';
import { Send, Trash2, Megaphone, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';
import AiWriterModal from './AiWriterModal';

export default function BroadcastTab({ sessionId, userId, API_URL }) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [name, setName] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (sessionId) loadBroadcasts();
  }, [sessionId]);

  const loadBroadcasts = async () => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/broadcasts/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setBroadcasts(data.data || []);
      }
    } catch (err) {
      console.error("Error loading broadcasts:", err);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!name.trim() || !messageContent.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/whatsapp/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId, 
          session_id: sessionId, 
          name: name.trim(), 
          message_content: messageContent.trim() 
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Broadcast berhasil dibuat & sedang diproses!");
        setName("");
        setMessageContent("");
        loadBroadcasts();
      } else {
        toast.error(data.error || "Gagal membuat broadcast");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    }
    setIsLoading(false);
  };

  const handleDeleteBroadcast = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/broadcasts/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Broadcast dihapus");
        loadBroadcasts();
      }
    } catch (err) {
      toast.error("Gagal menghapus broadcast");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-red-500" /> Broadcast Pesan
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Kirim pesan massal ke seluruh kontak Anda yang tersimpan di Buku Telepon.
      </p>

      <form onSubmit={handleCreateBroadcast} className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Kampanye Broadcast</label>
          <input
            type="text"
            placeholder="Promo Akhir Tahun..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Isi Pesan</label>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" /> AI Writer
            </button>
          </div>
          <textarea
            placeholder="Halo, ada promo spesial..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Kirim Broadcast Sekarang
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Riwayat Broadcast</h3>
        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <p className="text-center py-6 text-slate-500 text-sm">Belum ada riwayat broadcast.</p>
          ) : (
            broadcasts.map(b => (
              <div key={b.id} className="p-4 border border-slate-200 rounded-lg bg-white relative group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800">{b.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(b.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                    b.status === 'completed' ? 'bg-green-100 text-green-700' :
                    b.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    b.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                  {b.message_content}
                </p>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="text-slate-500">Total Kontak: <span className="text-slate-800">{b.total_recipients || 0}</span></div>
                  <div className="text-green-600">Berhasil: {b.sent_count || 0}</div>
                  <div className="text-red-500">Gagal: {b.failed_count || 0}</div>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, id: b.id })}
                  className="absolute text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-md shadow-sm border border-slate-100"
                  style={{ top: '12px', right: '12px' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDeleteBroadcast} 
        title="Hapus Broadcast" 
        message="Apakah Anda yakin ingin menghapus riwayat broadcast ini?"
        confirmText="Hapus Riwayat" 
      />

      <AiWriterModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={(text) => setMessageContent(text)}
      />
    </div>
  );
}
