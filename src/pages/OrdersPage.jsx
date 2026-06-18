import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ShoppingCart, Edit, Package, Search, Clock, CheckCircle2, Truck, XCircle, ChevronDown, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useBiteship } from "@/hooks/useBiteship";

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <ShoppingCart className="text-[#0b5cff] w-8 h-8" /> Orders
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Manage your sales, update shipping status, and track packages.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#8290a3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, product, or Order ID..."
              className="w-full pl-10 pr-4 py-2 bg-[#f4f6fa] border border-transparent focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-lg text-sm transition-all outline-none"
            />
          </div>
          <div className="relative min-w-[160px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0b5cff] focus:ring-4 focus:ring-[#0b5cff]/10 rounded-lg text-sm font-medium text-slate-700 transition-all outline-none shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid (Awaiting Processing)</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed/Canceled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status & Shipping</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-[#0b5cff] rounded-full mx-auto mb-4"></div>
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No orders found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-800 text-base">{order.product_name}</div>
                        {order.variant_name && <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">Variant: {order.variant_name}</div>}
                        <div className="text-slate-500 font-medium mt-1">ID: <span className="text-slate-400 text-xs font-mono">{order.id.split('-')[0]}</span></div>
                        <div className="font-black text-[#0b5cff] mt-2">Rp {order.amount?.toLocaleString('id-ID')}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-[250px]">
                        <div className="font-bold text-slate-800">{order.customer_name}</div>
                        <div className="text-slate-500 text-xs mt-1 space-y-0.5">
                          {order.customer_email && <div>✉️ {order.customer_email}</div>}
                          {order.customer_phone && <div>📞 {order.customer_phone}</div>}
                        </div>
                        {order.customer_address && (
                          <div className="mt-3 text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                            <span className="font-bold text-slate-600 block mb-1">Address:</span>
                            {order.customer_address}
                          </div>
                        )}
                        {order.custom_answers && Object.keys(order.custom_answers).length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="font-bold text-slate-600 block mb-1">Answers:</span>
                            {Object.entries(order.custom_answers).map(([k, v]) => (
                              <div key={k} className="truncate text-slate-500">• {v}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {editingOrderId === order.id ? (
                          <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                              <select 
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed/Canceled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Courier (Biteship)</label>
                              <div className="relative">
                                <select 
                                  value={editCourier}
                                  onChange={e => setEditCourier(e.target.value)}
                                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 outline-none"
                                >
                                  <option value="">Select Courier...</option>
                                  {couriers.map(c => (
                                    <option key={c.courier_code} value={c.courier_code}>{c.courier_name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking Number / Resi</label>
                              <input 
                                type="text"
                                value={editTrackingNumber}
                                onChange={e => setEditTrackingNumber(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20 outline-none"
                                placeholder="Tracking / Receipt Number"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>{getStatusBadge(order.status)}</div>
                            {(order.shipping_courier || order.tracking_number) && (
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 mt-2">
                                {order.shipping_courier && <div className="text-xs text-slate-500"><span className="font-bold text-slate-700">Courier:</span> {order.shipping_courier}</div>}
                                {order.tracking_number && (
                                  <div className="text-xs text-slate-500">
                                    <span className="font-bold text-slate-700">Resi:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 select-all">{order.tracking_number}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        {editingOrderId === order.id ? (
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => saveOrderUpdate(order.id)}
                              disabled={isSaving}
                              className="bg-[#0b5cff] hover:bg-[#094acc] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => startEditing(order)}
                              className="border border-slate-200 hover:border-[#0b5cff] text-slate-600 hover:text-[#0b5cff] bg-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
                            >
                              <Edit className="w-3.5 h-3.5" /> Manage
                            </button>
                            <a 
                              href={`/track/${order.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-[#0b5cff] hover:underline"
                            >
                              View Track Page
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
