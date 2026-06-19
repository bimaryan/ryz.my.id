import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/SEO";
import { CheckCircle2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function PublicFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [maxScore, setMaxScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('status', true)
        .single();

      if (formError || !formData) {
        throw new Error("Formulir tidak ditemukan atau sudah ditutup.");
      }
      setForm(formData);

      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);

      // Chunk fields into pages
      const formPages = [];
      let currentPageObj = {
        id: 'page_0',
        title: formData.title,
        description: formData.description,
        fields: []
      };

      fieldsData?.forEach(f => {
        if (f.type === 'page_break') {
          formPages.push(currentPageObj);
          currentPageObj = {
            id: f.id,
            title: f.label,
            description: f.placeholder,
            fields: []
          };
        } else {
          currentPageObj.fields.push(f);
        }
      });
      formPages.push(currentPageObj);
      setPages(formPages);

      // Initialize empty answers
      const initAns = {};
      fieldsData?.forEach(f => {
        if (f.type !== 'page_break') {
          if (f.type === 'checkbox') initAns[f.id] = [];
          else initAns[f.id] = '';
        }
      });
      setAnswers(initAns);

    } catch (error) {
      console.error(error);
      setError(error.message || "Gagal memuat formulir");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(o => o !== option) };
      }
    });
  };

  const validateCurrentPage = () => {
    let isValid = true;
    
    if (currentPage === 0 && form.settings?.collect_email) {
      if (!respondentEmail || !/^\S+@\S+\.\S+$/.test(respondentEmail)) {
        isValid = false;
        toast.error("Harap isi alamat email yang valid");
        return false;
      }
    }

    pages[currentPage].fields.forEach(f => {
      if (f.required) {
        const val = answers[f.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      toast.error("Harap isi semua kolom yang wajib (*)");
    }
    return isValid;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateCurrentPage()) {
      window.scrollTo(0, 0);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    setCurrentPage(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentPage()) return;

    setIsSubmitting(true);
    try {
      if (form.settings?.is_quiz) {
        let currentScore = 0;
        let total = 0;
        fields.forEach(f => {
          if (f.type !== 'page_break') {
            const pts = f.settings?.points || 0;
            total += pts;
            const correctAnswers = f.settings?.correct_answers || [];
            if (pts > 0 && correctAnswers.length > 0) {
              const userAns = answers[f.id];
              if (f.type === 'radio' || f.type === 'select') {
                if (correctAnswers.includes(userAns)) currentScore += pts;
              } else if (f.type === 'checkbox') {
                const uAns = userAns || [];
                const isCorrect = uAns.length === correctAnswers.length && uAns.every(v => correctAnswers.includes(v));
                if (isCorrect) currentScore += pts;
              } else if (f.type === 'short_text') {
                const isCorrect = correctAnswers.some(ca => ca.toLowerCase().trim() === String(userAns || '').toLowerCase().trim());
                if (isCorrect) currentScore += pts;
              }
            }
          }
        });
        setQuizScore(currentScore);
        setMaxScore(total);
      }

      const { error: submitError } = await supabase
        .from('form_responses')
        .insert([{
          form_id: id,
          answers: answers,
          respondent_email: form.settings?.collect_email ? respondentEmail : null
        }]);

      if (submitError) throw submitError;
      
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim jawaban. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#0b5cff] rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Formulir Tidak Tersedia</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex items-center justify-center">
        <SEO title={`${form.title} - Selesai`} description="Jawaban berhasil dikirim." />
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-t-8 border-[#0b5cff]" style={{ borderTopColor: form.theme_color || '#0b5cff' }}>
          <div className="h-24 w-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">{form.title}</h1>
          <p className="text-slate-600 mb-8">{form.settings?.confirmation_message || 'Jawaban Anda telah berhasil direkam. Terima kasih telah mengisi formulir ini!'}</p>
          
          {form.settings?.is_quiz && quizScore !== null && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 inline-block mb-8 min-w-[200px] shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wide">Skor Anda</div>
              <div className="text-4xl font-black text-slate-800">{quizScore} <span className="text-2xl text-slate-400 font-medium">/ {maxScore}</span></div>
            </div>
          )}
          <br/>

          <button 
            onClick={() => {
              setIsSuccess(false);
              const initAns = {};
              fields.forEach(f => {
                if (f.type !== 'page_break') {
                  if (f.type === 'checkbox') initAns[f.id] = [];
                  else initAns[f.id] = '';
                }
              });
              setAnswers(initAns);
              setRespondentEmail('');
              setCurrentPage(0);
            }}
            className="text-[#0b5cff] font-bold hover:underline"
            style={{ color: form.theme_color || '#0b5cff' }}
          >
            Kirim tanggapan lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 relative">
      <SEO title={form.title} description={form.description || 'Formulir Publik'} />
      
      {/* Dynamic Background Banner */}
      <div 
        className="absolute top-0 left-0 right-0 h-48 sm:h-64 opacity-20 pointer-events-none" 
        style={{ backgroundColor: form.theme_color || '#0b5cff' }}
      ></div>

      <div className="relative max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border-t-8 overflow-hidden" style={{ borderTopColor: form.theme_color || '#0b5cff' }}>
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight">
              {pages[currentPage]?.title || form.title}
            </h1>
            {pages[currentPage]?.description && (
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-lg">
                {pages[currentPage]?.description}
              </div>
            )}
            <div className="mt-6 text-sm text-red-500 font-medium">* Menunjukkan pertanyaan yang wajib diisi</div>
          </div>
        </div>

        {/* Form Form */}
        <form onSubmit={currentPage === pages.length - 1 ? handleSubmit : handleNext} className="space-y-6">
          
          {currentPage === 0 && form.settings?.collect_email && (
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Email <span className="text-red-500 ml-1">*</span>
              </h3>
              <p className="text-sm text-slate-500 mb-6">Email ini akan direkam jika Anda mengirimkan formulir ini.</p>
              <input
                type="email"
                required
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="Jawaban Anda"
                className="w-full bg-slate-50 border-b-2 border-slate-300 focus:bg-slate-100 focus:border-b-2 outline-none px-4 py-3 text-slate-800 rounded-t-lg transition-all"
                style={{ borderBottomColor: respondentEmail ? form.theme_color || '#0b5cff' : undefined }}
              />
            </div>
          )}

          {pages[currentPage]?.fields.map((field) => (
            <div 
              key={field.id} 
              className={`bg-white rounded-3xl shadow-md p-6 sm:p-8 transition-all ${field.required && !answers[field.id] && isSubmitting ? 'border border-red-300 ring-2 ring-red-50' : 'border border-slate-100 hover:shadow-lg'}`}
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </h2>
              
              <div className="mt-2">
                {/* Short Text */}
                {field.type === 'short_text' && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || "Jawaban Anda"}
                    value={answers[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full sm:w-2/3 bg-transparent border-b border-slate-300 focus:border-[#0b5cff] outline-none py-2 transition-colors placeholder-slate-400"
                    style={{ '--tw-ring-color': form.theme_color || '#0b5cff' }}
                  />
                )}

                {/* Long Text */}
                {field.type === 'long_text' && (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder || "Jawaban Anda"}
                    value={answers[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full bg-transparent border-b border-slate-300 focus:border-[#0b5cff] outline-none py-2 transition-colors min-h-[80px] resize-y placeholder-slate-400"
                  />
                )}

                {/* Email */}
                {field.type === 'email' && (
                  <input
                    type="email"
                    required={field.required}
                    placeholder={field.placeholder || "email@example.com"}
                    value={answers[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full sm:w-2/3 bg-transparent border-b border-slate-300 focus:border-[#0b5cff] outline-none py-2 transition-colors placeholder-slate-400"
                  />
                )}

                {/* Date */}
                {field.type === 'date' && (
                  <input
                    type="date"
                    required={field.required}
                    value={answers[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-200 focus:border-[#0b5cff] outline-none px-4 py-2.5 rounded-xl transition-colors text-slate-700"
                  />
                )}

                {/* Radio */}
                {field.type === 'radio' && (
                  <div className="space-y-3">
                    {field.options.map((opt, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="radio"
                            name={`field_${field.id}`}
                            required={field.required}
                            value={opt}
                            checked={answers[field.id] === opt}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-5 h-5 opacity-0 absolute cursor-pointer"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${answers[field.id] === opt ? 'border-[#0b5cff]' : 'border-slate-300 group-hover:border-slate-400'}`} style={{ borderColor: answers[field.id] === opt ? (form.theme_color || '#0b5cff') : undefined }}>
                            {answers[field.id] === opt && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: form.theme_color || '#0b5cff' }}></div>}
                          </div>
                        </div>
                        <span className="text-slate-700 text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <div className="space-y-3">
                    {field.options.map((opt, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={(answers[field.id] || []).includes(opt)}
                            onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                            className="w-5 h-5 opacity-0 absolute cursor-pointer"
                          />
                          <div className={`w-5 h-5 rounded transition-all flex items-center justify-center ${
                            (answers[field.id] || []).includes(opt) 
                            ? 'border-[#0b5cff] bg-[#0b5cff]' 
                            : 'border-2 border-slate-300 group-hover:border-slate-400 bg-transparent'
                          }`} style={{ backgroundColor: (answers[field.id] || []).includes(opt) ? (form.theme_color || '#0b5cff') : undefined, borderColor: (answers[field.id] || []).includes(opt) ? (form.theme_color || '#0b5cff') : undefined }}>
                            {(answers[field.id] || []).includes(opt) && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                          </div>
                        </div>
                        <span className="text-slate-700 text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Select */}
                {field.type === 'select' && (
                  <div className="relative w-full sm:w-2/3">
                    <select
                      required={field.required}
                      value={answers[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-[#0b5cff] outline-none px-4 py-3 rounded-xl transition-colors text-slate-700 font-medium"
                    >
                      <option value="" disabled>Pilih opsi</option>
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit/Next Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center bg-white rounded-3xl shadow-md p-6 sm:p-8 border border-slate-100 gap-6 sm:gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              {currentPage > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-lg transition-all"
                >
                  Kembali
                </button>
              )}
              {currentPage === pages.length - 1 ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
                  style={{ backgroundColor: form.theme_color || '#0b5cff', boxShadow: `0 10px 15px -3px ${(form.theme_color || '#0b5cff')}40` }}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{ backgroundColor: form.theme_color || '#0b5cff', boxShadow: `0 10px 15px -3px ${(form.theme_color || '#0b5cff')}40` }}
                >
                  Berikutnya
                </button>
              )}
            </div>
            
            <div className="text-xs text-slate-400 font-medium opacity-50 flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
              {pages.length > 1 && (
                <span>Halaman {currentPage + 1} dari {pages.length}</span>
              )}
              <span>Powered by RYZLink Form</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
