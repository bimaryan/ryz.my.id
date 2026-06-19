import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { usePlanLimits } from '@/hooks/useSharesAndPlans'
import { useLinks } from '@/hooks/useLinks'
import { useCustomDomains } from '@/hooks/useCustomDomains'
import { usePages } from '@/hooks/usePages'
import { useBiteship } from '@/hooks/useBiteship'
import { useBillingHistory } from '@/hooks/useBillingHistory'
import { useActivityLog } from '@/hooks/useActivityLog'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { User, Shield, MonitorSmartphone, Mail, CheckCircle2, CreditCard, UploadCloud, Loader2, Store, Search as SearchIcon, Settings, Globe, Trash2, Plus, Copy, Check } from 'lucide-react'

const isApexDomain = (domain) => {
  if (!domain) return false;
  const parts = domain.split('.');
  if (parts.length === 2) return true;
  if (parts.length === 3 && ['co', 'or', 'ac', 'sch', 'go', 'biz', 'my', 'web', 'net', 'com'].includes(parts[1]) && parts[2].length === 2) {
    return true;
  }
  return false;
};

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  whatsapp_number: z.string().optional(),
})

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export default function SettingsPage() {
  const { user, updateProfile, updateEmail, updatePassword, isLoading } = useAuth()
  const { plans, fetchPlans, isLoading: isPlansLoading } = usePlanLimits()
  const { links, fetchLinks } = useLinks()
  const { domains, fetchDomains, addDomain, deleteDomain } = useCustomDomains()
  const { uploadImage } = usePages()
  const { history: billingHistory, fetchHistory: fetchBillingHistory, addBillingRecord, isLoading: isBillingLoading } = useBillingHistory()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const { areas, searchArea, isSearchingArea } = useBiteship()
  const [areaSearch, setAreaSearch] = useState('')
  const [showAreaResults, setShowAreaResults] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [selectedAreaName, setSelectedAreaName] = useState('')
  const [originAddress, setOriginAddress] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [isSavingEcommerce, setIsSavingEcommerce] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };
  
  const { logs, fetchLogs, logActivity, isLoading: isLogsLoading } = useActivityLog()
  
  // Parse current device details safely
  const getDeviceDetails = () => {
    try {
      const ua = navigator.userAgent;
      let browser = 'Unknown Browser';
      if (ua.includes('Firefox/')) browser = 'Firefox';
      else if (ua.includes('Edg/')) browser = 'Edge';
      else if (ua.includes('Chrome/')) browser = 'Chrome';
      else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
      
      let os = 'Unknown OS';
      if (ua.includes('Win')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'Mac OS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('like Mac')) os = 'iOS';

      return `${os} • ${browser}`;
    } catch {
      return 'Unknown Device';
    }
  };

  useEffect(() => {
    fetchPlans()
    fetchLinks()
    fetchDomains()
  }, [fetchPlans, fetchLinks, fetchDomains])

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingHistory()
    } else if (activeTab === 'activity') {
      fetchLogs()
    }
  }, [activeTab, fetchBillingHistory, fetchLogs])

  useEffect(() => {
    if (!document.querySelector('script[src*="snap.js"]')) {
      const scriptTag = document.createElement('script');
      scriptTag.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      scriptTag.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
      document.head.appendChild(scriptTag);
    }
  }, []);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      whatsapp_number: user?.user_metadata?.whatsapp_number || '',
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        whatsapp_number: user.user_metadata?.whatsapp_number || '',
      })
      if (user.user_metadata?.biteship_origin_area_id) {
        setSelectedAreaId(user.user_metadata.biteship_origin_area_id)
        setSelectedAreaName(user.user_metadata.biteship_origin_area_name || '')
        setOriginAddress(user.user_metadata.biteship_origin_address || '')
      }
      if (user.user_metadata?.bank_name) {
        setBankName(user.user_metadata.bank_name)
        setBankAccount(user.user_metadata.bank_account || '')
        setBankAccountName(user.user_metadata.bank_account_name || '')
      }
    }
  }, [user, resetProfile])

  const onProfileSubmit = async (data) => {
    setSuccessMsg('')
    setErrorMsg('')
    
    // Update Name & WA Number
    if (data.full_name !== user?.user_metadata?.full_name || data.whatsapp_number !== user?.user_metadata?.whatsapp_number) {
      const res = await updateProfile({ 
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number
      })
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
    }
    
    // Update Email
    if (data.email !== user?.email) {
      const res = await updateEmail(data.email)
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
      await logActivity('Email Address Updated')
    }

    if (data.full_name !== user?.user_metadata?.full_name || data.whatsapp_number !== user?.user_metadata?.whatsapp_number) {
      await logActivity('Profil Diperbarui')
    }

    setSuccessMsg('Profil berhasil diperbarui! Catatan: Perubahan email mungkin memerlukan konfirmasi.')
  }

  const onPasswordSubmit = async (data) => {
    setSuccessMsg('')
    setErrorMsg('')
    
    const res = await updatePassword(data.password)
    if (res.success) {
      await logActivity('Kata Sandi Diubah')
      setSuccessMsg('Kata sandi berhasil diperbarui!')
      resetPassword()
    } else {
      setErrorMsg(res.error)
    }
  }

  const handleEcommerceSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSavingEcommerce(true);

    if (!selectedAreaId) {
      setErrorMsg('Harap pilih area asal pengiriman (Kecamatan)');
      setIsSavingEcommerce(false);
      return;
    }

    const res = await updateProfile({
      biteship_origin_area_id: selectedAreaId,
      biteship_origin_area_name: selectedAreaName,
      biteship_origin_address: originAddress,
      bank_name: bankName,
      bank_account: bankAccount,
      bank_account_name: bankAccountName
    });

    setIsSavingEcommerce(false);
    if (res.success) {
      setSuccessMsg('Konfigurasi asal e-commerce berhasil disimpan!');
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan pengaturan e-commerce');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar harus kurang dari 2MB')
      return
    }

    setSuccessMsg('')
    setErrorMsg('')
    setIsUploadingAvatar(true)
    
    const res = await uploadImage(file)
    setIsUploadingAvatar(false)

    if (res.success) {
      const updateRes = await updateProfile({ avatar_url: res.url })
      if (updateRes.success) {
        setSuccessMsg('Avatar berhasil diperbarui!')
      } else {
        setErrorMsg(updateRes.error || 'Gagal memperbarui avatar di profil')
      }
    } else {
      setErrorMsg(res.error || 'Gagal mengunggah avatar')
    }
  }

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain) return;
    
    // Check limits
    const maxDomains = user?.user_metadata?.max_custom_domains || 1;
    if (maxDomains !== -1 && domains.length >= maxDomains) {
      setErrorMsg(`Batas custom domain Anda telah tercapai (${maxDomains} domain). Silakan upgrade paket.`);
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');
    setIsAddingDomain(true);
    
    const res = await addDomain(newDomain);
    setIsAddingDomain(false);
    
    if (res.success) {
      setSuccessMsg(`Domain ${newDomain} berhasil ditambahkan! Silakan atur DNS Anda.`);
      setNewDomain('');
    } else {
      setErrorMsg(res.error || 'Gagal menambahkan domain. Pastikan domain belum terdaftar.');
    }
  };

  const handleDeleteDomain = async (id, domainName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus domain ${domainName}? Link yang menggunakan domain ini akan kembali menggunakan domain utama.`)) return;
    
    const res = await deleteDomain(id);
    if (res.success) {
      setSuccessMsg(`Domain ${domainName} berhasil dihapus.`);
    } else {
      setErrorMsg(res.error || 'Gagal menghapus domain');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'ecommerce', label: 'E-Commerce', icon: Store },
    { id: 'billing', label: 'Paket & Tagihan', icon: CreditCard },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'devices', label: 'Perangkat Terhubung', icon: MonitorSmartphone },
    { id: 'preferences', label: 'Preferensi Email', icon: Mail },
    { id: 'activity', label: 'Log Aktivitas', icon: CheckCircle2 },
  ]

  return (
    <DashboardLayout>
      <SEO title="Pengaturan | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3 flex items-center gap-3">
              <Settings className="h-8 w-8 text-[#0b5cff]" />
              Pengaturan
            </h1>
            <p className="text-slate-600 font-medium">Kelola pengaturan dan preferensi akun Anda.</p>
          </div>
        </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSuccessMsg('')
                        setErrorMsg('')
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-[#0b5cff]' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                </div>

                <div className="p-8">
                  {successMsg && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                      <p className="text-sm font-bold">{successMsg}</p>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6 max-w-md">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white uppercase overflow-hidden shadow-lg shadow-blue-500/20 border border-slate-200">
                          {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold border rounded-xl cursor-pointer transition-colors ${isUploadingAvatar ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'}`}>
                            {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            {isUploadingAvatar ? 'Mengunggah...' : 'Ubah Avatar'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                          </label>
                          <p className="text-xs text-slate-500 mt-2 font-medium">Ukuran disarankan: 256x256px. Maks: 2MB.</p>
                        </div>
                      </div>

                      <Input 
                        label={<span className="text-slate-700 font-bold">Nama Lengkap</span>} 
                        error={profileErrors.full_name?.message} 
                        {...registerProfile('full_name')} 
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5" 
                      />
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Email</label>
                        <Input 
                          type="email"
                          error={profileErrors.email?.message} 
                          {...registerProfile('email')} 
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp</label>
                        <Input 
                          type="text"
                          placeholder="misal: 628123456789"
                          error={profileErrors.whatsapp_number?.message} 
                          {...registerProfile('whatsapp_number')} 
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                        />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Gunakan kode negara (misal 62 untuk Indonesia). Ini akan digunakan untuk tautan checkout E-Commerce Anda.</p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100">
                        <Button type="submit" isLoading={isProfileSubmitting || isLoading} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Simpan Perubahan</Button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'ecommerce' && (
                    <form onSubmit={handleEcommerceSubmit} className="space-y-6 max-w-lg">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 mb-6 shadow-sm">
                        <h3 className="font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                          <Store className="w-5 h-5 text-[#0b5cff]" /> Konfigurasi Asal Pengiriman
                        </h3>
                        <p className="text-sm text-slate-600 font-medium">
                          Atur lokasi asal toko Anda. Ini penting untuk menghitung ongkos kirim secara akurat via Biteship.
                        </p>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Area Asal (Kecamatan)</label>
                        <div className="relative">
                          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Ketik minimal 3 karakter untuk mencari (misal: Kebayoran Baru)"
                            className="w-full pl-11 bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl px-4 py-2.5 transition-all outline-none"
                            value={areaSearch}
                            onChange={(e) => {
                              setAreaSearch(e.target.value);
                              if (e.target.value.length >= 3) {
                                searchArea(e.target.value);
                                setShowAreaResults(true);
                              } else {
                                setShowAreaResults(false);
                              }
                            }}
                            onFocus={() => {
                              if (areaSearch.length >= 3) setShowAreaResults(true);
                            }}
                          />
                        </div>
                        {isSearchingArea && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500 font-bold">
                            Mencari area...
                          </div>
                        )}
                        {showAreaResults && areas.length > 0 && !isSearchingArea && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {areas.map(area => (
                              <button
                                key={area.id}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm transition-colors"
                                onClick={() => {
                                  setSelectedAreaId(area.id);
                                  setSelectedAreaName(area.name);
                                  setAreaSearch(area.name);
                                  setShowAreaResults(false);
                                }}
                              >
                                <span className="font-bold text-slate-800 block">{area.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedAreaName && !showAreaResults && (
                          <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Terpilih: {selectedAreaName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap Asal</label>
                        <textarea
                          placeholder="misal: Jl. Sudirman No. 123, Rt 01 Rw 02"
                          rows={3}
                          value={originAddress}
                          onChange={(e) => setOriginAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none resize-none"
                        ></textarea>
                      </div>

                      <div className="pt-6 border-t border-slate-200 mt-6">
                        <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-[#0b5cff]" /> Rekening Pencairan
                        </h3>
                        <p className="text-sm text-slate-600 font-medium mb-4">
                          Masukkan informasi rekening Anda. Semua pendapatan dari penjualan akan ditransfer ke rekening ini.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Bank / E-Wallet</label>
                            <Input 
                              type="text"
                              placeholder="BCA, Mandiri, GoPay, Dana, dll."
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Rekening</label>
                            <Input 
                              type="text"
                              placeholder="1234567890"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Atas Nama</label>
                            <Input 
                              type="text"
                              placeholder="Sesuai buku tabungan"
                              value={bankAccountName}
                              onChange={(e) => setBankAccountName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl transition-all outline-none px-4 py-2.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100">
                        <Button type="submit" isLoading={isSavingEcommerce} className="bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">Simpan Pengaturan E-Commerce</Button>
                      </div>
                    </form>
                  )}



                  {activeTab === 'billing' && (
                    <div className="space-y-8 animate-fade-in-up">
                      <div className="bg-gradient-to-br from-[#0b5cff] to-[#094bdd] rounded-xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold mb-1 capitalize">{user?.user_metadata?.plan_type || 'Free'} Plan</h3>
                            <p className="text-blue-100 text-sm">
                              {user?.user_metadata?.plan_type !== 'free' && user?.user_metadata?.plan_expires_at 
                                ? `Active until ${new Date(user.user_metadata.plan_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` 
                                : `You are currently on the free tier.`}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">Active</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5">
                              <span>Links Created</span>
                              <span>{links.length} / {user?.user_metadata?.max_links === -1 ? 'Unlimited' : (user?.user_metadata?.max_links || 100)}</span>
                            </div>
                            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: `${user?.user_metadata?.max_links === -1 ? 0 : Math.min(100, (links.length / (user?.user_metadata?.max_links || 100)) * 100)}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5">
                              <span>Custom Domains</span>
                              <span>{domains.length} / {(user?.user_metadata?.custom_domains || user?.user_metadata?.max_custom_domains === -1) ? 'Unlimited' : (user?.user_metadata?.max_custom_domains || 1)}</span>
                            </div>
                            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: `${(user?.user_metadata?.custom_domains || user?.user_metadata?.max_custom_domains === -1) ? 0 : Math.min(100, (domains.length / (user?.user_metadata?.max_custom_domains || 1)) * 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Upgrade for more limits</h3>
                        <p className="text-slate-500 mb-6 font-medium">Get advanced analytics, custom domains, and team collaboration by upgrading your plan.</p>
                        
                        {isPlansLoading ? (
                          <div className="text-center py-4"><span className="text-slate-500 font-bold">Loading plans...</span></div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(plans?.length > 0 ? plans : [
                              { id: 'pro', plan_type: 'pro', max_links: -1, custom_domains: true, max_team_members: 10 },
                              { id: 'enterprise', plan_type: 'enterprise', max_links: -1, custom_domains: true, max_team_members: 100 }
                            ]).filter(p => (p.plan_type || p.plan_name) !== 'free').map((plan) => {
                              const planName = plan.plan_type || plan.plan_name;
                              return (
                              <div key={plan.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-[#0b5cff] transition-colors cursor-pointer relative overflow-hidden flex flex-col h-full">
                                {planName === 'pro' && <div className="absolute top-0 right-0 bg-[#0b5cff] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAR</div>}
                                <h4 className="font-bold text-slate-900 mb-1 capitalize">{planName}</h4>
                                <p className="text-xl font-extrabold text-[#0b5cff] mb-4">
                                  ${planName === 'pro' ? '5' : '20'}<span className="text-sm font-medium text-slate-500">/mo</span>
                                </p>
                                <ul className="text-sm text-slate-600 space-y-2 mb-6 flex-1">
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.max_links === -1 ? 'Unlimited' : plan.max_links.toLocaleString()} Links</li>
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.custom_domains || plan.max_custom_domains === -1 ? 'Unlimited' : (plan.max_custom_domains || 'None')} Custom Domains</li>
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.max_team_members === 0 ? 'No Team Members' : `${plan.max_team_members} Team Members`}</li>
                                  {(planName === 'pro' || planName === 'enterprise') && <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> E-Commerce (Physical Products)</li>}
                                </ul>
                                <Button 
                                  onClick={async () => {
                                    if (user?.user_metadata?.plan_type === planName) return;
                                    setSuccessMsg('');
                                    setErrorMsg('');
                                    if (planName === 'pro' || planName === 'enterprise') {
                                      const priceIDR = planName === 'pro' ? 50000 : 200000;
                                      const orderId = `PLAN_${planName.toUpperCase()}_${Date.now()}`;
                                      
                                      toast.loading("Memulai pembayaran...", { id: "payment_toast" });
                                      const apiUrl = import.meta.env.DEV ? 'http://localhost:5000' : 'https://api.ryz.my.id';
                                      const tokenResponse = await fetch(`${apiUrl}/api/midtrans/token`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                          order_id: orderId,
                                          gross_amount: priceIDR,
                                          customer_details: {
                                            first_name: user?.user_metadata?.full_name || 'Creator',
                                            phone: user?.user_metadata?.whatsapp_number || '081234567890',
                                            email: user?.email || 'creator@example.com'
                                          },
                                          item_details: [{
                                            id: `plan_${planName}`,
                                            price: priceIDR,
                                            quantity: 1,
                                            name: `RYZLink ${planName} Plan`
                                          }]
                                        })
                                      });
                                      
                                      const result = await tokenResponse.json();
                                      
                                      if (!tokenResponse.ok) {
                                        toast.error("Gagal terhubung ke server pembayaran.", { id: "payment_toast" });
                                        return;
                                      }
                                      
                                      if (result && result.error) {
                                        toast.error("Gagal memulai pembayaran Midtrans.", { id: "payment_toast" });
                                        return;
                                      }
                                      
                                      if (result && result.token) {
                                        toast.dismiss("payment_toast");
                                        window.snap.pay(result.token, {
                                          onSuccess: async function(resultSnap) {
                                            toast.loading("Memperbarui akun...", { id: "update_toast" });
                                            const res = await updateProfile({ 
                                              plan_type: planName,
                                              max_links: plan.max_links !== undefined ? plan.max_links : (planName === 'free' ? 100 : -1),
                                              custom_domains: plan.custom_domains !== undefined ? plan.custom_domains : (planName !== 'free'),
                                              max_custom_domains: plan.max_custom_domains !== undefined ? plan.max_custom_domains : (planName !== 'free' ? -1 : 1),
                                              max_team_members: plan.max_team_members !== undefined ? plan.max_team_members : (planName === 'free' ? 0 : 10),
                                              plan_expires_at: planName === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                                            });
                                            if (res.success) {
                                              await addBillingRecord({
                                                plan_name: planName,
                                                amount: priceIDR,
                                                status: 'paid',
                                                midtrans_order_id: resultSnap?.order_id || orderId
                                              });
                                              fetchBillingHistory();
                                              setSuccessMsg(`Berhasil berlangganan ${planName}! Anda sekarang bisa menggunakan fitur PRO.`);
                                              toast.success("Akun berhasil di-upgrade!", { id: "update_toast" });
                                            } else {
                                              setErrorMsg('Gagal memperbarui akun setelah pembayaran.');
                                              toast.error("Gagal memperbarui akun.", { id: "update_toast" });
                                            }
                                          },
                                          onPending: function() {
                                            toast.success("Pembayaran tertunda. Selesaikan pembayaran Anda.");
                                          },
                                          onError: function() {
                                            toast.error("Pembayaran gagal.");
                                          },
                                          onClose: function() {
                                            toast.error("Anda menutup jendela pembayaran.");
                                          }
                                        });
                                      }
                                    } else {
                                      setErrorMsg('Contact sales for enterprise plans.');
                                    }
                                  }}
                                  className={`w-full ${planName === 'pro' ? 'bitly-button-primary' : 'bitly-button-secondary'}`}
                                >
                                  {user?.user_metadata?.plan_type === planName ? 'Current Plan' : `Upgrade to ${planName.charAt(0).toUpperCase() + planName.slice(1)}`}
                                </Button>
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Billing History Section */}
                      <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Billing History</h3>
                        {isBillingLoading ? (
                          <div className="text-center py-4 text-slate-500 font-medium">Loading history...</div>
                        ) : billingHistory && billingHistory.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 font-bold">Date</th>
                                  <th className="px-4 py-3 font-bold">Plan</th>
                                  <th className="px-4 py-3 font-bold">Amount</th>
                                  <th className="px-4 py-3 font-bold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {billingHistory.map((item) => (
                                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-600 font-medium">
                                      {new Date(item.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                      })}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="capitalize font-bold text-slate-900">{item.plan_name}</span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-900">
                                      Rp {item.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                        item.status === 'paid' ? 'bg-green-100 text-green-700' :
                                        item.status === 'failed' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {item.status.toUpperCase()}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500 font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            No billing history found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6 max-w-md">
                      <Input 
                        label={<span className="text-slate-700 font-bold">New Password</span>} 
                        type="password" 
                        error={passwordErrors.password?.message} 
                        {...registerPassword('password')} 
                        className="bitly-input" 
                      />
                      <Input 
                        label={<span className="text-slate-700 font-bold">Confirm New Password</span>} 
                        type="password" 
                        error={passwordErrors.confirm_password?.message} 
                        {...registerPassword('confirm_password')} 
                        className="bitly-input" 
                      />

                      <div className="pt-4">
                        <Button type="submit" isLoading={isPasswordSubmitting || isLoading} className="bitly-button-primary">Update Password</Button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'devices' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-[#0b5cff]/20 bg-blue-50/30 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-[#0b5cff] rounded-lg">
                            <MonitorSmartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{getDeviceDetails()}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Active now</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">Current Session</span>
                      </div>
                      
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-600 font-medium">To log out of all other devices, please change your password.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="space-y-6 max-w-2xl">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">Marketing Emails</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Receive tips, offers, and product updates.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={user?.user_metadata?.email_preferences?.marketing ?? true}
                            onChange={async (e) => {
                              const newPrefs = { ...(user?.user_metadata?.email_preferences || {}), marketing: e.target.checked };
                              await updateProfile({ email_preferences: newPrefs });
                              await logActivity(`Toggled Marketing Emails to ${e.target.checked}`);
                              toast.success("Preferences updated");
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b5cff]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">Weekly Reports</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Get a weekly summary of your link performance.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={user?.user_metadata?.email_preferences?.weekly_reports ?? false}
                            onChange={async (e) => {
                              const newPrefs = { ...(user?.user_metadata?.email_preferences || {}), weekly_reports: e.target.checked };
                              await updateProfile({ email_preferences: newPrefs });
                              await logActivity(`Toggled Weekly Reports to ${e.target.checked}`);
                              toast.success("Preferences updated");
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b5cff]"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-4">
                      {isLogsLoading ? (
                        <div className="text-center py-8 text-slate-500 font-medium">Loading activity logs...</div>
                      ) : logs.length > 0 ? (
                        logs.map((log) => {
                          // Calculate relative time roughly
                          const diffSecs = Math.floor((new Date() - new Date(log.created_at)) / 1000);
                          let timeStr = 'Now';
                          if (diffSecs > 86400) timeStr = `${Math.floor(diffSecs / 86400)}d`;
                          else if (diffSecs > 3600) timeStr = `${Math.floor(diffSecs / 3600)}h`;
                          else if (diffSecs > 60) timeStr = `${Math.floor(diffSecs / 60)}m`;

                          return (
                            <div key={log.id} className="flex items-center gap-4 p-4 border-l-4 border-slate-200 hover:bg-slate-50 rounded-r-lg transition-colors">
                              <div className="h-8 w-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">{timeStr}</div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{log.action}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {log.user_agent || 'Unknown Device'} • {new Date(log.created_at).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-500 font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50">
                          No activity logged yet.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  )
}
