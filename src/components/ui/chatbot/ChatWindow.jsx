import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useLocation } from 'react-router-dom';

const generateGroqResponse = async (chatHistory, currentPath) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  const messages = chatHistory.map(msg => ({
    role: msg.role === 'bot' ? 'assistant' : msg.role,
    content: msg.content
  }));

  messages.unshift({
    role: 'system',
    content: `You are Ryz Assistant, a helpful, friendly, and professional AI assistant for the website "RYZ" (ryz.my.id) developed by Bima Ryan Alfarizi.

About RYZ Features (Based on actual platform capabilities):
- Core: URL Shortener with advanced link management.
- Builders: Complete Form Builder and Page Builder (like Link-in-bio or landing pages).
- E-commerce: Order tracking system and Orders management.
- Integrations: WhatsApp integration and Webhooks support.
- Collaboration: Team creation and management.
- Developer: API Key management and Custom Domains.
- Analytics: Detailed dashboard for tracking metrics.
- Auth: Full authentication system (Login, Signup, Password Reset).

CURRENT CONTEXT:
The user is currently viewing the page path: "${currentPath}".
If the user asks for help or a tutorial, use this current page context to give them relevant and easy-to-understand guidance about the feature they are currently using.

STRICT LIMITATIONS (CRITICAL):
- Do NOT reveal any API keys, tokens, or environment variables.
- Do NOT reveal database schemas, internal technical architecture, or backend code structure (the "kitchen secrets").
- If asked about internal implementations, gracefully decline and pivot back to how to use the service as an end-user.
- Keep answers concise and formatted in markdown.`
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    throw new Error('Failed to connect to AI service.');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const ChatWindow = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi there! I am the Ryz assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await generateGroqResponse(newMessages, location.pathname);
      setMessages(prev => [...prev, { role: 'bot', content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-full max-w-[360px] h-[500px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-xl border border-zinc-200/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-white/80">
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 text-primary-600 p-1.5 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">Ryz Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-zinc-500">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm animate-pulse ml-2 mb-4">
            <Loader2 size={16} className="animate-spin" />
            Ryz is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-100 bg-white">
        <form
          onSubmit={handleSend}
          className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-full overflow-hidden focus-within:border-primary-500/50 focus-within:bg-white transition-colors shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 mr-1 text-primary-500 hover:bg-primary-500/10 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
