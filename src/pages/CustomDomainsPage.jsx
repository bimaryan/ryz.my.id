import { Globe } from "lucide-react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function CustomDomainsPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <SEO title="Custom Domains | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="text-center max-w-lg mx-auto p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-[#0b5cff] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-sm">
            <Globe className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Custom Domains
          </h1>
          <div className="inline-block px-3 py-1 mb-4 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-widest">
            Coming Soon
          </div>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            We are working hard to bring you the ability to use your own branded domains (e.g. promo.yourbrand.com) for your shortlinks. Stay tuned!
          </p>
          <Button
            size="md"
            onClick={() => navigate(-1)}
            className="bitly-button-secondary shadow-sm w-full sm:w-auto"
          >
            Go Back
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
