import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { 
  ArrowLeft, Save, Plus, Trash2, Settings, 
  Type, AlignLeft, CheckSquare, CircleDot, ChevronDown, Calendar, Eye, LayoutTemplate,
  FileText, Palette, Send, MoreVertical, Inbox, Download, BarChart3, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, CheckCircle2,
  UploadCloud, MoreHorizontal, Star, Grid3x3, LayoutGrid, Clock, Folder, Undo, Redo, Link, UserPlus, SlidersHorizontal
} from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoadingSpinner from '@/components/LoadingSpinner';

const FIELD_TYPES = [
  { id: 'short_text', label: 'Teks Singkat', icon: Type },
  { id: 'long_text', label: 'Paragraf', icon: AlignLeft },
  { id: 'radio', label: 'Pilihan Ganda', icon: CircleDot },
  { id: 'checkbox', label: 'Kotak Centang', icon: CheckSquare },
  { id: 'select', label: 'Dropdown', icon: ChevronDown },
  { id: 'file_upload', label: 'Upload file', icon: UploadCloud },
  { id: 'linear_scale', label: 'Skala linier', icon: MoreHorizontal },
  { id: 'rating', label: 'Rating', icon: Star },
  { id: 'grid_radio', label: 'Kisi pilihan ganda', icon: Grid3x3 },
  { id: 'grid_checkbox', label: 'Petak kotak centang', icon: LayoutGrid },
  { id: 'date', label: 'Tanggal', icon: Calendar },
  { id: 'time', label: 'Waktu', icon: Clock },
  { id: 'page_break', label: 'Bagian Baru', icon: LayoutTemplate },
];

const THEME_COLORS = [
  '#db4437', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#4285f4',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

const formBuilderCache = new Map();

const AutoResizeTextarea = ({ value, onChange, className, placeholder, onFocus, onBlur, ...props }) => {
  const ref = useRef(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      const style = window.getComputedStyle(ref.current);
      const borderHeight = parseFloat(style.borderTopWidth || 0) + parseFloat(style.borderBottomWidth || 0);
      ref.current.style.height = (ref.current.scrollHeight + borderHeight + 1) + 'px'; // +1 for safety with descenders
    }
  };

  useEffect(() => {
    resize();
  }, [value, className]);
  
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        if (onChange) onChange(e);
        resize();
      }}
      onFocus={(e) => {
        resize();
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        resize();
        if (onBlur) onBlur(e);
      }}
      className={`${className} resize-none overflow-hidden`}
      placeholder={placeholder}
      rows={1}
      {...props}
    />
  );
};

export default function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [form, setForm] = useState(formBuilderCache.get(id)?.form || {});
  const [fields, setFields] = useState(formBuilderCache.get(id)?.fields || []);
  const [responses, setResponses] = useState(formBuilderCache.get(id)?.responses || []);
  
  const [isLoading, setIsLoading] = useState(!formBuilderCache.has(id));
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname.endsWith('responses') ? 'responses' : 'questions'); // 'questions', 'responses', 'settings'
  const [activeFieldIndex, setActiveFieldIndex] = useState(null);
  const [activeQuizFieldIndex, setActiveQuizFieldIndex] = useState(null);
  const [responseView, setResponseView] = useState('summary'); // 'summary', 'individual'
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [deleteResponseModalOpen, setDeleteResponseModalOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);

  // Undo/Redo state
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const saveHistory = (currentFields = fields, currentForm = form) => {
    setHistory(prev => [...prev, { fields: JSON.parse(JSON.stringify(currentFields)), form: JSON.parse(JSON.stringify(currentForm)) }].slice(-20));
    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setFuture(prev => [{ fields, form }, ...prev]);
    setFields(previousState.fields);
    setForm(previousState.form);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (future.length === 0) return;
    const nextState = future[0];
    setHistory(prev => [...prev, { fields, form }]);
    setFields(nextState.fields);
    setForm(nextState.form);
    setFuture(prev => prev.slice(1));
  };

  const copyLink = () => {
    const url = `${window.location.origin}/f/${form.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Tautan berhasil disalin!");
  };

  const toggleStar = () => {
    saveHistory();
    const newSettings = { ...(form.settings || {}), is_starred: !(form.settings?.is_starred) };
    setForm({ ...form, settings: newSettings });
    toast.success(newSettings.is_starred ? "Formulir diberi bintang" : "Bintang dihapus dari formulir");
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    try {
      if (formBuilderCache.has(id)) {
        const cached = formBuilderCache.get(id);
        setForm(cached.form);
        setFields(cached.fields);
        setResponses(cached.responses);
        setIsLoading(false);
        return;
      }
      
      const localDraft = localStorage.getItem(`builder_${id}_draft`);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          setForm(parsed.form);
          setFields(parsed.fields);
          // Responses aren't saved in localStorage draft, so we fetch them or leave them empty to be fetched
        } catch (e) {
          console.error("Draft parsing error", e);
        }
      }
      
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
      
      const fieldsList = fieldsData || [];
      if (fieldsList.length === 0) {
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
        setFields(fieldsList);
      }

      // Fetch responses
      const { data: respData, error: respError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', id)
        .order('created_at', { ascending: false });

      const responsesList = respData || [];
      setResponses(responsesList);

      const formObj = localDraft ? JSON.parse(localDraft).form : formData;
      const finalFields = localDraft ? JSON.parse(localDraft).fields : (fieldsList.length > 0 ? fieldsList : [{
        id: `temp_${Date.now()}`,
        isNew: true,
        type: 'short_text',
        label: '',
        required: false,
        options: ['Opsi 1'],
        order_index: 0
      }]);
      
      if (!localDraft) {
        setForm(formObj);
        setFields(finalFields);
      } else {
        toast.success("Draft form yang belum tersimpan berhasil dipulihkan.");
      }

      formBuilderCache.set(id, {
        form: formObj,
        fields: finalFields,
        responses: responsesList
      });

    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
      navigate('/dashboard/forms');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-sync cache on changes
  useEffect(() => {
    if (!isLoading && form && fields) {
      formBuilderCache.set(id, { form, fields, responses });
      localStorage.setItem(`builder_${id}_draft`, JSON.stringify({ form, fields }));
    }
  }, [form, fields, responses, id, isLoading]);

  const addField = () => {
    saveHistory();
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
    saveHistory();
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
    saveHistory();
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    if (activeFieldIndex === index) {
      setActiveFieldIndex(null);
    } else if (activeFieldIndex > index) {
      setActiveFieldIndex(activeFieldIndex - 1);
    }
  };

  const duplicateField = (index) => {
    saveHistory();
    const newFields = [...fields];
    const fieldToDuplicate = { ...newFields[index], id: `temp_${Date.now()}`, isNew: true };
    newFields.splice(index + 1, 0, fieldToDuplicate);
    setFields(newFields);
    setActiveFieldIndex(index + 1);
  };

  const updateField = (index, keyOrUpdates, value) => {
    const newFields = [...fields];
    if (typeof keyOrUpdates === 'object' && keyOrUpdates !== null) {
      newFields[index] = { ...newFields[index], ...keyOrUpdates };
    } else {
      newFields[index] = { ...newFields[index], [keyOrUpdates]: value };
    }
    setFields(newFields);
  };

  const moveField = (index, direction) => {
    if (direction === 'up' && index > 0) {
      saveHistory();
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
      setFields(newFields);
      setActiveFieldIndex(index - 1);
    } else if (direction === 'down' && index < fields.length - 1) {
      saveHistory();
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
        const fieldsToInsert = [];
        const fieldsToUpdate = [];
        
        fields.forEach((f, idx) => {
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
            fieldsToUpdate.push(fieldData);
          } else {
            fieldsToInsert.push(fieldData);
          }
        });

        if (fieldsToInsert.length > 0) {
          const { error: insertError } = await supabase.from('form_fields').insert(fieldsToInsert);
          if (insertError) throw insertError;
        }
        
        if (fieldsToUpdate.length > 0) {
          const { error: updateError } = await supabase.from('form_fields').upsert(fieldsToUpdate, { onConflict: 'id' });
          if (updateError) throw updateError;
        }
      }

      toast.success("Perubahan tersimpan");
      
      const { data: refreshedFields } = await supabase.from('form_fields').select('*').eq('form_id', id).order('order_index', { ascending: true });
      setFields(refreshedFields || []);
      
      // Update cache
      formBuilderCache.set(id, {
        form,
        fields: refreshedFields || [],
        responses
      });
      localStorage.removeItem(`builder_${id}_draft`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan formulir");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteResponse = async () => {
    if (!responseToDelete) return;
    try {
      const { error } = await supabase.from('form_responses').delete().eq('id', responseToDelete);
      if (error) throw error;
      const newResponses = responses.filter(r => r.id !== responseToDelete);
      setResponses(newResponses);
      toast.success("Jawaban dihapus");
      
      formBuilderCache.set(id, {
        form,
        fields,
        responses: newResponses
      });

      if (currentResponseIndex >= newResponses.length) {
        setCurrentResponseIndex(Math.max(0, newResponses.length - 1));
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus jawaban");
    } finally {
      setDeleteResponseModalOpen(false);
      setResponseToDelete(null);
    }
  };

  const triggerDeleteResponse = (responseId) => {
    setResponseToDelete(responseId);
    setDeleteResponseModalOpen(true);
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
        if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
           // For grids, we don't aggregate simply into pie charts for now
           totalAnswers++;
        } else if (Array.isArray(ans)) {
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

    if (field.type === 'radio' || field.type === 'select' || field.type === 'linear_scale' || field.type === 'rating') {
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

    // Text types and others
    return (
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
        {responses.map(resp => {
          const ans = resp.answers[field.id];
          if (!ans) return null;
          return (
            <div key={resp.id} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 border border-slate-100 flex flex-col justify-center">
              {field.type === 'file_upload' ? (
                <a href={ans} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium bg-blue-50 w-max px-3 py-1.5 rounded-lg border border-blue-100">
                  <Download className="w-4 h-4" />
                  Lihat / Unduh File
                </a>
              ) : (field.type === 'grid_radio' || field.type === 'grid_checkbox') ? (
                typeof ans === 'object' && Object.keys(ans).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(ans).map(([r, c], idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-semibold text-slate-700 min-w-[100px]">{r}:</span> 
                        <span className="text-slate-600 bg-white border border-slate-200 px-2 rounded">{Array.isArray(c) ? c.join(', ') : c}</span>
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-slate-400 italic">Kosong</span>
              ) : (
                String(ans)
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center">
        <LoadingSpinner size="large" />
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
        <div className="flex items-center justify-between px-4 pb-2 pt-2 sm:pt-3">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
            <button 
              onClick={() => navigate('/dashboard/forms')}
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColor }} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center min-w-0 gap-1 sm:gap-2">
                <input 
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="font-medium text-base sm:text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 sm:focus:border-b-2 sm:focus:border-purple-600 outline-none px-1 py-0.5 sm:px-2 w-full max-w-[200px] sm:max-w-md transition-colors text-ellipsis leading-none"
                  placeholder="Formulir Tanpa Judul"
                />
                <button onClick={() => toast.success("Fitur folder sedang dalam pengembangan")} className="hidden sm:flex p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors shrink-0" title="Pindahkan ke folder">
                  <Folder className="w-4 h-4" />
                </button>
                <button onClick={toggleStar} className="hidden sm:flex p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors shrink-0" title="Bintangi">
                  <Star className={`w-4 h-4 ${form.settings?.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
            <div className="hidden sm:flex items-center gap-1 shrink-0 text-slate-600 relative">
              <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className="p-2 hover:bg-slate-100 rounded-full transition-colors mx-1" title="Sesuaikan Tema">
                <Palette className="w-5 h-5" />
              </button>
              <a 
                href={`/f/${form.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Pratinjau"
              >
                <Eye className="w-5 h-5" />
              </a>
              <button 
                onClick={undo}
                disabled={history.length === 0}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Urungkan"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button 
                onClick={redo}
                disabled={future.length === 0}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Ulangi"
              >
                <Redo className="w-5 h-5" />
              </button>
              <button onClick={copyLink} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Dapatkan tautan">
                <Link className="w-5 h-5" />
              </button>
              <button onClick={() => toast.success("Fitur kolaborasi tim sedang dalam pengembangan")} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Tambahkan kolaborator">
                <UserPlus className="w-5 h-5" />
              </button>

              <button
                onClick={saveForm}
                disabled={isSaving}
                className="flex items-center gap-2 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-md text-sm font-bold transition-all shadow-sm disabled:opacity-70 shrink-0 ml-2"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Kirim'}
              </button>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-1.5 flex flex-col gap-1">
                      <button 
                        onClick={() => { setIsMenuOpen(false); setIsThemeMenuOpen(true); }}
                        className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer overflow-hidden transition-colors w-full text-left"
                      >
                        <Palette className="w-4 h-4 text-slate-500" />
                        <span>Sesuaikan Tema</span>
                      </button>
                      <a 
                        href={`/f/${form.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>Pratinjau Form</span>
                      </a>
                      <div className="h-px bg-slate-100 my-0.5 mx-2"></div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          saveForm();
                        }}
                        disabled={isSaving}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-70 rounded-lg text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Send className="w-4 h-4" />
                        {isSaving ? 'Menyimpan...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold sm:ml-2 shrink-0 border border-slate-300">
              <span className="text-sm">{user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>

            {isThemeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 p-4">
                  <h3 className="text-sm font-medium text-slate-800 mb-3">Warna Tema</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {THEME_COLORS.map(color => (
                      <button 
                        key={color}
                        onClick={() => setForm({...form, theme_color: color})}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center mx-auto"
                        style={{ 
                          backgroundColor: color, 
                          borderColor: form.theme_color === color ? '#fff' : 'transparent', 
                          outline: form.theme_color === color ? `2px solid ${color}` : 'none' 
                        }}
                      >
                        {form.theme_color === color && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 relative">
                    <button className="w-full flex items-center gap-2 justify-center py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" /> Warna Khusus
                    </button>
                    <input 
                      type="color" 
                      value={form.theme_color || '#673ab7'}
                      onChange={(e) => setForm({...form, theme_color: e.target.value})}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}
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
                <span className="bg-[#5f6368] text-white text-[12px] px-1.5 py-0.5 rounded-full font-medium leading-none min-w-[20px] flex items-center justify-center">{responses.length}</span>
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
                <AutoResizeTextarea 
                  value={form.title || ''}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full text-3xl font-normal text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:border-b-2 outline-none pb-1 transition-colors placeholder-slate-400"
                  placeholder="Formulir Tanpa Judul"
                />
                <AutoResizeTextarea 
                  value={form.description || ''}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full mt-4 text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 outline-none pb-1 transition-colors placeholder-slate-500"
                  placeholder="Deskripsi formulir"
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
                        <AutoResizeTextarea 
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
                        <AutoResizeTextarea 
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                          className={`w-full text-sm text-slate-600 bg-transparent outline-none transition-all resize-none placeholder-slate-500 ${isActive ? 'border-b border-slate-300 focus:border-slate-500 focus:border-b-2 py-2' : 'border-none py-1'}`}
                          placeholder="Deskripsi (opsional)"
                          readOnly={!isActive}
                        />
                      </div>
                    )}

                    {/* Field Specific Inputs */}
                    {field.type !== 'page_break' && activeQuizFieldIndex !== index && (
                      <div className="py-2">
                        {(field.type === 'short_text' || field.type === 'email' || field.type === 'date' || field.type === 'time') && (
                          <div className="text-slate-500 border-b border-slate-300 border-dotted pb-2 w-1/2 text-sm">
                            {field.type === 'date' ? 'Bulan, hari, tahun' : field.type === 'time' ? 'Waktu' : 'Teks jawaban singkat'}
                          </div>
                        )}

                        {field.type === 'long_text' && (
                          <div className="text-slate-500 border-b border-slate-300 border-dotted pb-6 w-3/4 text-sm">
                            Teks jawaban panjang
                          </div>
                        )}

                        {field.type === 'file_upload' && (
                            <div className="flex flex-col gap-5 py-2 border-b border-slate-300 border-dotted pb-6 w-full text-slate-800">
                              {/* Toggle: Izinkan hanya jenis file tertentu */}
                              <div className="flex items-center justify-between pr-4 sm:pr-8">
                                <span className="text-[15px] text-slate-700">Izinkan hanya jenis file tertentu</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={field.settings?.restrict_file_types || false}
                                    onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), restrict_file_types: e.target.checked})}
                                    disabled={!isActive}
                                  />
                                  <div className="w-[34px] h-[14px] bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#a8c7fa] peer-checked:after:translate-x-[16px] peer-checked:after:bg-[#0b57d0] after:content-[''] after:absolute after:-top-[3px] after:left-0 after:bg-white after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                              </div>

                              {field.settings?.restrict_file_types && (
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 sm:w-3/4 mb-2">
                                  {['Dokumen', 'Presentasi', 'Spreadsheet', 'Gambar', 'PDF', 'Foto', 'Video', 'Audio'].map((type, idx) => {
                                    const isChecked = (field.settings?.allowed_file_types || []).includes(type);
                                    return (
                                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-[18px] h-[18px] flex items-center justify-center rounded-[2px] border ${isChecked ? 'bg-[#5f6368] border-[#5f6368]' : 'border-[#80868b] group-hover:border-slate-800'}`}>
                                          {isChecked && (
                                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                          )}
                                        </div>
                                        <span className="text-[14px] text-slate-700">{type}</span>
                                        <input 
                                          type="checkbox" 
                                          className="hidden" 
                                          checked={isChecked}
                                          onChange={(e) => {
                                            const currentTypes = field.settings?.allowed_file_types || [];
                                            const newTypes = e.target.checked ? [...currentTypes, type] : currentTypes.filter(t => t !== type);
                                            updateField(index, 'settings', {...(field.settings||{}), allowed_file_types: newTypes});
                                          }}
                                          disabled={!isActive}
                                        />
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="flex items-center justify-between pr-4 sm:pr-8">
                                <span className="text-[15px] text-slate-700">Jumlah maksimum file</span>
                                <div className="relative">
                                  <select 
                                    value={field.settings?.max_files || 1}
                                    onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), max_files: parseInt(e.target.value)})}
                                    className="appearance-none bg-transparent pr-6 text-[14px] text-slate-700 outline-none cursor-pointer"
                                    disabled={!isActive}
                                  >
                                    <option value={1}>1</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                  </select>
                                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pr-4 sm:pr-8">
                                <span className="text-[15px] text-slate-700">Ukuran file maksimal</span>
                                <div className="relative">
                                  <select 
                                    value={field.settings?.max_file_size || '10 MB'}
                                    onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), max_file_size: e.target.value})}
                                    className="appearance-none bg-transparent pr-6 text-[14px] text-slate-700 outline-none cursor-pointer"
                                    disabled={!isActive}
                                  >
                                    <option value="1 MB">1 MB</option>
                                    <option value="10 MB">10 MB</option>
                                    <option value="100 MB">100 MB</option>
                                    <option value="1 GB">1 GB</option>
                                    <option value="10 GB">10 GB</option>
                                  </select>
                                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                                </div>
                              </div>

                            </div>
                        )}

                        {field.type === 'linear_scale' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <select 
                                value={field.settings?.min_value ?? 1} 
                                onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), min_value: parseInt(e.target.value)})}
                                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm outline-none"
                                disabled={!isActive}
                              >
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                              </select>
                              <span className="text-slate-500 text-sm">sampai</span>
                              <select 
                                value={field.settings?.max_value ?? 5} 
                                onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), max_value: parseInt(e.target.value)})}
                                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm outline-none"
                                disabled={!isActive}
                              >
                                {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2 mt-4 max-w-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium w-4 text-center">{field.settings?.min_value ?? 1}</span>
                                <input 
                                  type="text" 
                                  value={field.settings?.min_label || ''} 
                                  onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), min_label: e.target.value})}
                                  placeholder="Label (opsional)" 
                                  className="flex-1 border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:border-b-2 outline-none text-sm py-1 bg-transparent transition-all"
                                  readOnly={!isActive}
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium w-4 text-center">{field.settings?.max_value ?? 5}</span>
                                <input 
                                  type="text" 
                                  value={field.settings?.max_label || ''} 
                                  onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), max_label: e.target.value})}
                                  placeholder="Label (opsional)" 
                                  className="flex-1 border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:border-b-2 outline-none text-sm py-1 bg-transparent transition-all"
                                  readOnly={!isActive}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {field.type === 'rating' && (
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-500 font-medium">Tingkat</span>
                              <select 
                                value={field.settings?.max_rating ?? 5} 
                                onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), max_rating: parseInt(e.target.value)})}
                                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm outline-none"
                                disabled={!isActive}
                              >
                                {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-500 font-medium">Ikon</span>
                              <select 
                                value={field.settings?.icon_type || 'star'} 
                                onChange={(e) => updateField(index, 'settings', {...(field.settings||{}), icon_type: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm outline-none"
                                disabled={!isActive}
                              >
                                <option value="star">Bintang</option>
                                <option value="heart">Hati</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-1 mt-5 ml-4">
                              {Array.from({length: field.settings?.max_rating ?? 5}).map((_, i) => (
                                <Star key={i} className={`w-6 h-6 text-slate-300 ${field.settings?.icon_type === 'heart' ? 'fill-none' : 'fill-slate-300'}`} />
                              ))}
                            </div>
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
                                    const oldVal = newOpts[optIndex];
                                    const newVal = e.target.value;
                                    newOpts[optIndex] = newVal;
                                    
                                    const updates = { options: newOpts };
                                    if (field.settings?.correct_answers?.includes(oldVal)) {
                                      updates.settings = {
                                        ...field.settings,
                                        correct_answers: field.settings.correct_answers.map(ans => ans === oldVal ? newVal : ans)
                                      };
                                    }
                                    updateField(index, updates);
                                  }}
                                  className={`flex-1 bg-transparent outline-none text-sm transition-all ${isActive ? 'border-b hover:border-slate-300 focus:border-slate-600 focus:border-b-2 py-1 border-transparent' : 'border-b border-transparent py-1 text-slate-800'}`}
                                  placeholder={`Opsi ${optIndex + 1}`}
                                  readOnly={!isActive}
                                />
                                {isActive && (
                                  <button 
                                    onClick={() => {
                                      const newOpts = [...field.options];
                                      const oldVal = newOpts[optIndex];
                                      newOpts.splice(optIndex, 1);
                                      
                                      const updates = { options: newOpts };
                                      if (field.settings?.correct_answers?.includes(oldVal)) {
                                        updates.settings = {
                                          ...field.settings,
                                          correct_answers: field.settings.correct_answers.filter(ans => ans !== oldVal)
                                        };
                                      }
                                      updateField(index, updates);
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
                        {(field.type === 'grid_radio' || field.type === 'grid_checkbox') && (
                          <div className="flex flex-col sm:flex-row gap-6 mt-4">
                            {/* Rows */}
                            <div className="flex-1 space-y-3">
                              <h5 className="text-sm font-semibold text-slate-700">Baris</h5>
                              {(field.settings?.rows || ['Baris 1']).map((row, rIndex) => (
                                <div key={`row-${rIndex}`} className="flex items-center gap-3 group/opt">
                                  <span className="text-sm text-slate-500 font-normal w-5 text-center shrink-0">{rIndex + 1}.</span>
                                  <input 
                                    type="text"
                                    value={row || ''}
                                    onChange={(e) => {
                                      const newRows = [...(field.settings?.rows || ['Baris 1'])];
                                      newRows[rIndex] = e.target.value;
                                      updateField(index, 'settings', {...(field.settings||{}), rows: newRows});
                                    }}
                                    className={`flex-1 bg-transparent outline-none text-sm transition-all ${isActive ? 'border-b hover:border-slate-300 focus:border-slate-600 focus:border-b-2 py-1 border-transparent' : 'border-b border-transparent py-1 text-slate-800'}`}
                                    placeholder={`Baris ${rIndex + 1}`}
                                    readOnly={!isActive}
                                  />
                                  {isActive && ((field.settings?.rows?.length || 1) > 1) && (
                                    <button 
                                      onClick={() => {
                                        const newRows = [...(field.settings?.rows || [])];
                                        newRows.splice(rIndex, 1);
                                        updateField(index, 'settings', {...(field.settings||{}), rows: newRows});
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
                                  <span className="text-sm text-slate-400 font-normal w-5 text-center">{(field.settings?.rows?.length || 1) + 1}.</span>
                                  <input 
                                    type="text"
                                    readOnly
                                    className="bg-transparent border-b border-transparent text-sm py-1 w-32 cursor-pointer text-slate-400 hover:border-slate-300 transition-all"
                                    placeholder="Tambahkan baris"
                                    onClick={() => {
                                      const r = field.settings?.rows || ['Baris 1'];
                                      updateField(index, 'settings', {...(field.settings||{}), rows: [...r, `Baris ${r.length + 1}`]});
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Columns */}
                            <div className="flex-1 space-y-3">
                              <h5 className="text-sm font-semibold text-slate-700">Kolom</h5>
                              {(field.settings?.columns || ['Kolom 1']).map((col, cIndex) => (
                                <div key={`col-${cIndex}`} className="flex items-center gap-3 group/opt">
                                  {field.type === 'grid_radio' ? <CircleDot className="w-5 h-5 text-slate-300 shrink-0" /> : <CheckSquare className="w-5 h-5 text-slate-300 shrink-0" />}
                                  <input 
                                    type="text"
                                    value={col || ''}
                                    onChange={(e) => {
                                      const newCols = [...(field.settings?.columns || ['Kolom 1'])];
                                      newCols[cIndex] = e.target.value;
                                      updateField(index, 'settings', {...(field.settings||{}), columns: newCols});
                                    }}
                                    className={`flex-1 bg-transparent outline-none text-sm transition-all ${isActive ? 'border-b hover:border-slate-300 focus:border-slate-600 focus:border-b-2 py-1 border-transparent' : 'border-b border-transparent py-1 text-slate-800'}`}
                                    placeholder={`Kolom ${cIndex + 1}`}
                                    readOnly={!isActive}
                                  />
                                  {isActive && ((field.settings?.columns?.length || 1) > 1) && (
                                    <button 
                                      onClick={() => {
                                        const newCols = [...(field.settings?.columns || [])];
                                        newCols.splice(cIndex, 1);
                                        updateField(index, 'settings', {...(field.settings||{}), columns: newCols});
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
                                  {field.type === 'grid_radio' ? <CircleDot className="w-5 h-5 text-slate-300" /> : <CheckSquare className="w-5 h-5 text-slate-300" />}
                                  <input 
                                    type="text"
                                    readOnly
                                    className="bg-transparent border-b border-transparent text-sm py-1 w-32 cursor-pointer text-slate-400 hover:border-slate-300 transition-all"
                                    placeholder="Tambahkan kolom"
                                    onClick={() => {
                                      const c = field.settings?.columns || ['Kolom 1'];
                                      updateField(index, 'settings', {...(field.settings||{}), columns: [...c, `Kolom ${c.length + 1}`]});
                                    }}
                                  />
                                </div>
                              )}
                            </div>
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
                      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap justify-end items-center gap-y-4 gap-x-3 sm:gap-4">
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
                        onClick={() => triggerDeleteResponse(responses[currentResponseIndex].id)}
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
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[42px] text-sm text-slate-800 flex flex-col justify-center">
                            {field.type === 'file_upload' ? (
                              ans ? (
                                <a href={ans} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium bg-blue-50 w-max px-3 py-1.5 rounded-lg border border-blue-100">
                                  <Download className="w-4 h-4" />
                                  Lihat / Unduh File
                                </a>
                              ) : <span className="text-slate-400 italic">Kosong</span>
                            ) : (field.type === 'grid_radio' || field.type === 'grid_checkbox') ? (
                              ans && typeof ans === 'object' && Object.keys(ans).length > 0 ? (
                                <ul className="space-y-2">
                                  {Object.entries(ans).map(([r, c], idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="font-semibold text-slate-700 min-w-[100px]">{r}:</span> 
                                      <span className="text-slate-600 bg-white border border-slate-200 px-2 rounded">{Array.isArray(c) ? c.join(', ') : c}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <span className="text-slate-400 italic">Kosong</span>
                            ) : Array.isArray(ans) ? (
                              ans.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                  {ans.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                              ) : <span className="text-slate-400 italic">Kosong</span>
                            ) : (
                              ans ? String(ans) : <span className="text-slate-400 italic">Kosong</span>
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
                        <h4 className="text-sm font-medium text-slate-700">Batasi ke 1 tanggapan</h4>
                        <p className="text-xs text-slate-500 mt-1">Responden hanya dapat mengisi formulir satu kali.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={form.settings?.limit_one_response || false}
                          onChange={(e) => handleSettingChange('limit_one_response', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all" style={form.settings?.limit_one_response ? {backgroundColor: themeColor} : {}}></div>
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
          <div className="fixed bottom-0 left-0 right-0 lg:static lg:sticky lg:top-[150px] flex flex-row lg:flex-col justify-center bg-white lg:rounded-full shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:shadow-lg border-t lg:border border-slate-200 p-4 lg:p-2 gap-6 lg:gap-3 lg:shrink-0 lg:w-14 items-center transition-all z-50 pb-[env(safe-area-inset-bottom,1rem)] lg:pb-2">
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

      </div>
      <ConfirmModal
        isOpen={deleteResponseModalOpen}
        onClose={() => { setDeleteResponseModalOpen(false); setResponseToDelete(null); }}
        onConfirm={confirmDeleteResponse}
        title="Hapus Jawaban"
        message="Hapus jawaban ini permanen?"
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
}
