import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Globe,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCustomDomains } from "@/hooks/useCustomDomains";
import DNSSetupModal from "@/components/DNSSetupModal";

export default function CustomDomainsPage() {
  const { domains, fetchDomains, addDomain, deleteDomain, isLoading } =
    useCustomDomains();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDnsDomain, setSelectedDnsDomain] = useState(null);
  const [domainInput, setDomainInput] = useState("");
  const [addError, setAddError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setAddError(null);
    setIsSubmitting(true);

    if (!domainInput || domainInput.length < 4) {
      setAddError("Please enter a valid domain name.");
      setIsSubmitting(false);
      return;
    }

    const res = await addDomain(domainInput);
    if (res.success) {
      setDomainInput("");
      setIsAddModalOpen(false);
    } else {
      setAddError(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = (id) => {
    setDomainToDelete(id);
  };

  return (
    <DashboardLayout>
      <SEO title="Custom Domains | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Custom Domains
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Manage your branded domains for custom shortlinks.
              </p>
            </div>
            <Button
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              className="bitly-button-primary shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> Add a Domain
            </Button>
          </div>

          {/* Intro Card */}
          <div className="bitly-card p-8 bg-gradient-to-br from-[#0b1021] to-[#1c2237] text-white mt-6">
            <div className="max-w-2xl">
              <div className="h-12 w-12 rounded-lg bg-[#0b5cff]/20 flex items-center justify-center text-[#0b5cff] mb-4 border border-[#0b5cff]/30">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">
                Brand your links with Custom Domains
              </h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Using your own domain name (e.g. promo.brand.com) increases
                click-through rates by up to 34% compared to generic short
                links. It builds trust and keeps your brand front and center.
              </p>
            </div>
          </div>

          {/* Domain List */}
          <div className="bitly-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Your Domains</h2>
              <div className="relative w-full max-w-xs hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search domains..."
                  className="bitly-input pl-10 h-9 py-0"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading && domains.length === 0 && (
                <div className="text-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {!isLoading && domains.length === 0 && (
                <div className="py-16 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">
                    No custom domains yet
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">
                    Add your first domain to start branding your links.
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bitly-button-secondary"
                  >
                    Add Domain
                  </Button>
                </div>
              )}

              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-row items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0 text-slate-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">
                          {domain.domain}
                        </h3>
                        {domain.is_primary && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {domain.is_verified ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                            <AlertCircle className="h-3 w-3" /> DNS
                            Configuration Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!domain.is_verified && (
                      <Button
                        onClick={() => setSelectedDnsDomain(domain)}
                        variant="ghost"
                        size="sm"
                        className="text-[#0b5cff] font-bold hover:bg-blue-50"
                      >
                        View DNS Setup
                      </Button>
                    )}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove Domain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                Add Custom Domain
              </h3>
            </div>

            <form onSubmit={handleAddDomain} className="p-6 space-y-6">
              <div>
                <Input
                  label={
                    <span className="text-slate-700 font-bold">
                      Domain Name
                    </span>
                  }
                  placeholder="e.g. link.yourbrand.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="bitly-input"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  We recommend using a subdomain like 'link' or 'promo'.
                </p>
              </div>

              {addError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold border border-red-200 rounded-lg">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bitly-button-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bitly-button-primary"
                >
                  Add Domain
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DNSSetupModal
        isOpen={!!selectedDnsDomain}
        onClose={() => setSelectedDnsDomain(null)}
        domain={selectedDnsDomain}
      />
      
      <ConfirmModal
        isOpen={domainToDelete !== null}
        onClose={() => setDomainToDelete(null)}
        onConfirm={async () => {
          if (domainToDelete) {
            await deleteDomain(domainToDelete);
            toast.success("Domain removed.");
            setDomainToDelete(null);
          }
        }}
        title="Remove Domain"
        message="All links using this domain will break! Are you sure you want to remove it?"
      />
    </DashboardLayout>
  );
}
