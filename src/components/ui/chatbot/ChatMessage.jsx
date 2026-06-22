import React from 'react';
import { clsx } from 'clsx';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatMessage = ({ role, content }) => {
  const isBot = role === 'assistant' || role === 'bot';

  return (
    <div
      className={clsx(
        'flex w-full mb-4 animate-fade-in-up',
        isBot ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={clsx(
          'flex max-w-[85%] gap-3 min-w-0',
          isBot ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        <div
          className={clsx(
            'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
            isBot ? 'bg-primary-50 text-primary-600' : 'bg-zinc-100 text-zinc-600'
          )}
        >
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm prose prose-sm max-w-full overflow-hidden break-words prose-p:leading-relaxed prose-pre:bg-zinc-50 prose-pre:border prose-pre:border-zinc-200/60 prose-pre:overflow-x-auto prose-pre:max-w-full',
            isBot
              ? 'bg-white text-zinc-700 rounded-tl-sm border border-zinc-200/60 shadow-sm'
              : 'bg-primary-600 text-white rounded-tr-sm shadow-md prose-invert'
          )}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
