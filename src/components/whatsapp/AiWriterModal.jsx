import React, { useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AiWriterModal({ isOpen, onClose, onApply }) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in m-4">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" /> AI Message Writer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Apa inti pesan yang ingin Anda sampaikan?
            </label>
            <textarea
              className="w-full px-3 py-3 border border-slate-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              rows={3}
              placeholder="Contoh: Buatkan pesan promo diskon 50% untuk sepatu sneakers edisi terbatas hari ini..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={generateText}
              disabled={isLoading || !prompt.trim()}
              className="mt-3 w-full bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <LoadingSpinner size="large" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isLoading ? "AI Sedang Mengetik..." : "Generate dengan AI"}
            </button>
          </div>

          {generatedText && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Hasil Generate AI:
              </label>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {generatedText}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    onApply(generatedText);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Gunakan Pesan Ini
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
