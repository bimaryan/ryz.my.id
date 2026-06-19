import { Globe } from "lucide-react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function CustomDomainsPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <SEO title="Domain Kustom | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="text-center max-w-lg mx-auto p-10 bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 text-[#0b5cff] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100/50 shadow-sm">
            <Globe className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3">
            Domain Kustom
          </h1>
          <div className="inline-block px-4 py-1.5 mb-5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-extrabold text-xs rounded-full uppercase tracking-widest shadow-sm border border-amber-200/50">
            Segera Hadir
          </div>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Kami sedang bekerja keras untuk menghadirkan fitur penggunaan domain bermerek Anda sendiri (misal: promo.brandanda.com) untuk tautan pendek Anda. Nantikan kehadirannya!
          </p>
          <Button
            size="md"
            onClick={() => navigate(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm w-full sm:w-auto hover:text-[#0b5cff]"
          >
            Kembali
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
