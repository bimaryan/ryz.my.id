import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { clsx } from 'clsx';
import { useLocation } from 'react-router-dom';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isHidden = /^\/f\/|^\/dashboard/.test(location.pathname);

  if (isHidden) return null;

  return (
    <>
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 group flex items-center justify-center border",
          isOpen
            ? "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 hover:scale-105"
            : "bg-primary-600 text-white border-transparent hover:bg-primary-500 hover:scale-110 hover:shadow-primary-500/25"
        )}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <X className="transition-transform duration-300" size={24} />
        ) : (
          <MessageSquare className="transition-transform duration-300 group-hover:-rotate-12" size={24} />
        )}
        
        {/* Pulse effect when closed */}
        {!isOpen && (
          <span className="absolute w-full h-full rounded-full bg-primary-500/30 animate-ping -z-10"></span>
        )}
      </button>
    </>
  );
};
