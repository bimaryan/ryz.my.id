import React, { useState } from 'react';
import { Bot, Sparkles, X, Wand2, Copy, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AiWriterModal({ isOpen, onClose, onApply }) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateText = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedText('');

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        toast.error('Groq API Key tidak ditemukan di .env.local');
        setIsLoading(false);
        return;
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Anda adalah asisten AI profesional yang ahli dalam membuat pesan WhatsApp untuk bisnis, marketing, atau customer service. Buat pesan yang ramah, sopan, terstruktur, dan engaging. Gunakan emoji secukupnya agar menarik. Jangan menambahkan teks pengantar seperti "Tentu, ini pesannya" atau semacamnya, langsung berikan isi pesannya saja agar bisa langsung dicopy-paste oleh pengguna.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        setGeneratedText(data.choices[0].message.content.trim());
      } else {
        toast.error('Gagal generate pesan dari AI');
        console.error(data);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memanggil AI');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success('Teks berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestions = [
    '🛍️ Promo diskon flash sale 24 jam',
    '📦 Update status pengiriman order',
    '🎉 Ucapan selamat ulang tahun pelanggan',
    '🤝 Follow-up setelah meeting',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg" style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 rounded-3xl blur-lg opacity-40" />
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-5 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">AI Message Writer</h3>
                  <p className="text-purple-200 text-xs">Powered by Groq LLaMA 3.1</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Quick suggestions */}
            {!generatedText && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contoh Cepat</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-3 py-1.5 rounded-full border border-purple-100 hover:border-purple-300 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Apa yang ingin Anda sampaikan?
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-slate-100 bg-slate-50 hover:border-purple-200 focus:border-purple-500 focus:bg-white rounded-xl text-sm resize-none outline-none transition-all placeholder:text-slate-300"
                rows={3}
                placeholder="Contoh: Buatkan pesan promo diskon 50% untuk sepatu sneakers edisi terbatas hari ini..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) generateText(); }}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">⌘ + Enter untuk generate</p>
            </div>

            {/* Generate button */}
            <button
              onClick={generateText}
              disabled={isLoading || !prompt.trim()}
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-purple-500/30 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  AI Sedang Menulis...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate dengan AI
                </>
              )}
            </button>

            {/* Loading shimmer */}
            {isLoading && (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-purple-100 rounded-full w-full" />
                <div className="h-3 bg-purple-100 rounded-full w-5/6" />
                <div className="h-3 bg-purple-100 rounded-full w-4/6" />
              </div>
            )}

            {/* Generated result */}
            {generatedText && (
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-500" /> Hasil dari AI
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateText}
                      className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-52 overflow-y-auto leading-relaxed">
                  {generatedText}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 border-2 border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 bg-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                  <button
                    onClick={() => { onApply(generatedText); onClose(); }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" /> Gunakan Pesan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
