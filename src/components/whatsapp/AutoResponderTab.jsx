import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Bot } from "lucide-react";
import ConfirmModal from '../ui/ConfirmModal';

export default function AutoResponderTab({ sessionId, userId, apiUrl }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [keyword, setKeyword] = useState("");
  const [matchType, setMatchType] = useState("exact");
  const [replyMessage, setReplyMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const templates = [
    { label: "Sapaan", keyword: "halo", matchType: "exact", replyMessage: "Halo! Ada yang bisa kami bantu? Silakan balas pesan ini untuk informasi lebih lanjut." },
    { label: "Harga", keyword: "harga", matchType: "contains", replyMessage: "Berikut adalah informasi harga layanan kami:\n1. Paket Basic\n2. Paket Pro\n\nUntuk detail lebih lanjut, silakan kunjungi website kami." },
    { label: "Lokasi", keyword: "lokasi", matchType: "contains", replyMessage: "Kantor kami berlokasi di pusat kota. Jam operasional: Senin - Jumat (09:00 - 17:00)." },
    { label: "Terima Kasih", keyword: "terima kasih", matchType: "contains", replyMessage: "Sama-sama! Senang bisa membantu Anda. Jangan ragu menghubungi kami lagi." }
  ];

  const applyTemplate = (t) => {
    setKeyword(t.keyword);
    setMatchType(t.matchType);
    setReplyMessage(t.replyMessage);
  };

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/whatsapp/autoresponders/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setRules(data.data || []);
      }
    } catch (err) {
      toast.error("Gagal memuat auto-responder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) loadRules();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword || !replyMessage) return;

    try {
      const res = await fetch(`${apiUrl}/whatsapp/autoresponders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          keyword,
          match_type: matchType,
          reply_message: replyMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Auto-responder ditambahkan!");
        setKeyword("");
        setReplyMessage("");
        loadRules();
      } else {
        toast.error(data.error || "Gagal menambahkan");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${apiUrl}/whatsapp/autoresponders/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Rule dihapus");
        loadRules();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-500" /> Auto Responder
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tambah Rule Baru</h3>

        <div className="mb-4">
          <p className="text-xs font-medium text-slate-600 mb-2">Gunakan Template Cepat:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(t)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors shadow-sm"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kata Kunci (Keyword)</label>
            <input type="text" value={keyword} onChange={e=>setKeyword(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. halo" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Pencocokan</label>
            <select value={matchType} onChange={e=>setMatchType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="exact">Sama Persis (Exact)</option>
              <option value="contains">Mengandung (Contains)</option>
              <option value="starts_with">Diawali (Starts With)</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">Pesan Balasan</label>
          <textarea value={replyMessage} onChange={e=>setReplyMessage(e.target.value)} required rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" placeholder="Balasan otomatis..."></textarea>
        </div>
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Rule
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-4">Memuat data...</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Belum ada rule auto-responder</p>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="flex justify-between items-start p-3 bg-white border border-slate-200 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{rule.keyword}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{rule.match_type}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{rule.reply_message}</p>
              </div>
              <button onClick={() => setDeleteModal({ isOpen: true, id: rule.id })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete} 
        title="Hapus Rule Auto Responder" 
        message="Apakah Anda yakin ingin menghapus rule ini? Bot tidak akan membalas secara otomatis lagi untuk kata kunci ini."
        confirmText="Hapus Rule" 
      />
    </div>
  );
}
