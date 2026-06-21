import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Code, Shield, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';

export default function ApiKeysTab({ user, API_URL }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/api-keys/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (err) {
      console.error("Error loading API keys:", err);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    // Check Plan for API Key Access if needed
    const isPro = ["pro", "enterprise"].includes(user?.user_metadata?.plan_type);
    if (!isPro) {
      toast.error("Developer API is only available for PRO & Enterprise plans. Please upgrade.", { duration: 5000 });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/whatsapp/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("API Key created successfully!");
        setNewKeyName('');
        loadApiKeys();
      } else {
        toast.error(data.error || "Failed to create API key");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
    setIsLoading(false);
  };

  const handleDeleteKey = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/api-keys/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("API Key deleted");
        loadApiKeys();
      }
    } catch (err) {
      toast.error("Failed to delete API key");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Disalin ke clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Documentation Card */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/20 overflow-hidden relative border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold flex items-center gap-3 mb-3">
            <Code className="w-7 h-7 text-[#0b5cff]" /> Developer API
          </h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-2xl">
            Integrasikan kemampuan pengiriman WhatsApp langsung ke dalam aplikasi, SaaS, atau sistem backend Anda menggunakan REST API kami. 
            Gunakan API Key yang di-generate di bawah ini sebagai Bearer Token.
          </p>
          <div className="bg-[#0b1121] border border-slate-800/60 p-5 rounded-2xl font-mono text-sm overflow-x-auto shadow-inner group">
            <p className="text-slate-500 mb-2 font-bold tracking-wider text-xs"># Contoh Request Kirim Pesan</p>
            <p className="text-green-400">POST <span className="text-slate-300">https://ryz.my.id/api/whatsapp/v1/send-message</span></p>
            <p className="text-purple-400">Authorization: <span className="text-slate-300">Bearer </span><span className="text-yellow-400">&lt;YOUR_API_KEY&gt;</span></p>
            <p className="text-purple-400">Content-Type: <span className="text-slate-300">application/json</span></p>
            <p className="mt-3 text-slate-400">{`{`}</p>
            <p className="text-blue-300 ml-4">"session_id"<span className="text-slate-400">: </span><span className="text-amber-300">"ID_SESI_WA_ANDA"</span><span className="text-slate-400">, // Opsional jika hanya punya 1 session</span></p>
            <p className="text-blue-300 ml-4">"to"<span className="text-slate-400">: </span><span className="text-amber-300">"08123456789"</span><span className="text-slate-400">,</span></p>
            <p className="text-blue-300 ml-4">"message"<span className="text-slate-400">: </span><span className="text-amber-300">"Hello from external app!"</span></p>
            <p className="text-slate-400">{`}`}</p>
          </div>
        </div>
      </div>

      {/* Keys Management */}
      <div className="bg-white border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-[#0b5cff] shadow-sm">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-900">Manajemen API Keys</h4>
            <p className="text-sm text-slate-500 font-medium">Buat dan kelola kunci akses untuk integrasi API.</p>
          </div>
        </div>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex-1 relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Beri nama key... (misal: Website Utama)"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 transition-all font-medium text-slate-700"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !newKeyName.trim()}
            className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Plus className="w-5 h-5" /> Buat Key Baru
          </button>
        </form>

        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Belum ada API Key</p>
              <p className="text-sm text-slate-400">Silakan buat key baru menggunakan form di atas.</p>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-bold text-slate-800 text-lg">{key.name}</h5>
                    <span className="px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider">Aktif</span>
                  </div>
                  <div className="w-full mt-2">
                    <div className="bg-slate-50 border border-slate-200 text-slate-600 px-3 sm:px-4 py-2 rounded-xl font-mono text-xs sm:text-sm tracking-wide shadow-inner flex items-center justify-between gap-2 overflow-hidden w-full max-w-full">
                      <div className="flex items-center truncate">
                        <span className="text-slate-400 shrink-0">ryz_</span>
                        <span className="font-bold text-slate-700 truncate">••••••••••••••••{key.api_key.substring(key.api_key.length - 4)}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(key.id, key.api_key)} 
                        className="shrink-0 text-[#0b5cff] hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="Salin Full API Key"
                      >
                        {copiedId === key.id ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Dibuat: {new Date(key.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div> Digunakan: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum pernah'}</span>
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: key.id })}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-xl transition-all font-bold text-sm w-full md:w-auto"
                    title="Hapus / Cabut Key"
                  >
                    <Trash2 className="w-4 h-4" /> Cabut Key
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDeleteKey} 
        title="Cabut API Key" 
        message="Apakah Anda yakin ingin mencabut (menghapus) API Key ini? Semua aplikasi atau layanan yang menggunakan API Key ini akan segera kehilangan akses pengiriman pesan."
        confirmText="Ya, Cabut Key" 
      />
    </div>
  );
}
