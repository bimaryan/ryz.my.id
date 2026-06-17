import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useLinks } from "@/hooks/useLinks";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Link2,
  ExternalLink,
  Copy,
  Trash2,
  QrCode,
  Calendar,
  ArrowUpRight,
  Share2,
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

  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    return (
      (link.title && link.title.toLowerCase().includes(searchQuery)) ||
      (link.short_code && link.short_code.toLowerCase().includes(searchQuery)) ||
      (link.original_url && link.original_url.toLowerCase().includes(searchQuery))
    );
  });
  const [qrCodeLink, setQrCodeLink] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Quick create state
  const [quickUrl, setQuickUrl] = useState("");
  const [quickQr, setQuickQr] = useState(false);
  const { createLink, isCreating } = useLinks();

  useEffect(() => {
    fetchLinks();
    fetchOverallStats();
  }, [fetchLinks, fetchOverallStats]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        confirmButton: "bg-[#d33] hover:bg-[#b32b2b] text-white font-bold py-2 px-4 rounded ml-2",
        cancelButton: "bg-[#566b8f] hover:bg-[#435574] text-white font-bold py-2 px-4 rounded"
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      await deleteLink(id);
      Swal.fire({
        title: "Deleted!",
        text: "Your link has been deleted.",
        icon: "success",
        customClass: {
          confirmButton: "bg-[#0b5cff] hover:bg-[#094bdd] text-white font-bold py-2 px-4 rounded"
        },
        buttonsStyling: false
      });
    }
  };

  const handleCopy = (link) => {
    const domain = link.custom_domain ? `https://${link.custom_domain}` : window.location.origin;
    const url = `${domain}/${link.short_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.short_code);
    toast.success("Link copied to clipboard!", { position: "bottom-center" });
    setTimeout(() => setCopiedId(null), 2000);
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
        // Find the newly created link from the links array after refresh, or just show modal with basic data
        // For simplicity, we can fetch it or trust the real-time update
      }
    }
  };

  return (
    <DashboardLayout>
      <SEO title="Dashboard | RYZ Shortlink" />

      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Welcome back, {user?.user_metadata?.full_name || "User"}!
            </p>
          </div>

          {/* Exact Bitly Layout Section */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Quick create: Short link */}
            <div className="flex-1 bg-white border border-[#e8ebf2] rounded-xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#273144]">
                  Quick create: Short link
                </h2>
                <span className="text-[#8290a3] text-sm">
                  You can create{" "}
                  <strong className="text-[#273144]">
                    {100 - (stats?.activeLinks || 0)}
                  </strong>{" "}
                  more links this month.
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#273144] mb-2 font-semibold">
                  Domain:{" "}
                  <span className="font-normal text-[#5a6872]">ryz.my.id</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-[#273144] mb-2">
                  Enter your destination URL
                </label>
                <form
                  onSubmit={handleQuickCreate}
                  className="flex gap-4 flex-col sm:flex-row"
                >
                  <input
                    type="text"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    placeholder="https://example.com/my-long-url"
                    className="bitly-input flex-1"
                    disabled={isCreating}
                  />
                  <Button
                    type="submit"
                    className="bitly-button-primary whitespace-nowrap py-3"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create your short link"}
                  </Button>
                </form>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  checked={quickQr}
                  onChange={(e) => setQuickQr(e.target.checked)}
                  className="w-4 h-4 border-[#d6dbe5] rounded text-[#0b5cff] focus:ring-[#0b5cff]"
                />
                <label className="text-sm text-[#273144]">
                  Also create a QR Code for this link
                </label>
              </div>
            </div>

            {/* Monthly usage */}
            <div className="w-full lg:w-[480px] bg-white border border-[#e8ebf2] rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col">
              <h2 className="text-xl font-bold text-[#273144] mb-1">
                Monthly usage
              </h2>
              <p className="text-[#5a6872] text-sm mb-6">
                Current Billing Cycle
              </p>

              <div className="border border-[#e8ebf2] rounded-lg p-5 space-y-6 flex-1">
                <div>
                  <div className="flex justify-between font-bold text-[#273144] mb-2 text-sm">
                    <span>Short links</span>
                    <span>{stats?.activeLinks || 0} of 100 used</span>
                  </div>
                  <div className="w-full bg-[#f4f6fa] rounded-full h-2">
                    <div
                      className="bg-[#0b5cff] h-2 rounded-full"
                      style={{
                        width: `${Math.min(((stats?.activeLinks || 0) / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#273144] mb-2 text-sm">
                    <span>Total Clicks / Visitors</span>
                    <span>{stats?.totalClicks || 0} clicks</span>
                  </div>
                  <div className="w-full bg-[#f4f6fa] rounded-full h-2">
                    <div
                      className="bg-[#008080] h-2 rounded-full"
                      style={{
                        width: `${Math.min(((stats?.totalClicks || 0) / 1000) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Link List */}
          <div className="bitly-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">
                Your Recent Links
              </h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 rounded text-sm px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-[#0b5cff]">
                  <option>Filter</option>
                  <option>Marketing</option>
                  <option>Social</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {linksLoading && (
                <div className="text-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
              {!linksLoading && filteredLinks.length === 0 && (
                <div className="py-16 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-4">
                    {searchQuery ? "No links found matching your search." : "No links found."}
                  </p>
                </div>
              )}

              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate mb-1">
                      {link.title || link.short_code}
                    </h3>

                    <div className="flex items-center gap-3 mb-2">
                      <a
                        href={link.custom_domain ? `https://${link.custom_domain}/${link.short_code}` : `/${link.short_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0b5cff] hover:text-[#094bdd] hover:underline text-sm font-bold flex items-center gap-1 transition-colors"
                      >
                        {link.custom_domain || 'ryz.my.id'}/{link.short_code}{" "}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <p className="text-slate-500 text-sm truncate max-w-xl">
                      {link.original_url}
                    </p>

                    <div className="flex gap-2 mt-3 items-center">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />{" "}
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                      {link.category && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 uppercase">
                            {link.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xl">
                        {link.clicks_count || 0}
                      </p>
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">
                        Engagements
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                      <button
                        onClick={() => setShareLink(link)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Share Access"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setQrCodeLink(link)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(link)}
                        className="p-2 text-slate-400 hover:text-[#0b5cff] hover:bg-blue-50 rounded transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
    </DashboardLayout>
  );
}
