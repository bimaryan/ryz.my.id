import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useLinks } from "@/hooks/useLinks";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  QrCode,
  Calendar,
  Share2,
  MousePointerClick,
  Activity,
} from "lucide-react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import QRCodeModal from "@/components/QRCodeModal";
import ShareLinkModal from "@/components/ShareLinkModal";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const { links, fetchLinks, deleteLink, isLoading: linksLoading } = useLinks();
  const { stats, fetchOverallStats } = useAnalytics();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedLinkForShare, setSelectedLinkForShare] = useState(null);

  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").toLowerCase();
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredLinks = links.filter((link) => {
    // 1. Search Query Filter
    const matchesSearch = !searchQuery || (
      (link.title && link.title.toLowerCase().includes(searchQuery)) ||
      (link.short_code && link.short_code.toLowerCase().includes(searchQuery)) ||
      (link.original_url && link.original_url.toLowerCase().includes(searchQuery))
    );

    // 2. Category Filter
    const matchesCategory = !selectedCategory || link.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const [qrCodeLink, setQrCodeLink] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);

  // Quick create state
  const [quickUrl, setQuickUrl] = useState("");
  const [quickQr, setQuickQr] = useState(false);
  const { createLink, isCreating } = useLinks();

  useEffect(() => {
    fetchLinks();
    fetchOverallStats();
  }, [fetchLinks, fetchOverallStats]);

  const handleDelete = (id) => {
    setLinkToDelete(id);
  };

  const handleCopy = (link) => {
    const domain = link.custom_domain
      ? `https://${link.custom_domain}`
      : window.location.origin;
    const url = `${domain}/${link.short_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.short_code);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000); // Reset copy icon after 2 seconds
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) {
      toast.error("Please enter a destination URL");
      return;
    }

    // Auto-generate short code for quick create
    const randomCode = Math.random().toString(36).substring(2, 8);

    const success = await createLink({
      original_url: quickUrl.trim(),
      short_code: randomCode,
      title: "Quick Link",
      category: "General",
    });

    if (success) {
      toast.success("Link created successfully!");
      setQuickUrl("");
      if (quickQr) {
        // Implementation logic for quick QR
      }
    }
  };

  return (
    <DashboardLayout>
      <SEO title="Dashboard | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back,{" "}
            <span className="text-slate-700 font-semibold">
              {user?.user_metadata?.full_name || "User"}
            </span>
            !
          </p>
        </div>

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Create Card (Takes 2 Columns on Desktop) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Quick create: Short link
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Domain:{" "}
                  <span className="font-semibold text-slate-700">
                    ryz.my.id
                  </span>
                </p>
              </div>
              <div className="hidden sm:flex bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <span className="text-blue-600 text-sm font-semibold">
                  {100 - (stats?.activeLinks || 0)} links remaining
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Enter your destination URL
              </label>
              <form
                onSubmit={handleQuickCreate}
                className="flex gap-3 flex-col sm:flex-row"
              >
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    placeholder="https://example.com/my-long-url"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 transition-all outline-none text-slate-700"
                    disabled={isCreating}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#0b5cff] hover:bg-[#094acc] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow whitespace-nowrap"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Shorten URL"}
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="quickQr"
                checked={quickQr}
                onChange={(e) => setQuickQr(e.target.checked)}
                className="w-4 h-4 text-[#0b5cff] bg-slate-100 border-slate-300 rounded focus:ring-[#0b5cff] focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor="quickQr"
                className="text-sm font-medium text-slate-600 cursor-pointer select-none"
              >
                Also generate a QR Code for this link
              </label>
            </div>
          </div>

          {/* Monthly Usage Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Monthly Usage
            </h2>
            <p className="text-slate-500 text-sm mb-6">Current Billing Cycle</p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-6 flex-1">
              {/* Short Links Stat */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-2 text-sm items-center">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#0b5cff]" />
                    <span>Short links</span>
                  </div>
                  <span className="text-slate-500">
                    {stats?.activeLinks || 0} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#0b5cff] h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(((stats?.activeLinks || 0) / 100) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Clicks Stat */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-2 text-sm items-center">
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-emerald-500" />
                    <span>Total Clicks</span>
                  </div>
                  <span className="text-slate-500">
                    {stats?.totalClicks || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(((stats?.totalClicks || 0) / 1000) * 100, 100)}%`, // Assuming 1000 is a mock limit for progress bar
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link List Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-100 bg-white gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0b5cff]" />
              Your Recent Links
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm px-4 py-2 text-slate-700 font-semibold focus:outline-none focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(links.map(l => l.category).filter(Boolean))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {linksLoading && (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-[#0b5cff] rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-500 font-medium">
                  Loading your links...
                </p>
              </div>
            )}

            {!linksLoading && filteredLinks.length === 0 && (
              <div className="py-20 text-center bg-slate-50/50">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Link2 className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold mb-1 text-lg">
                  {searchQuery ? "No results found" : "No links created yet"}
                </p>
                <p className="text-slate-500 text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Use the form above to create your first short link."}
                </p>
              </div>
            )}

            {filteredLinks.slice(0, 10).map((link) => (
              <div
                key={link.id}
                className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Link Icon Avatar */}
                  <div className="hidden sm:flex mt-1 h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0b5cff]">
                    <Link2 className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg truncate mb-1">
                      {link.title || link.short_code}
                    </h3>

                    <div className="flex items-center gap-3 mb-2">
                      <a
                        href={
                          link.custom_domain
                            ? `https://${link.custom_domain}/${link.short_code}`
                            : `/${link.short_code}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0b5cff] hover:text-[#094bdd] hover:underline text-sm font-bold flex items-center gap-1.5 transition-colors w-fit"
                      >
                        {link.custom_domain || "ryz.my.id"}/{link.short_code}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <p className="text-slate-500 text-sm truncate max-w-2xl mb-3">
                      {link.original_url}
                    </p>

                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(link.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {link.category && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wide">
                          {link.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 sm:pl-14 lg:pl-0">
                  <div className="text-left lg:text-right">
                    <p className="font-extrabold text-slate-800 text-xl flex items-center gap-1.5 lg:justify-end">
                      <MousePointerClick className="w-5 h-5 text-slate-400 lg:hidden" />
                      {link.clicks_count || 0}
                    </p>
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                      Engagements
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-6">
                    <button
                      onClick={() => setShareLink(link)}
                      className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm hover:shadow rounded-lg transition-all"
                      title="Share Access"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setQrCodeLink(link)}
                      className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm hover:shadow rounded-lg transition-all"
                      title="QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(link)}
                      className={`p-2.5 border border-transparent shadow-sm hover:shadow rounded-lg transition-all ${
                        copiedId === link.short_code
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "text-slate-400 hover:text-[#0b5cff] hover:bg-white hover:border-slate-200"
                      }`}
                      title="Copy Link"
                    >
                      {copiedId === link.short_code ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 shadow-sm hover:shadow rounded-lg transition-all"
                      title="Delete"
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

      <QRCodeModal
        isOpen={!!qrCodeLink}
        onClose={() => setQrCodeLink(null)}
        link={qrCodeLink}
      />
      <ShareLinkModal
        isOpen={!!shareLink}
        onClose={() => setShareLink(null)}
        link={shareLink}
      />
      <ConfirmModal
        isOpen={linkToDelete !== null}
        onClose={() => setLinkToDelete(null)}
        onConfirm={async () => {
          if (linkToDelete) {
            await deleteLink(linkToDelete);
            toast.success("Your link has been deleted.");
            setLinkToDelete(null);
          }
        }}
        title="Delete Link"
        message="You won't be able to revert this! Are you sure you want to delete this link?"
      />
    </DashboardLayout>
  );
}
