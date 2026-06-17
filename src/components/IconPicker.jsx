import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

// Extract all valid icon names, preferring names without 'Icon' suffix
const ICON_NAMES = Object.keys(LucideIcons).filter(name => {
  if (name === 'createLucideIcon' || name === 'default') return false;
  // If it ends with Icon, check if the non-Icon version exists. If it does, skip this one to avoid duplicates.
  if (name.endsWith('Icon') && LucideIcons[name.replace(/Icon$/, '')]) {
    return false;
  }
  return typeof LucideIcons[name] === 'function' || typeof LucideIcons[name] === 'object';
});

export default function IconPicker({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return ICON_NAMES.slice(0, 150); // limit to 150 for performance when empty
    
    const term = searchTerm.toLowerCase();
    const matches = ICON_NAMES.filter(name => name.toLowerCase().includes(term));
    return matches.slice(0, 150); // limit to 150 results
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Select an Icon</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 relative">
          <LucideIcons.Search className="w-5 h-5 absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search icons (e.g. mail, user, globe)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#0b5cff]/20 text-slate-700 font-medium"
            autoFocus
          />
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <LucideIcons.SearchX className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-medium">No icons found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              <button
                onClick={() => {
                  onSelect('');
                  onClose();
                }}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-[#0b5cff] hover:bg-[#0b5cff]/5 text-slate-500 hover:text-[#0b5cff] transition-all bg-white group"
                title="No Icon"
              >
                <div className="w-6 h-6 flex items-center justify-center border-2 border-dashed border-current rounded-md opacity-50 group-hover:opacity-100">
                  <LucideIcons.Minus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center">None</span>
              </button>

              {filteredIcons.map((iconName) => {
                const IconComponent = LucideIcons[iconName];
                if (!IconComponent) return null;
                
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onSelect(iconName);
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-[#0b5cff] hover:bg-[#0b5cff]/5 text-slate-600 hover:text-[#0b5cff] transition-all bg-white"
                    title={iconName}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-[10px] font-medium truncate w-full text-center">{iconName}</span>
                  </button>
                );
              })}
            </div>
          )}
          {filteredIcons.length === 150 && !searchTerm && (
            <div className="text-center text-sm text-slate-400 mt-6 font-medium">
              Showing 150 icons. Type to search more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
