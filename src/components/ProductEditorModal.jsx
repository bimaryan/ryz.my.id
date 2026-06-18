import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Loader2, Link as LinkIcon, Save, UploadCloud, Plus, Trash2, Info } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useBiteship } from '@/hooks/useBiteship';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ProductEditorModal({ isOpen, onClose, initialData, onSave }) {
  const { uploadImage } = useAuth();
  const { areas, searchArea, isSearchingArea, couriers, fetchCouriers, isLoadingCouriers } = useBiteship();
  const [formData, setFormData] = useState(initialData || {});
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'integrations'
  const [areaSearchInput, setAreaSearchInput] = useState('');
  const [shippingAreaSearchInput, setShippingAreaSearchInput] = useState('');

  // Fetch couriers on load
  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

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

  const handleAddVariant = () => {
    const currentVariants = formData.variants || [];
    handleUpdate('variants', [...currentVariants, { id: Date.now().toString(), name: '', price: '' }]);
  };

  const handleUpdateVariant = (index, field, value) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    handleUpdate('variants', newVariants);
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    handleUpdate('variants', newVariants);
  };

  const handleAddReview = () => {
    const currentReviews = formData.reviews || [];
    if (currentReviews.length >= 10) {
      toast.error('Maximum 10 reviews allowed');
      return;
    }
    handleUpdate('reviews', [...currentReviews, { id: Date.now().toString(), reviewer_name: '', rating: 5, comment: '' }]);
  };

  const handleUpdateReview = (index, field, value) => {
    const newReviews = [...(formData.reviews || [])];
    newReviews[index] = { ...newReviews[index], [field]: value };
    handleUpdate('reviews', newReviews);
  };

  const handleRemoveReview = (index) => {
    const newReviews = [...(formData.reviews || [])];
    newReviews.splice(index, 1);
    handleUpdate('reviews', newReviews);
  };

  const isPhysical = formData.type === 'physical_product';
  const isDigital = formData.type === 'digital_product';
  const isEvent = formData.type === 'event';
  const isAppointment = formData.type === 'appointment';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-50 shadow-2xl h-full flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-white border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {formData?.id ? 'Edit' : 'Add'} {formData?.type ? formData.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Product'}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          <div className="w-full space-y-6 pb-8">
          
          {/* Details */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-6 uppercase tracking-wider text-sm">Details</h3>
              <div className="space-y-5">
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Image</label>
                  <div className="flex items-start gap-4">
                    {formData.thumbnail_url ? (
                      <div className="relative group w-24 h-24 shrink-0">
                        <img src={formData.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                        <button 
                          onClick={() => handleUpdate('thumbnail_url', '')} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50 flex flex-col items-center justify-center cursor-pointer transition-all">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin mb-1 text-slate-400" /> : <ImageIcon className="w-5 h-5 mb-1 text-slate-400" />}
                        <span className="text-xs font-medium text-slate-500">{isUploading ? 'Uploading...' : 'Add Image'}</span>
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

                {/* Add video toggle */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    Add video <Info className="w-4 h-4 text-slate-400" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.add_video || false} onChange={(e) => handleUpdate('add_video', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Title</label>
                  <Input 
                    placeholder="Title"
                    value={formData.title || ''}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                    className="focus:ring-green-500 border-slate-300"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
                  <div className="border border-green-100 rounded-lg overflow-hidden bg-green-50/30">
                    <ReactQuill 
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => handleUpdate('description', value)}
                      placeholder=""
                      className="border-none min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
                  <select 
                    className="w-full border-slate-300 rounded-md focus:ring-green-500 text-sm py-2 px-3"
                    value={formData.category || ''}
                    onChange={(e) => handleUpdate('category', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Kamera & Optik">Kamera & Optik</option>
                    <option value="Pakaian">Pakaian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Sub Category</label>
                  <select 
                    className="w-full border-slate-300 rounded-md focus:ring-green-500 text-sm py-2 px-3"
                    value={formData.sub_category || ''}
                    onChange={(e) => handleUpdate('sub_category', e.target.value)}
                  >
                    <option value="">Select Sub-Category</option>
                    <option value="Aksesoris Kamera">Aksesoris Kamera</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Pricing</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Price</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) => handleUpdate('price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Currency</label>
                    <select 
                      className="w-full border-slate-300 rounded-md focus:ring-green-500 text-sm py-2 px-3"
                      value={formData.currency || 'IDR'}
                      onChange={(e) => handleUpdate('currency', e.target.value)}
                    >
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Input 
                    type="number"
                    placeholder="Sale Price (Optional)"
                    value={formData.discount_price || ''}
                    onChange={(e) => handleUpdate('discount_price', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Purchase Button</label>
                  <select 
                    className="w-full border-slate-300 rounded-md focus:ring-green-500 text-sm py-2 px-3"
                    value={formData.button_text || 'Buy Now'}
                    onChange={(e) => handleUpdate('button_text', e.target.value)}
                  >
                    <option value="Buy Now">Buy Now</option>
                    <option value="Add to Cart">Add to Cart</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Item Volume */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Item Volume</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Item Quantity</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.item_quantity_enabled || false} onChange={(e) => handleUpdate('item_quantity_enabled', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <div className="text-sm text-slate-600">Unlimited</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    Limit qty per checkout <Info className="w-4 h-4 text-slate-400" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.limit_qty_per_checkout || false} onChange={(e) => handleUpdate('limit_qty_per_checkout', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Weight (kg)</label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.weight || ''}
                    onChange={(e) => handleUpdate('weight', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Length (cm)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.length || ''}
                      onChange={(e) => handleUpdate('length', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Width (cm)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.width || ''}
                      onChange={(e) => handleUpdate('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Height (cm)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.height || ''}
                      onChange={(e) => handleUpdate('height', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Item Variants */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Item Variants</h3>
              
              {(formData.variants || []).length > 0 && (
                <div className="space-y-3 mb-4">
                  {(formData.variants || []).map((variant, index) => (
                    <div key={variant.id || index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex-1 space-y-2">
                        <Input 
                          placeholder="Variant Name (e.g. Merah - XL)" 
                          value={variant.name} 
                          onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)} 
                          className="h-9 text-sm"
                        />
                        <Input 
                          type="number" 
                          placeholder="Price override (optional)" 
                          value={variant.price || ''} 
                          onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)} 
                          className="h-9 text-sm"
                        />
                      </div>
                      <button onClick={() => handleRemoveVariant(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded border border-slate-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400">{(formData.variants || []).length} VARIANTS</div>
                <button onClick={handleAddVariant} className="text-sm font-bold text-green-500 hover:text-green-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Variant
                </button>
              </div>
            </div>


          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Review */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">Review ({(formData.reviews || []).length}/10)</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <button onClick={handleAddReview} className="text-sm font-bold text-green-500 hover:text-green-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>

              {(formData.reviews || []).length > 0 && (
                <div className="space-y-3">
                  {(formData.reviews || []).map((review, index) => (
                    <div key={review.id || index} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                      <button onClick={() => handleRemoveReview(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex gap-2 pr-8">
                        <Input 
                          placeholder="Reviewer Name" 
                          value={review.reviewer_name} 
                          onChange={(e) => handleUpdateReview(index, 'reviewer_name', e.target.value)} 
                          className="h-9 text-sm flex-1"
                        />
                        <select 
                          value={review.rating} 
                          onChange={(e) => handleUpdateReview(index, 'rating', parseInt(e.target.value))}
                          className="h-9 px-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-green-500"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐</option>
                          <option value={4}>⭐⭐⭐⭐</option>
                          <option value={3}>⭐⭐⭐</option>
                          <option value={2}>⭐⭐</option>
                          <option value={1}>⭐</option>
                        </select>
                      </div>
                      <textarea 
                        placeholder="Review comment..."
                        value={review.comment}
                        onChange={(e) => handleUpdateReview(index, 'comment', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-green-500 resize-none"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping */}
            {isPhysical && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
                <h3 className="font-bold text-slate-500 mb-6 uppercase tracking-wider text-sm">Shipping</h3>
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Search Origin (District/City)</label>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. Kebayoran Baru..."
                        value={areaSearchInput}
                        onChange={(e) => {
                          setAreaSearchInput(e.target.value);
                          searchArea(e.target.value);
                        }}
                        className="mb-2"
                      />
                      {isSearchingArea && <div className="absolute right-3 top-2.5"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>}
                      {areas.length > 0 && areaSearchInput && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {areas.map(area => (
                            <div 
                              key={area.id} 
                              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm"
                              onClick={() => {
                                handleUpdate('origin_area_id', area.id);
                                handleUpdate('province', area.administrative_division_level_1_name);
                                handleUpdate('city', area.administrative_division_level_2_name);
                                handleUpdate('district', area.administrative_division_level_3_name);
                                setAreaSearchInput(`${area.name}, ${area.administrative_division_level_2_name}`);
                              }}
                            >
                              <div className="font-bold text-slate-700">{area.name}</div>
                              <div className="text-xs text-slate-500">{area.administrative_division_level_2_name}, {area.administrative_division_level_1_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.origin_area_id && (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-md">
                        Selected: {formData.district}, {formData.city}, {formData.province}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Shipping area</label>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Select Shipping Area (District/City)</label>
                    <div className="relative">
                      <Input 
                        placeholder="Search destination area..."
                        value={shippingAreaSearchInput}
                        onChange={(e) => {
                          setShippingAreaSearchInput(e.target.value);
                          searchArea(e.target.value);
                        }}
                        className="mb-2"
                        disabled={formData.all_shipping_area}
                      />
                      {isSearchingArea && <div className="absolute right-3 top-2.5"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>}
                      {areas.length > 0 && shippingAreaSearchInput && !formData.all_shipping_area && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {areas.map(area => (
                            <div 
                              key={area.id} 
                              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm"
                              onClick={() => {
                                const currentAreas = formData.shipping_areas || [];
                                if(!currentAreas.find(a => a.id === area.id)) {
                                  handleUpdate('shipping_areas', [...currentAreas, area]);
                                }
                                setShippingAreaSearchInput('');
                              }}
                            >
                              <div className="font-bold text-slate-700">{area.name}</div>
                              <div className="text-xs text-slate-500">{area.administrative_division_level_2_name}, {area.administrative_division_level_1_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected shipping areas tags */}
                    {!formData.all_shipping_area && formData.shipping_areas && formData.shipping_areas.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.shipping_areas.map(area => (
                          <div key={area.id} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">
                            {area.name} 
                            <button onClick={() => handleUpdate('shipping_areas', formData.shipping_areas.filter(a => a.id !== area.id))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input 
                        type="checkbox" 
                        checked={formData.all_shipping_area || false}
                        onChange={(e) => handleUpdate('all_shipping_area', e.target.checked)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">All Area</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Shipping Methods</label>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Select Couriers</label>
                    
                    {!formData.all_shipping_methods && (
                      <div className="mb-3 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50">
                        {isLoadingCouriers ? <div className="text-xs text-slate-400 p-2">Loading couriers...</div> : couriers.map(courier => (
                          <label key={courier.courier_code} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox"
                              className="rounded text-green-500 focus:ring-green-500"
                              checked={(formData.selected_couriers || []).includes(courier.courier_code)}
                              onChange={(e) => {
                                let selected = formData.selected_couriers || [];
                                if(e.target.checked) selected = [...selected, courier.courier_code];
                                else selected = selected.filter(c => c !== courier.courier_code);
                                handleUpdate('selected_couriers', selected);
                              }}
                            />
                            <span className="text-sm text-slate-700">{courier.courier_name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.all_shipping_methods || false}
                        onChange={(e) => handleUpdate('all_shipping_methods', e.target.checked)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">All Method</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-slate-600">Custom courier</div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.custom_courier_enabled || false} onChange={(e) => handleUpdate('custom_courier_enabled', e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    {formData.custom_courier_enabled && (
                      <Input 
                        placeholder="Custom Courier fee"
                        value={formData.custom_courier_fee || ''}
                        onChange={(e) => handleUpdate('custom_courier_fee', e.target.value)}
                      />
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Advance Option */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Advance Option</h3>
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    Release Time <Info className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Set Release Time</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.set_release_time || false} onChange={(e) => handleUpdate('set_release_time', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                {formData.set_release_time && (
                  <div className="mt-2">
                    <Input 
                      type="datetime-local" 
                      value={formData.release_time || ''} 
                      onChange={(e) => handleUpdate('release_time', e.target.value)}
                    />
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    Fee Rp. 600/transaction <Info className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Enable Whatsapp notification</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.enable_whatsapp_notification || false} onChange={(e) => handleUpdate('enable_whatsapp_notification', e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    Custom Message <Info className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Custom message on customer email</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.custom_message_email || false} onChange={(e) => handleUpdate('custom_message_email', e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                  {formData.custom_message_email && (
                    <div className="mt-2">
                      <textarea 
                        className="w-full text-sm border border-slate-300 rounded-md focus:ring-green-500 py-2 px-3 outline-none focus:border-green-500"
                        rows="3"
                        placeholder="Terima kasih atas pesanan Anda..."
                        value={formData.custom_message_text || ''}
                        onChange={(e) => handleUpdate('custom_message_text', e.target.value)}
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Block Layout */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Block Layout</h3>
              <div className="grid grid-cols-4 gap-4">
                <div 
                  className={`border-2 rounded-lg p-2 cursor-pointer text-center ${(!formData.block_layout || formData.block_layout === 'default') ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}
                  onClick={() => handleUpdate('block_layout', 'default')}
                >
                  <div className="bg-slate-200 h-16 rounded mb-2"></div>
                  <span className="text-xs text-slate-600">Default</span>
                </div>
                <div 
                  className={`border-2 rounded-lg p-2 cursor-pointer text-center ${formData.block_layout === 'grid' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}
                  onClick={() => handleUpdate('block_layout', 'grid')}
                >
                  <div className="grid grid-cols-2 gap-1 h-16 mb-2">
                    <div className="bg-slate-200 rounded"></div>
                    <div className="bg-slate-200 rounded"></div>
                    <div className="bg-slate-200 rounded"></div>
                    <div className="bg-slate-200 rounded"></div>
                  </div>
                  <span className="text-xs text-slate-600">Grid</span>
                </div>
                <div 
                  className={`border-2 rounded-lg p-2 cursor-pointer text-center ${formData.block_layout === 'large_image' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}
                  onClick={() => handleUpdate('block_layout', 'large_image')}
                >
                  <div className="bg-slate-300 h-16 rounded mb-2"></div>
                  <span className="text-xs text-slate-600">Large Image</span>
                </div>
                <div 
                  className={`border-2 rounded-lg p-2 cursor-pointer text-center relative ${formData.block_layout === 'compact' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}
                  onClick={() => handleUpdate('block_layout', 'compact')}
                >
                  <div className="bg-slate-200 h-16 rounded mb-2 flex items-center justify-center text-[8px] text-slate-400">CTA</div>
                  <span className="text-xs text-slate-600">Compact</span>
                  <div className="text-[8px] text-green-500 mt-1">Upgrade To PRO</div>
                </div>
              </div>
            </div>

            {/* Question for Customer */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-500 mb-2 uppercase tracking-wider text-sm">Question for Customer</h3>
              <p className="text-xs text-slate-500 mb-4">Custom field for your customer to fill in during checkout</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-700">Main Question</div>
                  <div className="text-sm font-medium text-slate-700">Required</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.ask_name || false}
                      onChange={(e) => handleUpdate('ask_name', e.target.checked)}
                      className="rounded text-green-500 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">Name</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.require_name || false} onChange={(e) => handleUpdate('require_name', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.ask_phone !== false}
                      onChange={(e) => handleUpdate('ask_phone', e.target.checked)}
                      className="rounded text-green-500 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">Phone</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.require_phone !== false} onChange={(e) => handleUpdate('require_phone', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400">Required to activate follow up text feature</p>

                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPhysical ? true : (formData.ask_address || false)}
                      disabled={isPhysical}
                      onChange={(e) => handleUpdate('ask_address', e.target.checked)}
                      className="rounded text-green-500 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">Address {isPhysical && <span className="text-xs text-slate-400">(Required for physical product)</span>}</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isPhysical ? true : (formData.require_address || false)} disabled={isPhysical} onChange={(e) => handleUpdate('require_address', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Dynamic Custom Questions */}
                {formData.custom_questions && formData.custom_questions.map((cq, idx) => (
                  <div key={cq.id} className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Input 
                        placeholder="Question Label (e.g. T-Shirt Size)" 
                        value={cq.label || ''} 
                        onChange={(e) => {
                          const newQ = [...formData.custom_questions];
                          newQ[idx] = { ...newQ[idx], label: e.target.value };
                          handleUpdate('custom_questions', newQ);
                        }}
                        className="text-sm h-10 w-full"
                      />
                      <button 
                        onClick={() => {
                          const newQ = formData.custom_questions.filter((_, i) => i !== idx);
                          handleUpdate('custom_questions', newQ);
                        }}
                        className="ml-3 p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-slate-500 font-medium">Required</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={cq.required || false} onChange={(e) => {
                          const newQ = [...formData.custom_questions];
                          newQ[idx] = { ...newQ[idx], required: e.target.checked };
                          handleUpdate('custom_questions', newQ);
                        }} />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-center border-t border-slate-100 mt-2">
                  <button 
                    onClick={() => {
                      const current = formData.custom_questions || [];
                      handleUpdate('custom_questions', [...current, { id: Date.now().toString(), label: '', required: false }]);
                    }}
                    className="text-sm font-bold text-green-500 hover:text-green-600 flex items-center gap-1 justify-center w-full"
                  >
                    <Plus className="w-4 h-4" /> Add Another Question
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      {/* Sticky Footer */}
      <div className="bg-white border-t border-slate-200 p-4 px-6 flex items-center justify-end gap-3 shrink-0">
         <button onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors">
            Cancel
         </button>
         <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors">
            Save
         </button>
      </div>
    </div>
    </div>
  );
}
