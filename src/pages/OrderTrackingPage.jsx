import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, ArrowLeft, Copy, Check, MapPin, Activity } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useBiteship } from "@/hooks/useBiteship";

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const { trackWaybill, isTracking } = useBiteship();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setIsLoading(false);
      setError("ID Pesanan tidak tersedia.");
    }
  }, [orderId]);

  const fetchOrder = async (id) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setOrder(data);

      if (data && data.shipping_courier && data.tracking_number) {
        const trk = await trackWaybill(data.tracking_number, data.shipping_courier);
        if (trk && trk.success) {
          setTrackingData(trk);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Pesanan tidak ditemukan atau ID tidak valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResi = (resi) => {
    navigator.clipboard.writeText(resi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': 
        return { icon: <Clock className="w-8 h-8 text-yellow-500" />, title: "Menunggu Pembayaran", desc: "Harap selesaikan pembayaran Anda.", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
      case 'paid': 
        return { icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />, title: "Pembayaran Diterima", desc: "Pembayaran Anda telah diverifikasi. Menunggu proses penjual.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      case 'processing': 
        return { icon: <Package className="w-8 h-8 text-blue-500" />, title: "Pesanan Diproses", desc: "Penjual sedang menyiapkan pesanan Anda.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
      case 'shipped': 
        return { icon: <Truck className="w-8 h-8 text-indigo-500" />, title: "Pesanan Dikirim", desc: "Pesanan Anda sedang dalam perjalanan!", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" };
      case 'delivered': 
        return { icon: <CheckCircle2 className="w-8 h-8 text-green-500" />, title: "Terkirim", desc: "Paket telah diterima.", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
      case 'failed': 
        return { icon: <XCircle className="w-8 h-8 text-red-500" />, title: "Dibatalkan/Gagal", desc: "Pembayaran gagal atau dibatalkan.", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      default: 
        return { icon: <Search className="w-8 h-8 text-slate-400" />, title: "Status Tidak Diketahui", desc: "Harap hubungi penjual.", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-[#0b5cff] rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">Mencari pesanan Anda...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Helmet><title>Pesanan Tidak Ditemukan | RYZLink</title></Helmet>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">{error || "Kami tidak dapat menemukan pesanan dengan ID tersebut."}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">
            <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(order.status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-10 px-4 pb-20 font-sans">
      <Helmet><title>Lacak Pesanan | RYZLink</title></Helmet>
      
      <div className="max-w-2xl w-full mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/${order.page_slug}`} className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Lacak Pesanan</h1>
            <p className="text-slate-500 font-medium text-sm">ID Pesanan: <span className="font-mono text-slate-400 select-all">{order.id}</span></p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 ${statusInfo.border} mb-6 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${statusInfo.bg}`}></div>
          <div className="flex items-start md:items-center gap-5 flex-col md:flex-row relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${statusInfo.bg}`}>
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-extrabold mb-1 ${statusInfo.color}`}>{statusInfo.title}</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{statusInfo.desc}</p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 font-medium shadow-sm">
                  Diperbarui: {new Date(order.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping details (only show if processed or shipped) */}
        {(order.shipping_courier || order.tracking_number) && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0b5cff]" /> Informasi Pengiriman
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.shipping_courier && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kurir</div>
                  <div className="font-extrabold text-slate-800 text-lg uppercase">{order.shipping_courier}</div>
                </div>
              )}
              {order.tracking_number && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Resi / Pelacakan</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800 text-lg flex-1 overflow-hidden text-ellipsis">{order.tracking_number}</span>
                    <button 
                      onClick={() => handleCopyResi(order.tracking_number)}
                      className="p-2 bg-white border border-slate-200 hover:border-[#0b5cff] text-slate-500 hover:text-[#0b5cff] rounded-xl transition-colors shadow-sm"
                      title="Salin Resi"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Biteship Tracking Timeline */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0b5cff]" /> Status Pelacakan Langsung
              </h4>
              
              {isTracking ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-slate-200 border-t-[#0b5cff] rounded-full"></div>
                  Mengambil pembaruan dari kurir...
                </div>
              ) : trackingData ? (
                <div className="relative pl-6 space-y-6 mt-6">
                  {/* Vertical Line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-blue-100"></div>
                  
                  {trackingData.history && trackingData.history.slice().reverse().map((hist, idx) => (
                    <div key={idx} className="relative z-10">
                      <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-[#0b5cff] shadow-[0_0_0_4px_rgba(11,92,255,0.2)]' : 'bg-slate-300'}`}></div>
                      <div className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">
                        {new Date(hist.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      <div className={`text-sm font-semibold ${idx === 0 ? 'text-slate-900 text-base' : 'text-slate-600'}`}>
                        {hist.note}
                      </div>
                      {hist.status && (
                        <div className="inline-block mt-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                          {hist.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-5 text-sm text-slate-500 font-medium text-center border border-slate-100">
                  Informasi pelacakan belum tersedia dari kurir.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-4">Detail Pesanan</h3>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-base">{order.product_name}</h4>
              {order.variant_name && <p className="text-sm font-medium text-slate-500 mt-1 inline-block bg-slate-50 px-2.5 py-1 rounded border border-slate-100">Varian: {order.variant_name}</p>}
            </div>
            <div className="font-extrabold text-[#0b5cff] text-lg">Rp {order.amount?.toLocaleString('id-ID')}</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-100 mt-6 space-y-3">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Informasi Pelanggan</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block mb-0.5">Nama</span>
                <span className="font-bold text-slate-700">{order.customer_name}</span>
              </div>
              {order.customer_phone && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Telepon</span>
                  <span className="font-bold text-slate-700">{order.customer_phone}</span>
                </div>
              )}
              {order.customer_email && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <span className="font-bold text-slate-700">{order.customer_email}</span>
                </div>
              )}
              {order.customer_address && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Alamat Pengiriman</span>
                  <span className="font-medium text-slate-700 block bg-white p-3 rounded-xl border border-slate-100 mt-1 leading-relaxed">
                    {order.customer_address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
