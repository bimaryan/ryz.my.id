import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Plus, Search, Edit, Trash2, ExternalLink, BarChart3, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function FormsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchForms();
  }, [user]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      // Determine if user is in a team
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      let query = supabase.from('forms').select('*').order('created_at', { ascending: false });

      if (teamMembers && teamMembers.length > 0) {
        const teamIds = teamMembers.map(tm => tm.team_id);
        query = query.or(`user_id.eq.${user.id},team_id.in.(${teamIds.join(',')})`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Gagal memuat daftar formulir");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewForm = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // Create a blank form and redirect to builder
      const { data, error } = await supabase
        .from('forms')
        .insert([{
          user_id: user.id,
          title: 'Formulir Tanpa Judul',
          description: '',
          status: false // Draft by default
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Formulir dibuat! Membuka editor...");
      navigate(`/dashboard/forms/${data.id}/edit`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat formulir baru");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteForm = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus formulir ini? Semua pertanyaan dan jawaban akan terhapus permanen.")) return;
    
    try {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (error) throw error;
      setForms(forms.filter(f => f.id !== id));
      toast.success("Formulir berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus formulir");
    }
  };

  const filteredForms = forms.filter(f => 
    !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <SEO title="Formulir | RYZLink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
              <FileText className="text-[#0b5cff] w-8 h-8" /> Formulir
            </h1>
            <p className="text-slate-600 font-medium">
              Buat form pendaftaran, survei, atau kuesioner kustom dengan mudah.
            </p>
          </div>
          <div>
            <button
              onClick={createNewForm}
              disabled={isCreating}
              className="group flex items-center gap-2 bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap disabled:opacity-70 disabled:pointer-events-none"
            >
              <Plus className="h-4 w-4 mr-1.5 transition-transform group-hover:rotate-90" />
              {isCreating ? 'Membuat...' : 'Buat Formulir Baru'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/40 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari formulir..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl text-sm transition-all outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-[#0b5cff] rounded-full mx-auto mb-4"></div>
              Memuat formulir...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada formulir</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">Mulai kumpulkan data dengan membuat formulir kustom pertama Anda.</p>
              <button
                onClick={createNewForm}
                className="inline-flex items-center gap-2 bg-[#0b5cff] hover:bg-[#094acc] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" /> Buat Sekarang
              </button>
            </div>
          ) : (
            filteredForms.map(form => (
              <div key={form.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-800 text-lg truncate mb-1" title={form.title}>
                      {form.title || 'Tanpa Judul'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${form.status ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {form.status ? 'Aktif' : 'Draft'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(form.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${form.theme_color || '#0b5cff'}15`, borderColor: `${form.theme_color || '#0b5cff'}30`, color: form.theme_color || '#0b5cff' }}>
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/dashboard/forms/${form.id}/edit`}
                      className="p-2 text-slate-400 hover:text-[#0b5cff] hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                      title="Edit Form"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link 
                      to={`/dashboard/forms/${form.id}/responses`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip-trigger"
                      title="Lihat Jawaban"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                    {form.status && (
                      <a 
                        href={`/f/${form.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip-trigger"
                        title="Buka Form"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => deleteForm(form.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
