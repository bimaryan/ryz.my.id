import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Loader2, Link as LinkIcon, Save, UploadCloud } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ProductEditorModal({ isOpen, onClose, initialData, onSave }) {
  const { uploadImage } = useAuth();
  const [formData, setFormData] = useState(initialData || {});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen || !formData) return null;

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isPhysical = formData.type === 'physical_product';
  const isDigital = formData.type === 'digital_product';
  const isEvent = formData.type === 'event';
  const isAppointment = formData.type === 'appointment';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50/95 backdrop-blur-sm animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <h2 className="text-xl font-bold text-slate-800">
          Edit {formData?.type ? formData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Product'}
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0b5cff] hover:bg-blue-700 rounded-full transition-colors shadow-md shadow-[#0b5cff]/20"
          >
            <Save className="w-4 h-4" /> Save Options
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Details</h3>
              </div>
              <div className="p-5 space-y-5">
                
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image</label>
                  <div className="flex items-start gap-4">
                    {formData.thumbnail_url ? (
                      <div className="relative group w-32 h-32 shrink-0">
                        <img src={formData.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                        <button 
                          onClick={() => handleUpdate('thumbnail_url', '')} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 shrink-0 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0b5cff]/50 hover:bg-blue-50 text-slate-400 flex flex-col items-center justify-center cursor-pointer transition-all">
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin mb-1" /> : <ImageIcon className="w-6 h-6 mb-1 opacity-50" />}
                        <span className="text-xs font-bold">{isUploading ? 'Uploading...' : 'Add Image'}</span>
                        <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if(!file) return;
                          setIsUploading(true);
                          const res = await uploadImage(file);
                          if(res.success) handleUpdate('thumbnail_url', res.url);
                          else toast.error("Upload failed");
                          setIsUploading(false);
                        }} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                  <Input 
                    placeholder="Product Title"
                    value={formData.title || ''}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                    className="font-bold text-slate-800 focus:ring-2 focus:ring-[#0b5cff]/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0b5cff]/20 transition-all bg-white">
                    <ReactQuill 
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => handleUpdate('description', value)}
                      placeholder="Write a detailed description..."
                      className="border-none"
                    />
                  </div>
                </div>
                
                {isDigital && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product File / External Link</label>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <Input 
                          placeholder="Paste Google Drive, Dropbox, or any URL here..."
                          value={formData.product_file_url || ''}
                          onChange={(e) => handleUpdate('product_file_url', e.target.value)}
                          className="w-full text-sm font-medium bg-white focus:ring-[#0b5cff]/20"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Pembeli akan diarahkan ke link ini atau mengunduh file setelah membayar.</p>
                      </div>
                      
                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400">ATAU UPLOAD FILE LANGSUNG</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>
                      
                      <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 hover:border-[#0b5cff] hover:bg-blue-50 rounded-xl cursor-pointer transition-colors group bg-white">
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#0b5cff] transition-colors" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">Click to attach ZIP / PDF file</span>
                        <input type="file" className="hidden" accept=".zip,.pdf,.rar" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if(!file) return;
                          toast.loading("Uploading file...", { id: "upload" });
                          const res = await uploadImage(file);
                          if(res.success) {
                            handleUpdate('product_file_url', res.url);
                            toast.success("File uploaded", { id: "upload" });
                          } else {
                            toast.error("Upload failed", { id: "upload" });
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Pricing</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (Rp)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) => handleUpdate('price', e.target.value)}
                      className="font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sale Price</label>
                    <Input 
                      type="number"
                      placeholder="Optional"
                      value={formData.discount_price || ''}
                      onChange={(e) => handleUpdate('discount_price', e.target.value)}
                      className="font-bold text-slate-500 line-through"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purchase Button CTA</label>
                  <Input 
                    placeholder="e.g. Buy Now, Get Ticket"
                    value={formData.button_text || ''}
                    onChange={(e) => handleUpdate('button_text', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Inventory / Volume */}
            {(isPhysical || isEvent) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-700">{isEvent ? 'Capacity' : 'Item Volume'}</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isEvent ? 'Max Tickets' : 'Stock Quantity'}</label>
                      <Input 
                        type="number"
                        placeholder="Unlimited if empty"
                        value={isEvent ? formData.capacity : formData.stock || ''}
                        onChange={(e) => handleUpdate(isEvent ? 'capacity' : 'stock', e.target.value)}
                      />
                    </div>
                    {isPhysical && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (grams)</label>
                        <Input 
                          type="number"
                          placeholder="e.g. 1000"
                          value={formData.weight || ''}
                          onChange={(e) => handleUpdate('weight', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event specific */}
            {isEvent && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-700">Event Details</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Type</label>
                    <select 
                      value={formData.event_type || 'offline'} 
                      onChange={(e) => handleUpdate('event_type', e.target.value)}
                      className="w-full text-sm font-bold text-slate-700 border-slate-200 bg-white focus:ring-2 focus:ring-[#0b5cff]/20 py-2.5 rounded-xl"
                    >
                      <option value="offline">Offline Venue</option>
                      <option value="online">Online Webinar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Date</label>
                    <Input type="date" value={formData.event_date || ''} onChange={(e) => handleUpdate('event_date', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                      <Input type="time" value={formData.start_time || '19:00'} onChange={(e) => handleUpdate('start_time', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                      <Input type="time" value={formData.end_time || '21:00'} onChange={(e) => handleUpdate('end_time', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / URL</label>
                    <Input placeholder="Jakarta Convention Center" value={formData.location || ''} onChange={(e) => handleUpdate('location', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment specific */}
            {isAppointment && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-700">Appointment Settings</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                      <select 
                        value={formData.duration || '30'} 
                        onChange={(e) => handleUpdate('duration', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 border-slate-200 bg-white focus:ring-2 focus:ring-[#0b5cff]/20 py-2.5 rounded-xl"
                      >
                        <option value="15">15 Mins</option>
                        <option value="30">30 Mins</option>
                        <option value="45">45 Mins</option>
                        <option value="60">1 Hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform</label>
                      <select 
                        value={formData.meeting_platform || 'zoom'} 
                        onChange={(e) => handleUpdate('meeting_platform', e.target.value)}
                        className="w-full text-sm font-bold text-slate-700 border-slate-200 bg-white focus:ring-2 focus:ring-[#0b5cff]/20 py-2.5 rounded-xl"
                      >
                        <option value="zoom">Zoom</option>
                        <option value="gmeet">Google Meet</option>
                        <option value="phone">Phone Call</option>
                        <option value="in_person">In-Person</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting URL / Location</label>
                    <Input placeholder="Zoom link or Cafe Name" value={formData.meeting_url || ''} onChange={(e) => handleUpdate('meeting_url', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                        <label key={day} className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:border-blue-200">
                          <input 
                            type="checkbox" 
                            checked={(formData.available_days || ['Mon','Tue','Wed','Thu','Fri']).includes(day)}
                            onChange={(e) => {
                              let days = formData.available_days || ['Mon','Tue','Wed','Thu','Fri'];
                              if(e.target.checked) days = [...days, day];
                              else days = days.filter(d => d !== day);
                              handleUpdate('available_days', days);
                            }}
                            className="rounded text-[#0b5cff] focus:ring-[#0b5cff] w-4 h-4"
                          /> {day}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                      <Input type="time" value={formData.start_time || '09:00'} onChange={(e) => handleUpdate('start_time', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                      <Input type="time" value={formData.end_time || '17:00'} onChange={(e) => handleUpdate('end_time', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced / Follow Up */}
            {(isDigital || isAppointment) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-700">Advance Option</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custom Message / Note</label>
                    <textarea 
                      placeholder={isDigital ? "Message sent after purchase..." : "Note to client for preparation..."}
                      value={isDigital ? (formData.thank_you_message || '') : (formData.client_note || '')}
                      onChange={(e) => handleUpdate(isDigital ? 'thank_you_message' : 'client_note', e.target.value)}
                      rows={3}
                      className="w-full text-sm font-medium text-slate-600 bg-white rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Questions for Customer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Question for Customer</h3>
                <p className="text-xs text-slate-500 mt-1">Custom fields to fill in during checkout</p>
              </div>
              <div className="p-5 space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-bold text-slate-700">Require Customer Name</span>
                  <input 
                    type="checkbox" 
                    checked={formData.ask_phone !== false} 
                    onChange={(e) => handleUpdate('ask_phone', e.target.checked)}
                    className="rounded text-[#0b5cff] focus:ring-[#0b5cff] w-5 h-5"
                  />
                </label>
                {isPhysical && (
                  <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <span className="text-sm font-bold text-slate-700">Require Shipping Address</span>
                    <input 
                      type="checkbox" 
                      checked={formData.require_address !== false} 
                      onChange={(e) => handleUpdate('require_address', e.target.checked)}
                      className="rounded text-[#0b5cff] focus:ring-[#0b5cff] w-5 h-5"
                    />
                  </label>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
