import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { 
  ArrowLeft, Save, Plus, Trash2, Settings, 
  Type, AlignLeft, CheckSquare, CircleDot, ChevronDown, Calendar, Eye, LayoutTemplate,
  FileText, Palette, Send, MoreVertical, Inbox, Download, BarChart3, ArrowUp, ArrowDown, ChevronLeft, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const FIELD_TYPES = [
  { id: 'short_text', label: 'Teks Singkat', icon: Type },
  { id: 'long_text', label: 'Paragraf', icon: AlignLeft },
  { id: 'radio', label: 'Pilihan Ganda', icon: CircleDot },
  { id: 'checkbox', label: 'Kotak Centang', icon: CheckSquare },
  { id: 'select', label: 'Dropdown', icon: ChevronDown },
  { id: 'date', label: 'Tanggal', icon: Calendar },
  { id: 'page_break', label: 'Bagian Baru', icon: LayoutTemplate },
];

export default function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'responses', 'settings'
  const [activeFieldIndex, setActiveFieldIndex] = useState(null);
  const [activeQuizFieldIndex, setActiveQuizFieldIndex] = useState(null);
  const [responseView, setResponseView] = useState('summary'); // 'summary', 'individual'
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (formError) throw formError;
      setForm(formData);

      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

      if (fieldsError) throw fieldsError;
      
      if (!fieldsData || fieldsData.length === 0) {
        setFields([{
          id: `temp_${Date.now()}`,
          isNew: true,
          type: 'short_text',
          label: '',
          required: false,
          options: ['Opsi 1'],
          order_index: 0
        }]);
      } else {
        setFields(fieldsData);
      }

      // Fetch responses
      const { data: respData, error: respError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', id)
        .order('created_at', { ascending: false });

      if (!respError) setResponses(respData || []);

    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
      navigate('/dashboard/forms');
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    const newIndex = activeFieldIndex !== null ? activeFieldIndex + 1 : fields.length;
    const newFields = [...fields];
    newFields.splice(newIndex, 0, {
      id: `temp_${Date.now()}`,
      isNew: true,
      type: 'radio',
      label: '',
      required: false,
      options: ['Opsi 1'],
      order_index: newIndex
    });
    setFields(newFields);
    setActiveFieldIndex(newIndex);
  };

  const addPageBreak = () => {
    const newIndex = activeFieldIndex !== null ? activeFieldIndex + 1 : fields.length;
    const newFields = [...fields];
    newFields.splice(newIndex, 0, {
      id: `temp_${Date.now()}`,
      isNew: true,
      type: 'page_break',
      label: 'Bagian Baru',
      placeholder: '',
      required: false,
      options: [],
      order_index: newIndex
    });
    setFields(newFields);
    setActiveFieldIndex(newIndex);
  };

  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    if (activeFieldIndex === index) {
      setActiveFieldIndex(null);
    } else if (activeFieldIndex > index) {
      setActiveFieldIndex(activeFieldIndex - 1);
    }
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const moveField = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
      setFields(newFields);
      setActiveFieldIndex(index - 1);
    } else if (direction === 'down' && index < fields.length - 1) {
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;
      setFields(newFields);
      setActiveFieldIndex(index + 1);
    }
  };

  const handleSettingChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        [key]: value
      }
    }));
  };

  const saveForm = async () => {
    setIsSaving(true);
    try {
      const { error: formError } = await supabase
        .from('forms')
        .update({
          title: form.title,
          description: form.description,
          status: form.status,
          theme_color: form.theme_color,
          settings: form.settings || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (formError) throw formError;

      // Get current fields in DB
      const { data: existingFields } = await supabase.from('form_fields').select('id').eq('form_id', id);
      const currentIds = fields.filter(f => !f.isNew && !f.id.startsWith('temp_')).map(f => f.id);
      
      const idsToDelete = existingFields?.map(f => f.id).filter(oldId => !currentIds.includes(oldId)) || [];
      
      if (idsToDelete.length > 0) {
        await supabase.from('form_fields').delete().in('id', idsToDelete);
      }

      if (fields.length > 0) {
        const fieldsToUpsert = fields.map((f, idx) => {
          const fieldData = {
            form_id: id,
            type: f.type,
            label: f.label || 'Pertanyaan Tanpa Judul',
            placeholder: f.placeholder,
            required: f.required,
            options: f.options || [],
            settings: f.settings || {},
            order_index: idx
          };
          if (!f.isNew && !f.id.startsWith('temp_')) {
            fieldData.id = f.id;
          }
          return fieldData;
        });

        const { error: upsertError } = await supabase
          .from('form_fields')
          .upsert(fieldsToUpsert, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      }

      toast.success("Perubahan tersimpan");
      fetchData(); 
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan formulir");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResponse = async (responseId) => {
    if (!confirm("Hapus jawaban ini permanen?")) return;
    try {
      const { error } = await supabase.from('form_responses').delete().eq('id', responseId);
      if (error) throw error;
      setResponses(responses.filter(r => r.id !== responseId));
      toast.success("Jawaban dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus jawaban");
    }
  };

  const exportCSV = () => {
    if (responses.length === 0) return;
    const hasEmail = form?.settings?.collect_email;
    const headers = ['Waktu Submit', ...(hasEmail ? ['Email'] : []), ...fields.filter(f => f.type !== 'page_break').map(f => f.label.replace(/,/g, ''))];
    const rows = responses.map(resp => {
      const date = new Date(resp.created_at).toLocaleString('id-ID');
      const row = [date];
      if (hasEmail) row.push(resp.respondent_email || '');
      fields.filter(f => f.type !== 'page_break').forEach(field => {
        let answer = resp.answers[field.id] || '';
        if (Array.isArray(answer)) answer = answer.join('; ');
        row.push(`"${String(answer).replace(/"/g, '""')}"`);
      });
      return row;
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Responses_${form?.title || 'Form'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSummaryChart = (field, themeColor) => {
    const counts = {};
    let totalAnswers = 0;
    
    responses.forEach(resp => {
      let ans = resp.answers[field.id];
      if (ans) {
        if (Array.isArray(ans)) {
          ans.forEach(a => {
            counts[a] = (counts[a] || 0) + 1;
            totalAnswers++;
          });
        } else {
          counts[ans] = (counts[ans] || 0) + 1;
          totalAnswers++;
        }
      }
    });

    if (totalAnswers === 0) {
      return <div className="text-sm text-slate-500 italic py-4">Belum ada jawaban</div>;
    }

    const data = Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (field.type === 'radio' || field.type === 'select') {
      return (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="value" fill={themeColor} radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Text types
    return (
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
        {responses.map(resp => {
          const ans = resp.answers[field.id];
          if (!ans) return null;
          return (
            <div key={resp.id} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 border border-slate-100">
              {ans}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-purple-600 rounded-full"></div>
      </div>
    );
  }

  const themeColor = form.theme_color || '#673ab7'; // Default Google Forms purple
  const bgColor = themeColor + '15'; // 15% opacity for background

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <SEO title={`${form.title || 'Formulir Tanpa Judul'} - RYZLink`} />
      
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm flex flex-col pt-3">
        <div className="flex items-center justify-between px-4 pb-2">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard/forms')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center text-purple-600">
              <FileText className="w-6 h-6" style={{ color: themeColor }} />
            </div>
            <input 
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({...form, title: e.target.value})}
              className="font-medium text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none px-1 py-0.5 w-full max-w-xs transition-colors"
              placeholder="Formulir Tanpa Judul"
            />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block overflow-hidden">
              <Palette className="w-5 h-5" />
              <input 
                type="color" 
                value={form.theme_color || '#673ab7'}
                onChange={(e) => setForm({...form, theme_color: e.target.value})}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                title="Sesuaikan Tema"
              />
            </button>
            <a 
              href={`/f/${form.id}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
              title="Pratinjau"
            >
              <Eye className="w-5 h-5" />
            </a>
            <button
              onClick={saveForm}
              disabled={isSaving}
              className="flex items-center gap-2 text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm disabled:opacity-70"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Kirim'}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-2 border border-slate-300 overflow-hidden">
              <span className="text-sm font-bold text-slate-500">{user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex justify-center px-4">
          <div className="flex gap-1 sm:gap-8">
            <button 
              className={`px-4 pb-3 pt-1 text-sm font-medium transition-colors border-b-4 ${activeTab === 'questions' ? 'text-slate-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
              style={{ borderBottomColor: activeTab === 'questions' ? themeColor : 'transparent' }}
              onClick={() => setActiveTab('questions')}
            >
              Pertanyaan
            </button>
            <button 
              className={`px-4 pb-3 pt-1 text-sm font-medium transition-colors border-b-4 flex items-center gap-2 ${activeTab === 'responses' ? 'text-slate-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
              style={{ borderBottomColor: activeTab === 'responses' ? themeColor : 'transparent' }}
              onClick={() => setActiveTab('responses')}
            >
              Jawaban
              {responses.length > 0 && (
                <span className="bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{responses.length}</span>
              )}
            </button>
            <button 
              className={`px-4 pb-3 pt-1 text-sm font-medium transition-colors border-b-4 ${activeTab === 'settings' ? 'text-slate-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
              style={{ borderBottomColor: activeTab === 'settings' ? themeColor : 'transparent' }}
              onClick={() => setActiveTab('settings')}
            >
              Setelan
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-32 pb-32 px-4 max-w-3xl mx-auto relative flex items-start gap-4 justify-center">
        
        {/* TAB: PERTANYAAN */}
        {activeTab === 'questions' && (
          <div className="w-full flex-1 space-y-4">
            
            {/* Title & Desc Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden relative transition-shadow hover:shadow-lg">
              <div className="h-3 w-full" style={{ backgroundColor: themeColor }}></div>
              <div className="p-6 md:p-8">
                <input 
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full text-3xl font-normal text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:border-b-2 outline-none pb-1 transition-colors placeholder-slate-400"
                  placeholder="Formulir Tanpa Judul"
                />
                <textarea 
                  value={form.description || ''}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full mt-4 text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 outline-none pb-1 transition-colors resize-none placeholder-slate-500"
                  placeholder="Deskripsi formulir"
                  rows={2}
                />
              </div>
            </div>

            {/* Questions List */}
            {fields.map((field, index) => {
              const isActive = activeFieldIndex === index;
              return (
                <div 
                  key={field.id} 
                  onClick={() => setActiveFieldIndex(index)}
                  className={`bg-white rounded-2xl transition-all relative cursor-text group/card ${isActive ? 'shadow-lg border-transparent' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}
                >
                  {/* Left Active Accent */}
                  {isActive && (
                    <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl transition-all" style={{ backgroundColor: themeColor }}></div>
                  )}

                  <div className={`p-6 sm:p-8 ${isActive ? 'pt-8' : ''}`}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
                      <div className={`flex-1 w-full ${isActive ? 'bg-slate-50/50 p-1 rounded-lg' : ''}`}>
                        <input 
                          type="text"
                          value={field.label || ''}
                          onChange={(e) => updateField(index, 'label', e.target.value)}
                          className={`w-full font-medium text-slate-800 bg-transparent outline-none transition-all placeholder-slate-500 ${isActive ? 'text-base hover:bg-slate-100 focus:bg-slate-100 border-b border-slate-400 focus:border-slate-600 focus:border-b-2 px-3 py-3' : 'text-base border-b border-transparent py-1'}`}
                          placeholder={field.type === 'page_break' ? "Bagian Tanpa Judul" : "Pertanyaan Tanpa Judul"}
                          autoFocus={field.isNew}
                        />
                      </div>
                      
                      {isActive && (
                        <div className="w-full sm:w-56 shrink-0 mt-1 sm:mt-0">
                          <div className="relative border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors">
                            <select 
                              value={field.type}
                              onChange={(e) => updateField(index, 'type', e.target.value)}
                              className="w-full appearance-none bg-transparent px-4 py-3 pl-10 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                              {FIELD_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                              ))}
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                              {(() => {
                                const IconComponent = FIELD_TYPES.find(t => t.id === field.type)?.icon;
                                return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                              })()}
                            </div>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>

                    {field.type === 'page_break' && (
                      <div className="pl-3 py-2">
                        <textarea
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                          className={`w-full text-sm text-slate-600 bg-transparent outline-none transition-all resize-none placeholder-slate-500 ${isActive ? 'border-b border-slate-300 focus:border-slate-500 focus:border-b-2 py-2' : 'border-none py-1'}`}
                          placeholder="Deskripsi (opsional)"
                          rows={1}
                          readOnly={!isActive}
                        />
                      </div>
                    )}

                    {/* Field Specific Inputs */}
                    {field.type !== 'page_break' && activeQuizFieldIndex !== index && (
                      <div className="py-2">
                        {(field.type === 'short_text' || field.type === 'email' || field.type === 'date') && (
                          <div className="text-slate-500 border-b border-slate-300 border-dotted pb-2 w-1/2 text-sm">
                            {field.type === 'date' ? 'Bulan, hari, tahun' : 'Teks jawaban singkat'}
                          </div>
                        )}

                        {field.type === 'long_text' && (
                          <div className="text-slate-500 border-b border-slate-300 border-dotted pb-6 w-3/4 text-sm">
                            Teks jawaban panjang
                          </div>
                        )}

                        {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') && (
                          <div className="space-y-3">
                            {field.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3 group/opt">
                                {field.type === 'radio' && <CircleDot className="w-5 h-5 text-slate-300 shrink-0" />}
                                {field.type === 'checkbox' && <CheckSquare className="w-5 h-5 text-slate-300 shrink-0" />}
                                {field.type === 'select' && <span className="text-sm text-slate-500 font-normal w-5 text-center shrink-0">{optIndex + 1}.</span>}
                                
                                <input 
                                  type="text"
                                  value={opt || ''}
                                  onChange={(e) => {
                                    const newOpts = [...field.options];
                                    newOpts[optIndex] = e.target.value;
                                    updateField(index, 'options', newOpts);
                                  }}
                                  className={`flex-1 bg-transparent outline-none text-sm transition-all ${isActive ? 'border-b hover:border-slate-300 focus:border-slate-600 focus:border-b-2 py-1 border-transparent' : 'border-b border-transparent py-1 text-slate-800'}`}
                                  placeholder={`Opsi ${optIndex + 1}`}
                                  readOnly={!isActive}
                                />
                                {isActive && (
                                  <button 
                                    onClick={() => {
                                      const newOpts = [...field.options];
                                      newOpts.splice(optIndex, 1);
                                      updateField(index, 'options', newOpts);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 p-2 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                  >
                                    <span className="text-xl leading-none">&times;</span>
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            {isActive && (
                              <div className="flex items-center gap-3 mt-2">
                                {field.type === 'radio' && <CircleDot className="w-5 h-5 text-slate-300" />}
                                {field.type === 'checkbox' && <CheckSquare className="w-5 h-5 text-slate-300" />}
                                {field.type === 'select' && <span className="text-sm text-slate-400 font-normal w-5 text-center">{field.options.length + 1}.</span>}
                                <div className="flex items-center text-sm">
                                  <input 
                                    type="text"
                                    readOnly
                                    className="bg-transparent border-b border-transparent text-sm py-1 w-24 cursor-pointer text-slate-400 hover:border-slate-300 transition-all"
                                    placeholder="Tambahkan opsi"
                                    onClick={() => updateField(index, 'options', [...field.options, `Opsi ${field.options.length + 1}`])}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quiz Editor Mode */}
                    {activeQuizFieldIndex === index && (
                      <div className="py-4 border-t border-slate-100 mt-4">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-green-600" />
                            Pilih jawaban yang benar
                          </h4>
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <span className="text-sm font-medium text-slate-600">Poin:</span>
                            <input
                              type="number"
                              min="0"
                              value={field.settings?.points || 0}
                              onChange={(e) => {
                                const newSettings = { ...(field.settings || {}), points: parseInt(e.target.value) || 0 };
                                updateField(index, 'settings', newSettings);
                              }}
                              className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-[#0b5cff]"
                            />
                          </div>
                        </div>

                        {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') && (
                          <div className="space-y-3">
                            {field.options.map((opt, optIndex) => {
                              const isCorrect = field.settings?.correct_answers?.includes(opt);
                              return (
                                <div 
                                  key={optIndex} 
                                  onClick={() => {
                                    const currAnswers = field.settings?.correct_answers || [];
                                    let newAnswers;
                                    if (field.type === 'radio' || field.type === 'select') {
                                      // Single choice
                                      newAnswers = [opt];
                                    } else {
                                      // Multiple choice (checkbox)
                                      if (isCorrect) {
                                        newAnswers = currAnswers.filter(a => a !== opt);
                                      } else {
                                        newAnswers = [...currAnswers, opt];
                                      }
                                    }
                                    const newSettings = { ...(field.settings || {}), correct_answers: newAnswers };
                                    updateField(index, 'settings', newSettings);
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isCorrect ? 'border-green-500 bg-green-50/30' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {field.type === 'radio' && <CircleDot className="w-5 h-5 text-slate-400" />}
                                    {field.type === 'checkbox' && <CheckSquare className="w-5 h-5 text-slate-400" />}
                                    {field.type === 'select' && <span className="text-sm text-slate-500 font-normal w-5 text-center">{optIndex + 1}.</span>}
                                    <span className={`text-sm ${isCorrect ? 'text-green-800 font-medium' : 'text-slate-700'}`}>{opt || `Opsi ${optIndex + 1}`}</span>
                                  </div>
                                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {field.type === 'short_text' && (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">Ketik jawaban yang benar (opsional). Anda dapat memberikan lebih dari satu opsi jawaban yang benar.</p>
                            {(field.settings?.correct_answers || []).map((ans, ansIdx) => (
                              <div key={ansIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ans}
                                  onChange={(e) => {
                                    const newAnswers = [...(field.settings?.correct_answers || [])];
                                    newAnswers[ansIdx] = e.target.value;
                                    updateField(index, 'settings', { ...(field.settings || {}), correct_answers: newAnswers });
                                  }}
                                  className="flex-1 bg-transparent border-b border-slate-300 hover:border-slate-400 focus:border-[#0b5cff] focus:border-b-2 outline-none text-sm py-2 px-1"
                                />
                                <button
                                  onClick={() => {
                                    const newAnswers = [...(field.settings?.correct_answers || [])];
                                    newAnswers.splice(ansIdx, 1);
                                    updateField(index, 'settings', { ...(field.settings || {}), correct_answers: newAnswers });
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <span className="text-lg leading-none">&times;</span>
                                </button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                onClick={() => {
                                  const newAnswers = [...(field.settings?.correct_answers || []), ''];
                                  updateField(index, 'settings', { ...(field.settings || {}), correct_answers: newAnswers });
                                }}
                                placeholder="Tambahkan jawaban benar"
                                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 outline-none text-sm py-2 px-1 text-slate-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Toolbar */}
                    {isActive && activeQuizFieldIndex !== index && (
                      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end items-center gap-4">
                        {form.settings?.is_quiz && field.type !== 'page_break' && field.type !== 'long_text' && field.type !== 'date' && (
                          <>
                            <button
                              onClick={() => setActiveQuizFieldIndex(index)}
                              className="text-[#0b5cff] hover:bg-blue-50 font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm mr-auto"
                              style={{ color: themeColor }}
                            >
                              <CheckSquare className="w-4 h-4" />
                              Kunci Jawaban
                            </button>
                          </>
                        )}
                        <div className={`flex items-center gap-1 ${!(form.settings?.is_quiz && field.type !== 'page_break' && field.type !== 'long_text' && field.type !== 'date') ? 'mr-auto' : ''}`}>
                          <button 
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Pindah ke Atas"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Pindah ke Bawah"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeField(index)}
                          className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        {field.type !== 'page_break' && <div className="w-px h-8 bg-slate-300"></div>}
                        
                        {field.type !== 'page_break' && (
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <label className="cursor-pointer font-medium">Wajib diisi</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={field.required}
                                onChange={(e) => updateField(index, 'required', e.target.checked)}
                              />
                              <div className="w-9 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:-top-0.5 after:-left-0.5 after:bg-white after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all" style={field.required ? {backgroundColor: themeColor + '80'} : {}}>
                                <div className={`absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full shadow-md transition-all ${field.required ? 'translate-x-[18px]' : 'bg-white'}`} style={field.required ? {backgroundColor: themeColor} : {}}></div>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Quiz Editor Footer */}
                    {isActive && activeQuizFieldIndex === index && (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => setActiveQuizFieldIndex(null)}
                          className="bg-[#0b5cff] text-white px-5 py-2 rounded-md font-medium text-sm transition-opacity hover:opacity-90"
                          style={{ backgroundColor: themeColor }}
                        >
                          Selesai
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: JAWABAN */}
        {activeTab === 'responses' && (
          <div className="w-full flex-1 space-y-4">
            {responses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center py-16 text-slate-500">
                <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Menunggu tanggapan</p>
              </div>
            ) : (
              <>
                {/* Responses Sub-navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-3xl font-normal text-slate-800">{responses.length} tanggapan</h2>
                    <button
                      onClick={exportCSV}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                      title="Download CSV"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex justify-center border-b border-slate-200">
                    <div className="flex gap-4">
                      <button 
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-4 ${responseView === 'summary' ? 'text-slate-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
                        style={{ borderBottomColor: responseView === 'summary' ? themeColor : 'transparent' }}
                        onClick={() => setResponseView('summary')}
                      >
                        Ringkasan
                      </button>
                      <button 
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-4 ${responseView === 'individual' ? 'text-slate-800' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
                        style={{ borderBottomColor: responseView === 'individual' ? themeColor : 'transparent' }}
                        onClick={() => setResponseView('individual')}
                      >
                        Individual
                      </button>
                    </div>
                  </div>
                  
                  {responseView === 'individual' && (
                    <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setCurrentResponseIndex(Math.max(0, currentResponseIndex - 1))}
                          disabled={currentResponseIndex === 0}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-full disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                          {currentResponseIndex + 1} dari {responses.length}
                        </span>
                        <button 
                          onClick={() => setCurrentResponseIndex(Math.min(responses.length - 1, currentResponseIndex + 1))}
                          disabled={currentResponseIndex === responses.length - 1}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-full disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500">
                        Dikirim: {new Date(responses[currentResponseIndex].created_at).toLocaleString('id-ID')}
                      </div>
                      <button 
                        onClick={() => {
                          deleteResponse(responses[currentResponseIndex].id);
                          if (currentResponseIndex >= responses.length - 1) {
                            setCurrentResponseIndex(Math.max(0, currentResponseIndex - 1));
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Hapus tanggapan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary View */}
                {responseView === 'summary' && (
                  <div className="space-y-6">
                    {fields.filter(f => f.type !== 'page_break').map(field => (
                      <div key={field.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h3 className="text-lg font-normal text-slate-800 mb-2">{field.label || 'Pertanyaan Tanpa Judul'}</h3>
                        <p className="text-sm text-slate-500 mb-6">{responses.filter(r => r.answers[field.id]).length} tanggapan</p>
                        {renderSummaryChart(field, themeColor)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Individual View */}
                {responseView === 'individual' && (
                  <div className="space-y-4">
                    {/* Render Email if collected */}
                    {form.settings?.collect_email && (
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h3 className="text-base font-normal text-slate-800 mb-4">Email</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[42px] text-sm text-slate-800">
                          {responses[currentResponseIndex].respondent_email || <span className="text-slate-400 italic">Kosong</span>}
                        </div>
                      </div>
                    )}
                    
                    {fields.map(field => {
                      if (field.type === 'page_break') {
                        return (
                          <div key={field.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mt-6">
                            <h3 className="text-2xl font-normal text-slate-800">{field.label || 'Bagian Tanpa Judul'}</h3>
                            {field.placeholder && <p className="text-slate-600 mt-2">{field.placeholder}</p>}
                          </div>
                        );
                      }

                      let ans = responses[currentResponseIndex].answers[field.id];
                      
                      return (
                        <div key={field.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                          <h3 className="text-base font-normal text-slate-800 mb-4">{field.label || 'Pertanyaan Tanpa Judul'}</h3>
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[42px] text-sm text-slate-800">
                            {Array.isArray(ans) ? (
                              ans.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                  {ans.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                              ) : <span className="text-slate-400 italic">Kosong</span>
                            ) : (
                              ans ? ans : <span className="text-slate-400 italic">Kosong</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: PENGATURAN */}
        {activeTab === 'settings' && (
          <div className="w-full flex-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-normal text-slate-800">Setelan</h2>
              </div>
              
              <div className="divide-y divide-slate-100">
                {/* Kuis Section */}
                <div className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-800 text-base">Jadikan ini sebagai kuis</h3>
                      <p className="text-sm text-slate-500 mt-1">Tetapkan nilai poin, setel jawaban, dan berikan masukan otomatis</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={form.settings?.is_quiz || false}
                        onChange={(e) => handleSettingChange('is_quiz', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all" style={form.settings?.is_quiz ? {backgroundColor: themeColor} : {}}></div>
                    </label>
                  </div>
                </div>

                {/* Tanggapan Section */}
                <div className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-800 text-base">Tanggapan</h3>
                      <p className="text-sm text-slate-500 mt-1">Kelola cara tanggapan dikumpulkan dan dilindungi</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700">Kumpulkan alamat email</h4>
                        <p className="text-xs text-slate-500 mt-1">Wajibkan responden memasukkan alamat email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={form.settings?.collect_email || false}
                          onChange={(e) => handleSettingChange('collect_email', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all" style={form.settings?.collect_email ? {backgroundColor: themeColor} : {}}></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700">Terima tanggapan</h4>
                        <p className="text-xs text-slate-500 mt-1">Mengizinkan orang mengisi formulir ini.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={form.status}
                          onChange={(e) => setForm({...form, status: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all" style={form.status ? {backgroundColor: themeColor} : {}}></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Presentasi Section */}
                <div className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-full">
                      <h3 className="font-medium text-slate-800 text-base">Presentasi</h3>
                      <p className="text-sm text-slate-500 mt-1 mb-6">Kelola cara formulir dan tanggapan disajikan</p>

                      <div className="pl-4 border-l-2 border-slate-200 space-y-2 w-full">
                        <h4 className="text-sm font-medium text-slate-700">Pesan konfirmasi</h4>
                        <input 
                          type="text"
                          value={form.settings?.confirmation_message || ''}
                          onChange={(e) => handleSettingChange('confirmation_message', e.target.value)}
                          placeholder="Tanggapan Anda telah direkam."
                          className="w-full text-sm text-slate-800 bg-transparent border-b border-slate-300 focus:border-slate-600 outline-none pb-1 transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-1">Ditampilkan setelah responden menekan tombol kirim</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Toolbar */}
        {activeTab === 'questions' && (
          <div className="hidden lg:flex flex-col bg-white rounded-full shadow-lg border border-slate-100 p-2 gap-3 sticky top-[150px] shrink-0 w-14 items-center transition-all hover:shadow-xl">
            <button 
              onClick={addField}
              className="p-2.5 text-slate-600 hover:text-white rounded-full transition-all hover:scale-105"
              style={{ hover: { backgroundColor: themeColor } }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = themeColor; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
              title="Tambahkan Pertanyaan"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={addPageBreak}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="Tambahkan Bagian"
            >
              <LayoutTemplate className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile floating action bar */}
        {activeTab === 'questions' && (
          <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            <button 
              onClick={addPageBreak}
              className="w-12 h-12 bg-white text-slate-700 rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
            >
              <LayoutTemplate className="w-5 h-5" />
            </button>
            <button 
              onClick={addField}
              className="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
              style={{ backgroundColor: themeColor }}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
