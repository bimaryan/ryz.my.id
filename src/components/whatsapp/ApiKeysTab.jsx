import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Code, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';

export default function ApiKeysTab({ user, API_URL }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Code className="w-6 h-6 text-blue-400" /> Developer API
        </h3>
        <p className="text-slate-300 text-sm mb-4">
          Integrate WhatsApp sending capabilities directly into your own applications, SaaS, or backend systems using our REST API.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm overflow-x-auto text-green-400">
          <p className="text-slate-500 mb-1"># Send a WhatsApp Message</p>
          <p>POST https://api.ryz.my.id/api/whatsapp/v1/send-message</p>
          <p>Authorization: Bearer <span className="text-yellow-400">&lt;YOUR_API_KEY&gt;</span></p>
          <p>Content-Type: application/json</p>
          <p className="mt-2 text-slate-300">{`{`}</p>
          <p className="text-slate-300 ml-4">"to": <span className="text-yellow-400">"08123456789"</span>,</p>
          <p className="text-slate-300 ml-4">"message": <span className="text-yellow-400">"Hello from external app!"</span></p>
          <p className="text-slate-300">{`}`}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-slate-500" /> API Keys
        </h4>

        <form onSubmit={handleCreateKey} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="e.g. My Website Production"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create Key
          </button>
        </form>

        <div className="space-y-3">
          {apiKeys.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No API keys found. Create one above.</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl gap-4 hover:border-slate-300 transition-colors">
                <div>
                  <h5 className="font-bold text-slate-800">{key.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {key.api_key.substring(0, 10)}...{key.api_key.substring(key.api_key.length - 4)}
                    </code>
                    <button onClick={() => copyToClipboard(key.api_key)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Created: {new Date(key.created_at).toLocaleDateString()} | Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, id: key.id })}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Revoke Key"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDeleteKey} 
        title="Revoke API Key" 
        message="Are you sure you want to delete this API Key? Any application using it will immediately lose access."
        confirmText="Revoke Key" 
      />
    </div>
  );
}
