import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  text = 'Memuat...', 
  fullScreen = false, 
  size = 'default',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} text-blue-600 animate-spin`} />
      {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center w-full">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-12">
      {spinner}
    </div>
  );
}
