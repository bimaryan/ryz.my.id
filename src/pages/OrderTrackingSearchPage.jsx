import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function OrderTrackingSearchPage() {
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    // Remove spaces just in case
    const cleanId = orderId.trim().replace(/\s+/g, '');
    navigate(`/track/${cleanId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Lacak Pesanan | RYZLink</title>
      </Helmet>
      
      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-md w-full text-center relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-50 rounded-full mix-blend-multiply opacity-50 blur-xl"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-indigo-50 rounded-full mix-blend-multiply opacity-50 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0b5cff] to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 transform rotate-3 hover:rotate-6 transition-transform">
            <Package className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2 tracking-tight">Lacak Pesanan</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">Masukkan ID Pesanan Anda untuk melacak status paket pengiriman.</p>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="misal: 550e8400-e29b-..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 transition-all outline-none"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              Lacak Paket <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-slate-400 text-sm mt-8 font-medium">
        Powered by <span className="font-bold text-slate-600">RYZLink</span>
      </p>
    </div>
  );
}
