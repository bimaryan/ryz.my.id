import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ChapterEditorModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState(initialData || { is_free: false });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ is_free: false });
    }
  }, [initialData, isOpen]);

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.title) return alert("Content Title is required");
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-[#f4f6fa] w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {formData.id ? 'Edit Content' : 'Add Content'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Content Access</label>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => handleUpdate('is_free', false)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!formData.is_free ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  Paywall
                </button>
                <button 
                  onClick={() => handleUpdate('is_free', true)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${formData.is_free ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  Free Preview
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Part</label>
              <Input 
                placeholder="Eg. Chapter/bab/episode..."
                value={formData.part_name || ''}
                onChange={(e) => handleUpdate('part_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title of this content</label>
              <Input 
                placeholder="Content Title"
                value={formData.title || ''}
                onChange={(e) => handleUpdate('title', e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Body</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0b5cff]/20 transition-all bg-white flex-1 flex flex-col">
                <ReactQuill 
                  theme="snow"
                  value={formData.content || ''}
                  onChange={(value) => handleUpdate('content', value)}
                  className="border-none flex-1 h-full"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 border-2 border-[#0b5cff] text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Back
          </button>

          <button 
            onClick={handleSave}
            className="px-10 py-2.5 bg-[#0b5cff] hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
