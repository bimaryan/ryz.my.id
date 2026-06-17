import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, CheckCircle, ChevronLeft, ChevronRight, PenTool, Layout as LayoutIcon, Settings as SettingsIcon } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ChapterEditorModal from './ChapterEditorModal';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { id: 'layout', label: 'Layout', icon: LayoutIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'finish', label: 'Finish', icon: CheckCircle },
];

export default function BlogEditorModal({ isOpen, onClose, initialData, onSave }) {
  const { uploadImage, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [isUploading, setIsUploading] = useState(false);
  const [chapters, setChapters] = useState(initialData?.chapters || []);
  const [editingChapterIndex, setEditingChapterIndex] = useState(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setChapters(initialData.chapters || []);
      setCurrentStep(0);
    } else {
      setFormData({ type: 'blog' });
      setChapters([]);
      setCurrentStep(0);
    }
  }, [initialData, isOpen]);

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save a blog.");
      return;
    }

    const toastId = toast.loading("Saving blog...");
    try {
      // Upsert Blog
      const isUUID = formData.id && formData.id.length === 36;
      const blogData = {
        user_id: user.id,
        title: formData.title || 'Untitled Blog',
        description: formData.description || '',
        cover_image_url: formData.cover_image_url || null,
        payment_type: formData.payment_type || 'One Time',
        price: formData.price || 0,
        currency: formData.currency || 'IDR',
        is_free: formData.is_free || false,
        allow_pay_what_you_want: formData.allow_pay_what_you_want || false,
        enable_whatsapp_notification: formData.enable_whatsapp_notification || false
      };

      if (isUUID) {
        blogData.id = formData.id;
      }

      const { data: savedBlog, error: blogError } = await supabase
        .from('blogs')
        .upsert(blogData)
        .select()
        .single();

      if (blogError) throw blogError;

      // Upsert Chapters
      if (chapters.length > 0) {
        const chaptersData = chapters.map((chap, idx) => {
          const chapData = {
            blog_id: savedBlog.id,
            title: chap.title || 'Untitled',
            part_name: chap.part_name || `Chapter ${idx + 1}`,
            content: chap.content || '',
            is_free: chap.is_free || false,
            order_index: idx
          };
          if (chap.id && chap.id.length === 36) {
            chapData.id = chap.id;
          }
          return chapData;
        });

        const { error: chaptersError } = await supabase
          .from('blog_chapters')
          .upsert(chaptersData);

        if (chaptersError) throw chaptersError;
      }

      toast.success("Blog saved successfully!", { id: toastId });
      
      // Pass back lightweight reference to PageEditor
      onSave({
        id: savedBlog.id,
        type: 'blog',
        title: savedBlog.title,
        price: savedBlog.price,
        cover_image_url: savedBlog.cover_image_url,
        chapters_count: chapters.length
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save blog.", { id: toastId });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    toast.loading("Uploading image...", { id: "upload" });
    const res = await uploadImage(file);
    if (res.success) {
      handleUpdate('cover_image_url', res.url);
      toast.success("Image uploaded", { id: "upload" });
    } else {
      toast.error("Upload failed", { id: "upload" });
    }
    setIsUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-[#f4f6fa] w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header & Stepper */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {formData.id ? 'Edit Blog' : 'Add Blog'}
          </h2>
          
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center justify-center gap-1`}>
                  <div className={`w-4 h-4 rounded-full border-2 ${currentStep >= idx ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-slate-100'} transition-all`} />
                  <span className={`text-[10px] font-bold ${currentStep >= idx ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 -mt-4 ${currentStep > idx ? 'bg-emerald-500' : 'bg-slate-200'} transition-all`} />
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Left Column: Layout Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover</label>
                  <label className="w-48 h-48 mx-auto flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer transition-colors relative overflow-hidden group">
                    {formData.cover_image_url ? (
                      <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-600">Add Image</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content title</label>
                  <Input 
                    placeholder="Insert Title"
                    value={formData.title || ''}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Synopsis</label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white flex-1 flex flex-col">
                    <ReactQuill 
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => handleUpdate('description', value)}
                      className="border-none flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Content List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content List</label>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  {chapters.length === 0 ? (
                    <div className="max-w-xs mx-auto">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PenTool className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-500 mb-6">
                        You can set a paywall content or make it into a free blog content. Suitable for web novel series, e-learning articles, and many more.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex-1 overflow-y-auto flex flex-col gap-3 mb-6 items-start text-left">
                      {chapters.map((chap, idx) => (
                        <div key={idx} className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => setEditingChapterIndex(idx)}>
                          <div>
                            <p className="text-xs font-bold text-slate-400">{chap.part_name || `Chapter ${idx+1}`}</p>
                            <p className="font-bold text-slate-800">{chap.title || 'Untitled'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-md font-bold ${chap.is_free ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {chap.is_free ? 'Free' : 'Paywall'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setEditingChapterIndex(chapters.length);
                      setIsChapterModalOpen(true);
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    + Add Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Settings */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Pricing</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Set as free content</label>
                      <button 
                        onClick={() => handleUpdate('is_free', !formData.is_free)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${formData.is_free ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.is_free ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {!formData.is_free && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700">Allow Customer to pay what they want</label>
                          <button 
                            onClick={() => handleUpdate('allow_pay_what_you_want', !formData.allow_pay_what_you_want)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${formData.allow_pay_what_you_want ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.allow_pay_what_you_want ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Payment Type</label>
                          <select 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                            value={formData.payment_type || 'One Time'}
                            onChange={(e) => handleUpdate('payment_type', e.target.value)}
                          >
                            <option value="One Time">One Time</option>
                            <option value="Subscription">Subscription</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Price</label>
                            <Input type="number" value={formData.price || 0} onChange={(e) => handleUpdate('price', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Currency</label>
                            <select 
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                              value={formData.currency || 'IDR'}
                              onChange={(e) => handleUpdate('currency', e.target.value)}
                            >
                              <option value="IDR">IDR</option>
                              <option value="USD">USD</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column Settings */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Advanced Option</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Set Release Time</label>
                      <button className="w-11 h-6 rounded-full bg-slate-200"><div className="w-4 h-4 rounded-full bg-white absolute translate-x-1 mt-1" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Enable Whatsapp Notification</label>
                      <button 
                        onClick={() => handleUpdate('enable_whatsapp_notification', !formData.enable_whatsapp_notification)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${formData.enable_whatsapp_notification ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.enable_whatsapp_notification ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Question for Customer</h3>
                  <p className="text-xs text-slate-500 mb-3">For your customer to fill in during checkout</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded text-emerald-500" />
                      <label className="text-sm font-medium text-slate-700">Name</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded text-emerald-500" />
                      <label className="text-sm font-medium text-slate-700">Phone</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-md mx-auto h-full flex flex-col items-center">
              <p className="text-sm text-slate-500 mb-4 text-center">Your product detail will look like this.</p>
              
              <div className="w-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px]">
                <div className="p-4 flex items-center text-white bg-black/20">
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  <span className="font-bold">Finish</span>
                </div>
                
                <div className="p-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">{formData.title || 'Untitled Blog'}</h1>
                    <p className="text-xs text-slate-500">
                      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • By You
                    </p>
                  </div>
                  
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">CONTENT LIST</h3>
                  
                  <div className="space-y-3">
                    {chapters.length === 0 ? (
                      <div className="bg-white/10 rounded-xl p-4 text-center text-white/50 text-sm">No chapters added yet</div>
                    ) : (
                      chapters.map((chap, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <PenTool className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{chap.part_name || `Chapter ${idx+1}`}</p>
                              <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-GB')}</span>
                            </div>
                            <p className="font-bold text-slate-800">{chap.title || 'Untitled'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          {currentStep === 0 ? (
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <button 
            onClick={() => {
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                handleSave();
              }
            }}
            className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            {currentStep < STEPS.length - 1 ? (
              <>Next Step <ChevronRight className="w-4 h-4" /></>
            ) : (
              'Save & Publish'
            )}
          </button>
        </div>

      </div>

      <ChapterEditorModal 
        isOpen={isChapterModalOpen}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingChapterIndex(null);
        }}
        initialData={editingChapterIndex !== null && editingChapterIndex < chapters.length ? chapters[editingChapterIndex] : null}
        onSave={(chapterData) => {
          setChapters(prev => {
            const next = [...prev];
            if (editingChapterIndex !== null && editingChapterIndex < next.length) {
              next[editingChapterIndex] = chapterData;
            } else {
              next.push(chapterData);
            }
            return next;
          });
          setIsChapterModalOpen(false);
          setEditingChapterIndex(null);
        }}
      />
    </div>
  );
}
