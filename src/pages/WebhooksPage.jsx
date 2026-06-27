import { useEffect, useState } from"react";
import toast from"react-hot-toast";
import ConfirmModal from"@/components/ui/ConfirmModal";
import { Webhook, Plus, Search, Trash2, Power, Activity } from"lucide-react";
import SEO from"@/components/SEO";
import DashboardLayout from"@/components/layout/DashboardLayout";
import Button from"@/components/ui/Button";
import Input from"@/components/ui/Input";
import { useWebhooks } from"@/hooks/useWebhooks";
import LoadingSpinner from '@/components/LoadingSpinner';

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
 const [webhookToDelete, setWebhookToDelete] = useState(null);

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

 const handleDelete = (id) => {
 setWebhookToDelete(id);
 };

 return (
 <DashboardLayout>
 <SEO title="Webhooks | RYZ Shortlink" />

 <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
 <div className="space-y-8">
 <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div className="max-w-2xl">
 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
 <Webhook className="h-8 w-8 text-[#0b5cff]" />
 Webhook
 </h1>
 <p className="text-slate-600 font-medium">
 Kirim data secara real-time ke server Anda saat ada aktivitas.
 </p>
 </div>
 <div>
 <Button
 size="md"
 onClick={() => setIsAddModalOpen(true)}
 className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap"
 >
 <Plus className="h-4 w-4 mr-2" /> Tambah Webhook
 </Button>
 </div>
 </div>

 <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
 <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-white">
 <h2 className="text-xl font-extrabold text-slate-800">
 Titik Akhir (Endpoints) yang Dikonfigurasi
 </h2>
 </div>

 <div className="divide-y divide-slate-100">
 {isLoading && webhooks.length === 0 && (
 <div className="text-center py-10">
 <LoadingSpinner size="large" />
 </div>
 )}

 {!isLoading && webhooks.length === 0 && (
 <div className="py-16 text-center bg-white">
 <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
 <Webhook className="h-10 w-10 text-[#0b5cff]" />
 </div>
 <h3 className="text-xl font-extrabold text-slate-800 mb-2">
 Belum ada webhook yang dikonfigurasi
 </h3>
 <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">
 Tambahkan titik akhir (endpoint) untuk menerima payload data aktivitas secara real-time.
 </p>
 <Button
 onClick={() => setIsAddModalOpen(true)}
 className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
 >
 Tambah Webhook
 </Button>
 </div>
 )}

 {webhooks.map((webhook) => (
 <div
 key={webhook.id}
 className={`p-6 sm:px-8 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all duration-300 group ${!webhook.is_active ?"bg-slate-50 opacity-75" :"hover:bg-slate-50/80"}`}
 >
 <div className="flex flex-row items-center gap-5">
 <div
 className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${webhook.is_active ?"bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100/50 text-[#0b5cff] shadow-sm" :"bg-slate-100 border-slate-200 text-slate-400"}`}
 >
 <Webhook className="h-6 w-6" />
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
 className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${webhook.is_active ?"bg-green-100 text-green-700" :"bg-slate-200 text-slate-600"}`}
 >
 {webhook.is_active ?"Aktif" :"Jeda"}
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
 ?"text-amber-600 hover:bg-amber-50"
 :"text-green-600 hover:bg-green-50"
 }
 >
 <Power className="h-4 w-4 mr-2" />
 {webhook.is_active ?"Jeda" :"Aktifkan"}
 </Button>
 <Button
 variant="ghost"
 size="sm"
 className="text-slate-500 hover:bg-slate-100 font-bold"
 >
 <Activity className="h-4 w-4 mr-2" /> Log
 </Button>
 <div className="h-6 w-px bg-slate-200 mx-2"></div>
 <button
 onClick={() => handleDelete(webhook.id)}
 className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
 title="Hapus Webhook"
 >
 <Trash2 className="h-5 w-5" />
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
 <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
 <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
 <h3 className="text-xl font-extrabold text-slate-800">Tambah Webhook</h3>
 </div>

 <form onSubmit={handleAddWebhook} className="p-6 space-y-5">
 <div>
 <Input
 label={
 <span className="text-slate-700 font-bold">
 URL Payload
 </span>
 }
 placeholder="https://server-anda.com/webhook"
 value={urlInput}
 onChange={(e) => setUrlInput(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
 autoFocus
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Tipe Event
 </label>
 <select
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5 h-[46px]"
 value={eventInput}
 onChange={(e) => setEventInput(e.target.value)}
 >
 <option value="link.clicked">Tautan Diklik (link.clicked)</option>
 <option value="link.created">Tautan Dibuat (link.created)</option>
 </select>
 </div>

 {addError && (
 <div className="p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">
 {addError}
 </div>
 )}

 <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
 <Button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 variant="secondary"
 >
 Batal
 </Button>
 <Button
 type="submit"
 isLoading={isSubmitting}
 className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
 >
 Tambah Endpoint
 </Button>
 </div>
 </form>
 </div>
 </div>
 )}
 <ConfirmModal
 isOpen={webhookToDelete !== null}
 onClose={() => setWebhookToDelete(null)}
 onConfirm={async () => {
 if (webhookToDelete) {
 await deleteWebhook(webhookToDelete);
 toast.success("Webhook dihapus");
 setWebhookToDelete(null);
 }
 }}
 title="Hapus Webhook"
 message="Apakah Anda yakin ingin menghapus webhook ini?"
 />
 </DashboardLayout>
 );
}
