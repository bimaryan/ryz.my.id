import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Webhook, Plus, Search, Trash2, Power, Activity } from "lucide-react";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useWebhooks } from "@/hooks/useWebhooks";

export default function WebhooksPage() {
  const {
    webhooks,
    fetchWebhooks,
    addWebhook,
    deleteWebhook,
    toggleWebhook,
    isLoading,
  } = useWebhooks();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [urlInput, setUrlInput] = useState("");
  const [eventInput, setEventInput] = useState("link.clicked");
  const [addError, setAddError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    setAddError(null);
    setIsSubmitting(true);

    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
      setAddError("Webhook URL must start with http:// or https://");
      setIsSubmitting(false);
      return;
    }

    const res = await addWebhook({ url: urlInput, event_type: eventInput });
    if (res.success) {
      setUrlInput("");
      setIsAddModalOpen(false);
    } else {
      setAddError(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this webhook?",
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
      await deleteWebhook(id);
      Swal.fire({
        title: "Deleted!",
        text: "Webhook deleted.",
        icon: "success",
        confirmButtonColor: "#0b5cff"
      });
    }
  };

  return (
    <DashboardLayout>
      <SEO title="Webhooks | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Webhooks
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Send real-time data to your servers when events happen.
              </p>
            </div>
            <Button
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              className="bitly-button-primary shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Webhook
            </Button>
          </div>

          <div className="bitly-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">
                Configured Endpoints
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading && webhooks.length === 0 && (
                <div className="text-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-[#0b5cff] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {!isLoading && webhooks.length === 0 && (
                <div className="py-16 text-center bg-slate-50">
                  <div className="h-12 w-12 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Webhook className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">
                    No webhooks configured
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">
                    Add an endpoint to receive real-time event payloads.
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bitly-button-secondary"
                  >
                    Add Webhook
                  </Button>
                </div>
              )}

              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-colors ${!webhook.is_active ? "bg-slate-50 opacity-75" : "hover:bg-slate-50"}`}
                >
                  <div className="flex flex-row items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 ${webhook.is_active ? "bg-[#0b5cff]/10 border-[#0b5cff]/20 text-[#0b5cff]" : "bg-slate-100 border-slate-200 text-slate-400"}`}
                    >
                      <Webhook className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-base">
                          {webhook.url}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-sm border border-slate-300">
                          {webhook.event_type}
                        </span>
                        <span
                          className={`text-xs font-medium ${webhook.is_active ? "text-green-600" : "text-slate-500"}`}
                        >
                          {webhook.is_active ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleWebhook(webhook.id, webhook.is_active)
                      }
                      className={
                        webhook.is_active
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-green-600 hover:bg-green-50"
                      }
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {webhook.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:bg-slate-100"
                    >
                      <Activity className="h-4 w-4 mr-2" /> Logs
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Add Webhook</h3>
            </div>

            <form onSubmit={handleAddWebhook} className="p-6 space-y-5">
              <div>
                <Input
                  label={
                    <span className="text-slate-700 font-bold">
                      Payload URL
                    </span>
                  }
                  placeholder="https://your-server.com/webhook"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bitly-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Event Type
                </label>
                <select
                  className="bitly-input w-full px-4 h-11 rounded-lg border border-slate-300 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 bg-white"
                  value={eventInput}
                  onChange={(e) => setEventInput(e.target.value)}
                >
                  <option value="link.clicked">Link Clicked</option>
                  <option value="link.created">Link Created</option>
                </select>
              </div>

              {addError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold border border-red-200 rounded-lg">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  Add Endpoint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
