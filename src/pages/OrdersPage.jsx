import { useEffect, useState } from"react";
import { supabase } from"@/lib/supabase";
import { useAuth } from"@/hooks/useAuth";
import SEO from"@/components/SEO";
import DashboardLayout from"@/components/layout/DashboardLayout";
import { ShoppingCart, Edit, Package, Search, Clock, CheckCircle2, Truck, XCircle, ChevronDown, Save } from"lucide-react";
import toast from"react-hot-toast";
import { useBiteship } from"@/hooks/useBiteship";
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrdersPage() {
 const { user } = useAuth();
 const [orders, setOrders] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [filterStatus, setFilterStatus] = useState("");
 const { couriers, fetchCouriers } = useBiteship();
 
 // States for editing order
 const [editingOrderId, setEditingOrderId] = useState(null);
 const [editStatus, setEditStatus] = useState("");
 const [editCourier, setEditCourier] = useState("");
 const [editTrackingNumber, setEditTrackingNumber] = useState("");
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
 if (!user) return;
 fetchOrders();
 fetchCouriers();
 }, [user]);

 const fetchOrders = async () => {
 try {
 setIsLoading(true);
 // Fetch user's pages to get orders related to them
 const { data: pages } = await supabase
 .from('pages')
 .select('slug')
 .eq('user_id', user.id);
 
 if (!pages || pages.length === 0) {
 setOrders([]);
 setIsLoading(false);
 return;
 }
 
 const slugs = pages.map(p => p.slug);
 
 const { data, error } = await supabase
 .from('orders')
 .select('*')
 .in('page_slug', slugs)
 .order('created_at', { ascending: false });

 if (error) throw error;
 setOrders(data || []);
 } catch (error) {
 console.error("Error fetching orders:", error);
 toast.error("Failed to load orders");
 } finally {
 setIsLoading(false);
 }
 };

 const startEditing = (order) => {
 setEditingOrderId(order.id);
 setEditStatus(order.status || 'pending');
 setEditCourier(order.shipping_courier || '');
 setEditTrackingNumber(order.tracking_number || '');
 };

 const cancelEditing = () => {
 setEditingOrderId(null);
 setEditStatus("");
 setEditCourier("");
 setEditTrackingNumber("");
 };

 const saveOrderUpdate = async (id) => {
 if (isSaving) return;
 setIsSaving(true);
 
 try {
 const { error } = await supabase
 .from('orders')
 .update({
 status: editStatus,
 shipping_courier: editCourier,
 tracking_number: editTrackingNumber,
 updated_at: new Date().toISOString()
 })
 .eq('id', id);

 if (error) throw error;
 
 toast.success("Order updated successfully!");
 setOrders(orders.map(o => o.id === id ? {
 ...o,
 status: editStatus,
 shipping_courier: editCourier,
 tracking_number: editTrackingNumber,
 updated_at: new Date().toISOString()
 } : o));
 
 cancelEditing();
 } catch (err) {
 console.error(err);
 toast.error("Failed to update order");
 } finally {
 setIsSaving(false);
 }
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case 'pending': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider"><Clock className="w-3.5 h-3.5" /> Pending</span>;
 case 'paid': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
 case 'processing': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider"><Package className="w-3.5 h-3.5" /> Processing</span>;
 case 'shipped': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider"><Truck className="w-3.5 h-3.5" /> Shipped</span>;
 case 'delivered': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
 case 'failed': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider"><XCircle className="w-3.5 h-3.5" /> Failed/Canceled</span>;
 default: return <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">{status}</span>;
 }
 };

 const filteredOrders = orders.filter(o => {
 const matchesSearch = !searchQuery || 
 o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
 o.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 o.id.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = !filterStatus || o.status === filterStatus;
 return matchesSearch && matchesStatus;
 });

 return (
 <DashboardLayout>
 <SEO title="Orders Management | RYZLink" />

 <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
 {/* Header Section */}
 <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div className="max-w-2xl">
 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
 <ShoppingCart className="text-[#0b5cff] w-8 h-8" /> Pesanan
 </h1>
 <p className="text-slate-600 font-medium">
 Kelola penjualan Anda, perbarui status pengiriman, dan lacak paket.
 </p>
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
 placeholder="Cari pelanggan, produk, atau ID Pesanan..."
 className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl text-sm transition-all outline-none text-slate-700 font-medium"
 />
 </div>
 <div className="relative min-w-[160px]">
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#0b5cff] focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl text-sm font-bold text-slate-700 transition-all outline-none shadow-sm cursor-pointer"
 >
 <option value="">Semua Status</option>
 <option value="pending">Tertunda (Pending)</option>
 <option value="paid">Dibayar (Paid)</option>
 <option value="processing">Diproses (Processing)</option>
 <option value="shipped">Dikirim (Shipped)</option>
 <option value="delivered">Diterima (Delivered)</option>
 <option value="failed">Gagal/Dibatalkan</option>
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
 </div>
 </div>

 {/* Orders Table */}
 <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm text-slate-600">
 <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
 <tr>
 <th className="px-6 sm:px-8 py-5">Info Pesanan</th>
 <th className="px-6 sm:px-8 py-5">Pelanggan</th>
 <th className="px-6 sm:px-8 py-5">Status & Pengiriman</th>
 <th className="px-6 sm:px-8 py-5 text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {isLoading ? (
 <tr>
 <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
 <LoadingSpinner size="large" />
 Memuat pesanan...
 </td>
 </tr>
 ) : filteredOrders.length === 0 ? (
 <tr>
 <td colSpan="4" className="px-6 py-12 text-center">
 <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center mx-auto mb-5 shadow-sm">
 <ShoppingCart className="w-10 h-10 text-blue-500" />
 </div>
 <p className="text-slate-500 font-medium text-lg">Belum ada pesanan ditemukan.</p>
 </td>
 </tr>
 ) : (
 filteredOrders.map(order => (
 <tr key={order.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
 <td className="px-6 sm:px-8 py-5 align-top">
 <div className="font-bold text-slate-800 text-base">{order.product_name}</div>
 {order.variant_name && <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md inline-block mt-2">Varian: {order.variant_name}</div>}
 <div className="text-slate-500 font-medium mt-1">ID: <span className="text-slate-400 text-xs font-mono">{order.id.split('-')[0]}</span></div>
 <div className="font-black text-[#0b5cff] mt-2 text-lg">Rp {order.amount?.toLocaleString('id-ID')}</div>
 <div className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
 </td>
 <td className="px-6 sm:px-8 py-5 align-top max-w-[250px]">
 <div className="font-bold text-slate-800">{order.customer_name}</div>
 <div className="text-slate-500 text-xs mt-1 space-y-0.5">
 {order.customer_email && <div>✉️ {order.customer_email}</div>}
 {order.customer_phone && <div>📞 {order.customer_phone}</div>}
 </div>
 {order.customer_address && (
 <div className="mt-3 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
 <span className="font-bold text-slate-600 block mb-1">Alamat:</span>
 {order.customer_address}
 </div>
 )}
 {order.custom_answers && Object.keys(order.custom_answers).length > 0 && (
 <div className="mt-2 text-xs">
 <span className="font-bold text-slate-600 block mb-1">Jawaban Form:</span>
 {Object.entries(order.custom_answers).map(([k, v]) => (
 <div key={k} className="truncate text-slate-500">• {v}</div>
 ))}
 </div>
 )}
 </td>
 <td className="px-6 sm:px-8 py-5 align-top">
 {editingOrderId === order.id ? (
 <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
 <div>
 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
 <select 
 value={editStatus}
 onChange={e => setEditStatus(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl text-sm px-3 py-2 focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 outline-none transition-all"
 >
 <option value="pending">Tertunda</option>
 <option value="paid">Dibayar</option>
 <option value="processing">Diproses</option>
 <option value="shipped">Dikirim</option>
 <option value="delivered">Diterima</option>
 <option value="failed">Gagal/Dibatalkan</option>
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kurir Pengiriman</label>
 <div className="relative">
 <select 
 value={editCourier}
 onChange={e => setEditCourier(e.target.value)}
 className="w-full appearance-none bg-white border border-slate-200 rounded-xl text-sm px-3 py-2 focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 outline-none transition-all"
 >
 <option value="">Pilih Kurir...</option>
 {couriers.map(c => (
 <option key={c.courier_code} value={c.courier_code}>{c.courier_name}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
 </div>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor Resi / Pelacakan</label>
 <input 
 type="text"
 value={editTrackingNumber}
 onChange={e => setEditTrackingNumber(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl text-sm px-3 py-2 focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 outline-none transition-all"
 placeholder="Nomor Resi Pengiriman"
 />
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 <div>{getStatusBadge(order.status)}</div>
 {(order.shipping_courier || order.tracking_number) && (
 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 mt-2">
 {order.shipping_courier && <div className="text-xs text-slate-500"><span className="font-bold text-slate-700">Kurir:</span> {order.shipping_courier}</div>}
 {order.tracking_number && (
 <div className="text-xs text-slate-500">
 <span className="font-bold text-slate-700">Resi:</span> <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 select-all shadow-sm">{order.tracking_number}</span>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </td>
 <td className="px-6 sm:px-8 py-5 align-top text-right">
 {editingOrderId === order.id ? (
 <div className="flex flex-col gap-2 items-end">
 <button 
 onClick={() => saveOrderUpdate(order.id)}
 disabled={isSaving}
 className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
 >
 <Save className="w-3.5 h-3.5" /> {isSaving ? 'Menyimpan...' : 'Simpan'}
 </button>
 <button 
 onClick={cancelEditing}
 className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold transition-all"
 >
 Batal
 </button>
 </div>
 ) : (
 <div className="flex flex-col gap-2 items-end">
 <button 
 onClick={() => startEditing(order)}
 className="border border-transparent hover:border-slate-200 text-slate-500 hover:text-[#0b5cff] bg-slate-50 hover:bg-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
 >
 <Edit className="w-3.5 h-3.5" /> Kelola
 </button>
 <a 
 href={`/track/${order.id}`}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-bold text-[#0b5cff] hover:text-indigo-600 hover:underline transition-colors mt-1"
 >
 Lihat Pelacakan
 </a>
 </div>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </DashboardLayout>
 );
}
