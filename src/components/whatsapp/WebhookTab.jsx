import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Webhook, Save } from "lucide-react";

export default function WebhookTab({ sessionId, userId, apiUrl }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetch(`${apiUrl}/whatsapp/webhooks/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setWebhookUrl(data.data.webhook_url);
            setIsActive(data.data.is_active);
          } else {
            setWebhookUrl("");
            setIsActive(true);
          }
        });
    }
  }, [sessionId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/whatsapp/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          webhook_url: webhookUrl,
          is_active: isActive
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Webhook berhasil disimpan!");
      } else {
        toast.error(data.error || "Gagal menyimpan webhook");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Webhook className="w-5 h-5 text-blue-500" /> Webhook Integration
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Teruskan semua pesan masuk ke sistem atau aplikasi Anda secara realtime melalui HTTP POST request.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Endpoint URL</label>
          <input 
            type="url" 
            value={webhookUrl} 
            onChange={e => setWebhookUrl(e.target.value)} 
            placeholder="https://api.yourdomain.com/webhook" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isActive" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)} 
            className="w-4 h-4 text-blue-600 rounded border-slate-300"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Aktifkan Webhook</label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <Save className="w-4 h-4" />}
          Simpan Konfigurasi
        </button>
      </form>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-800 mb-2">Payload Example (POST)</h4>
        <pre className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg overflow-x-auto">
{`{
  "session_id": "...",
  "from": "6281234567890@s.whatsapp.net",
  "text": "Halo min!",
  "message": {
    "conversation": "Halo min!",
    ...
  }
}`}
        </pre>
      </div>
    </div>
  );
}
