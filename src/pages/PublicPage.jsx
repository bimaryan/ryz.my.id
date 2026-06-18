import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaInstagram, FaXTwitter, FaGithub, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa6'
import { supabase } from '@/lib/supabase'
import * as LucideIcons from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import ComplexBlockRender from '@/components/ComplexBlockRender'
import { toast } from 'react-hot-toast'
import { useBiteship } from '@/hooks/useBiteship'

const BRAND_COLORS = {
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  github: '#333333',
  linkedin: '#0077b5',
  youtube: '#FF0000',
  tiktok: '#000000'
}

export default function PublicPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', email: '', customAnswers: {} })
  const [creatorWA, setCreatorWA] = useState('')
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)

  // Biteship States
  const { areas, searchArea, isSearchingArea, calculateRates, isLoadingRates, createOrder } = useBiteship()
  const [biteshipOrigin, setBiteshipOrigin] = useState(null)
  const [areaSearchInput, setAreaSearchInput] = useState('')
  const [showAreaResults, setShowAreaResults] = useState(false)
  const [selectedDestinationArea, setSelectedDestinationArea] = useState(null)
  const [shippingRates, setShippingRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)

  const handleCalculateRates = async (destId) => {
    if (!biteshipOrigin?.origin_area_id || !destId || !selectedProduct) return;
    
    let weightGrams = 1000;
    if (selectedProduct.weight) {
      weightGrams = parseFloat(selectedProduct.weight) * 1000;
    }
    
    const items = [{
      name: selectedProduct.title,
      description: selectedProduct.description || "Barang",
      value: parseInt(selectedProduct.price || 0),
      length: parseInt(selectedProduct.length || 10),
      width: parseInt(selectedProduct.width || 10),
      height: parseInt(selectedProduct.height || 10),
      weight: weightGrams,
      quantity: 1
    }];

    const res = await calculateRates(biteshipOrigin.origin_area_id, destId, items);
    if (res.success) {
      setShippingRates(res.rates);
      if (res.rates.length > 0) {
        setSelectedRate(res.rates[0]);
      } else {
        setSelectedRate(null);
      }
    } else {
      toast.error(res.error || "Gagal menghitung ongkos kirim.");
      setShippingRates([]);
      setSelectedRate(null);
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (selectedProduct.require_name && !checkoutForm.name) {
      toast.error("Please fill in your Name.");
      return;
    }
    if (selectedProduct.ask_phone !== false && selectedProduct.require_phone !== false && !checkoutForm.phone) {
      toast.error("Please fill in your Phone Number.");
      return;
    }
    if (selectedProduct.require_address && !checkoutForm.address) {
      toast.error("Please fill in your Shipping Address.");
      return;
    }
    if (selectedProduct.custom_message_email && !checkoutForm.email) {
      toast.error("Please fill in your Email.");
      return;
    }
    if (selectedProduct.custom_questions) {
      for (const q of selectedProduct.custom_questions) {
        if (q.required && !checkoutForm.customAnswers[q.id]) {
          toast.error(`Please fill in: ${q.label}`);
          return;
        }
      }
    }

    let variantName = '';
    let finalPrice = selectedProduct.price || 0;
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      const variant = selectedProduct.variants[selectedVariantIndex];
      if (variant) {
        variantName = variant.name;
        if (variant.price) finalPrice = variant.price;
      }
    }

    if (selectedProduct.type === 'physical_product' && biteshipOrigin?.origin_area_id) {
      if (!selectedDestinationArea) {
        toast.error("Silakan pilih Kecamatan Tujuan pengiriman.");
        return;
      }
      if (!selectedRate) {
        toast.error("Silakan pilih Kurir Pengiriman.");
        return;
      }
    }

    let shippingCost = 0;
    if (selectedRate) {
      shippingCost = selectedRate.price;
    }

    const grandTotal = parseInt(finalPrice) + parseInt(shippingCost);

    try {
      // 1. Simpan order ke database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          page_slug: slug,
          product_id: selectedProduct.id,
          product_name: selectedProduct.title,
          variant_name: variantName || null,
          amount: finalPrice,
          customer_name: checkoutForm.name,
          customer_phone: checkoutForm.phone || null,
          customer_email: checkoutForm.email || null,
          customer_address: checkoutForm.address || null,
          custom_answers: checkoutForm.customAnswers || null,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Minta Token Snap dari Midtrans (Lewat Supabase RPC Backend)
      const { data: result, error: rpcError } = await supabase.rpc('get_midtrans_token', {
        p_order_id: orderData.id,
        p_gross_amount: parseInt(grandTotal),
        p_first_name: checkoutForm.name,
        p_phone: checkoutForm.phone || '08123456789',
        p_address: checkoutForm.address || '',
        p_server_key: import.meta.env.VITE_MIDTRANS_SERVER_KEY || 'SB-Mid-server-0TGPuhniptPemYTjz0tJl9K8',
        p_is_production: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      });

      if (rpcError) {
        console.error("Supabase RPC Error:", rpcError);
        toast.error("Gagal terhubung ke server pembayaran.");
        return;
      }

      if (result && result.error) {
        console.error("Midtrans Error:", result);
        const errorMsgs = result.message?.error_messages;
        toast.error("Gagal memulai pembayaran: " + (errorMsgs ? errorMsgs[0] : "Kesalahan Konfigurasi"));
        return;
      }

      if (!result || !result.token) {
        toast.error("Gagal mendapatkan token pembayaran.");
        return;
      }

      // 3. Panggil Snap Pay
      window.snap.pay(result.token, {
        onSuccess: async function(snapResult) {
          await supabase.from('orders').update({ status: 'paid', midtrans_order_id: snapResult.order_id }).eq('id', orderData.id);
          
          if (selectedProduct.type === 'physical_product' && biteshipOrigin?.origin_area_id && selectedDestinationArea && selectedRate) {
            toast.loading("Menerbitkan Resi otomatis...", { id: "resi_toast" });
            
            let weightGrams = 1000;
            if (selectedProduct.weight) weightGrams = parseFloat(selectedProduct.weight) * 1000;

            const payload = {
              shipper_contact_name: biteshipOrigin.full_name || "Seller",
              shipper_contact_phone: biteshipOrigin.whatsapp_number || "081234567890",
              origin_contact_name: biteshipOrigin.full_name || "Seller",
              origin_contact_phone: biteshipOrigin.whatsapp_number || "081234567890",
              origin_address: biteshipOrigin.origin_address || "Toko",
              origin_area_id: biteshipOrigin.origin_area_id,
              destination_area_id: selectedDestinationArea.id,
              destination_contact_name: checkoutForm.name,
              destination_contact_phone: checkoutForm.phone || "081234567890",
              destination_contact_email: checkoutForm.email || "",
              destination_address: checkoutForm.address,
              courier_company: selectedRate.company,
              courier_type: selectedRate.type,
              delivery_type: "now",
              reference_id: orderData.id,
              items: [{
                name: selectedProduct.title,
                description: selectedProduct.description || "Barang",
                value: parseInt(finalPrice),
                length: parseInt(selectedProduct.length || 10),
                width: parseInt(selectedProduct.width || 10),
                height: parseInt(selectedProduct.height || 10),
                weight: weightGrams,
                quantity: 1
              }]
            };

            const biteshipRes = await createOrder(payload);
            if (biteshipRes.success) {
              await supabase.from('orders').update({ 
                tracking_number: biteshipRes.order.waybill_id,
                shipping_courier: selectedRate.courier_name
              }).eq('id', orderData.id);
              toast.success(`Berhasil! Resi: ${biteshipRes.order.waybill_id}`, { id: "resi_toast" });
            } else {
              toast.error("Resi otomatis gagal, harap buat manual di dashboard Biteship.", { id: "resi_toast" });
            }
          } else {
            toast.success("Pembayaran Berhasil!");
          }

          setIsCheckoutOpen(false);
        },
        onPending: function(snapResult) {
          toast.success("Menunggu Pembayaran!");
          setIsCheckoutOpen(false);
        },
        onError: async function(snapResult) {
          await supabase.from('orders').update({ status: 'failed', midtrans_order_id: snapResult.order_id }).eq('id', orderData.id);
          toast.error("Pembayaran Gagal!");
          setIsCheckoutOpen(false);
        },
        onClose: function() {
          toast.error('Anda menutup popup tanpa menyelesaikan pembayaran.');
        }
      });

    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error("Terjadi kesalahan sistem saat memproses pesanan.");
    }
  };

  useEffect(() => {
    // Load Midtrans Snap Script
    const scriptTag = document.createElement('script');
    scriptTag.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    scriptTag.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
    
    // Hanya tambahkan jika belum ada
    if (!document.querySelector(`script[src="${scriptTag.src}"]`)) {
      document.body.appendChild(scriptTag);
    }

    return () => {
      // document.body.removeChild(scriptTag);
    }
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: page?.title || `@${slug}`,
          text: page?.description || `Check out ${page?.title || slug}`,
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data, error: err } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single()
          
        if (err || !data) {
          setError('Page not found')
        } else {
          setPage(data)
          
          try {
            const { data: waData } = await supabase.rpc('get_page_whatsapp_number', { page_slug: slug })
            if (waData) {
              setCreatorWA(waData.replace(/[^0-9]/g, ''));
            }
          } catch (e) {
            console.error('Failed to fetch WA:', e)
          }

          try {
            const { data: originData } = await supabase.rpc('get_page_shipping_origin', { page_slug: slug })
            if (originData) {
              setBiteshipOrigin(originData);
            }
          } catch (e) {
            console.error('Failed to fetch shipping origin:', e)
          }
        }
      } catch (err) {
        setError('Page not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f4f6fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b5cff]"></div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f4f6fa] p-4 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">The Link-in-Bio page you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-white bg-[#0b5cff] hover:bg-[#094acc] px-6 py-3 rounded-lg font-bold transition-colors">
          Go to RYZ Shortlink
        </Link>
      </div>
    )
  }

  const { theme, title, description, avatar_url, links } = page

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center py-16 px-4 ${theme.bg_animated && theme.bg_type === 'gradient' ? 'animate-gradient' : ''} ${theme.bg_pattern && theme.bg_pattern !== 'none' ? 'bg-pattern-' + theme.bg_pattern : ''}`}
      style={{ 
        fontFamily: theme.font_family || 'Inter',
        background: theme.bg_type === 'gradient' ? theme.bg_value : theme.bg_type === 'image' ? `url(${theme.bg_value}) center/cover` : theme.bg_value || theme.bg_color,
        color: theme.text_color 
      }}
    >
      <Helmet>
        <title>{title || `@${slug}`} | RYZLink</title>
        <meta name="description" content={description || `Link-in-Bio for ${title || slug}`} />
        <meta property="og:title" content={title || `@${slug}`} />
        <meta property="og:description" content={description || `Link-in-Bio for ${title || slug}`} />
        {avatar_url && <meta property="og:image" content={avatar_url} />}
        {/* Dynamic Google Font Loader */}
        {theme.font_family && theme.font_family !== 'Inter' && (
          <link href={`https://fonts.googleapis.com/css2?family=${theme.font_family.replace(/ /g, '+')}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
        )}
      </Helmet>

      {/* Top Navbar */}
      {theme.navbar_enabled && (
        <div className={`fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between transition-colors
          ${theme.navbar_style === 'solid' ? 'bg-white text-slate-900 border-b border-slate-200 shadow-sm' : 
            theme.navbar_style === 'transparent' ? 'bg-transparent' : 
            'bg-white/70 backdrop-blur-md text-slate-900 border-b border-white/20 shadow-sm'}`}
          style={theme.navbar_style === 'transparent' ? { color: theme.text_color } : {}}
        >
          <div className="font-bold text-base truncate pr-4 max-w-xl mx-auto w-full flex items-center justify-between">
            <span>{theme.navbar_title || title || `@${slug}`}</span>
            <button onClick={handleShare} className={`p-2 rounded-full transition-colors ${theme.navbar_style === 'transparent' ? 'hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
              <LucideIcons.Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className={`w-full max-w-[600px] flex flex-col items-center animate-fade-in-up ${theme.navbar_enabled ? 'pt-24' : 'pt-12'}`}>
        {/* Profile Layout Logic */}
        {theme.profile_layout !== 'hidden' && (
          <div className={`w-full flex ${theme.profile_layout === 'side-by-side' ? 'flex-row items-center text-left gap-6 mb-10 px-4' : 'flex-col items-center mb-10'}`}>
            {/* Avatar */}
            {avatar_url ? (
              <img src={avatar_url} alt={title || slug} className={`object-cover shadow-xl border-4 border-white/20 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'} ${theme.profile_layout === 'compact' ? 'w-20 h-20' : theme.profile_layout === 'side-by-side' ? 'w-24 h-24 md:w-28 md:h-28 shrink-0' : 'w-24 h-24 md:w-28 md:h-28 mb-6'}`} />
            ) : (
              <div className={`bg-black/5 shadow-xl border-4 border-white/20 flex items-center justify-center text-black/20 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'} ${theme.profile_layout === 'compact' ? 'w-20 h-20' : theme.profile_layout === 'side-by-side' ? 'w-24 h-24 md:w-28 md:h-28 shrink-0' : 'w-24 h-24 md:w-28 md:h-28 mb-6'}`}>
                {LucideIcons.Image && <LucideIcons.Image className={`${theme.profile_layout === 'compact' ? 'w-8 h-8' : 'h-10 w-10'}`} />}
              </div>
            )}
            
            {/* Profile Info */}
            <div className={`${theme.profile_layout === 'side-by-side' ? 'flex-1' : 'w-full'}`}>
              <h1 className={`${theme.profile_layout === 'compact' ? 'text-xl md:text-2xl mt-4' : 'text-2xl md:text-3xl'} font-extrabold mb-3 ${theme.profile_layout === 'side-by-side' ? 'text-left' : 'text-center'} tracking-tight`} style={{ color: theme.text_color }}>
                {title || `@${slug}`}
              </h1>
              <p className={`text-base md:text-lg opacity-90 leading-relaxed ${theme.profile_layout === 'side-by-side' ? 'text-left' : 'text-center mx-auto max-w-md'} ${theme.profile_layout === 'compact' ? 'mb-6' : ''}`} style={{ color: theme.text_color }}>
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Social Links */}
        {(theme.social_links?.instagram || theme.social_links?.twitter || theme.social_links?.github || theme.social_links?.linkedin || theme.social_links?.youtube || theme.social_links?.tiktok) && (
          <div className="flex flex-wrap justify-center gap-5 mb-10">
            {theme.social_links?.instagram && <a href={theme.social_links.instagram} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.instagram : theme.text_color }}><FaInstagram className="w-7 h-7" /></a>}
            {theme.social_links?.twitter && <a href={theme.social_links.twitter} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.twitter : theme.text_color }}><FaXTwitter className="w-7 h-7" /></a>}
            {theme.social_links?.github && <a href={theme.social_links.github} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.github : theme.text_color }}><FaGithub className="w-7 h-7" /></a>}
            {theme.social_links?.linkedin && <a href={theme.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.linkedin : theme.text_color }}><FaLinkedin className="w-7 h-7" /></a>}
            {theme.social_links?.youtube && <a href={theme.social_links.youtube} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.youtube : theme.text_color }}><FaYoutube className="w-7 h-7" /></a>}
            {theme.social_links?.tiktok && <a href={theme.social_links.tiktok} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.tiktok : theme.text_color }}><FaTiktok className="w-7 h-7" /></a>}
          </div>
        )}

        {/* Links & Blocks */}
        <div className={`w-full ${theme.layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}`}>
          {links && links.length > 0 ? (
            links.map((link, i) => {
              if (link.type === 'header') {
                return (
                  <div key={i} className={`w-full pt-8 pb-2 text-center ${theme.layout === 'grid' ? 'col-span-2' : ''}`}>
                    <h2 className="text-xl font-black tracking-tight" style={{ color: theme.text_color }}>{link.title}</h2>
                  </div>
                )
              }

              if (link.type === 'video') {
                const embedUrl = getYouTubeEmbedUrl(link.url);
                return (
                  <div key={i} className={`w-full overflow-hidden ${theme.button_style} ${theme.layout === 'grid' ? 'col-span-2' : ''}`}>
                    {embedUrl ? (
                      <div className="relative w-full pb-[56.25%]">
                        <iframe
                          src={embedUrl}
                          className="absolute top-0 left-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="w-full py-12 bg-black/5 flex flex-col items-center justify-center text-current opacity-60">
                        <LucideIcons.Video className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Invalid Video URL</span>
                      </div>
                    )}
                  </div>
                )
              }

              if (link.type === 'image') {
                return (
                  <div key={i} className={`w-full overflow-hidden ${theme.button_style} ${theme.button_animation || 'hover:scale-[1.02]'} transition-transform ${theme.layout === 'grid' ? 'col-span-2' : ''}`}>
                    {link.url ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <img src={link.thumbnail_url || 'https://via.placeholder.com/600x200?text=Image+Placeholder'} alt="Image Block" className="w-full object-cover" />
                      </a>
                    ) : (
                      <img src={link.thumbnail_url || 'https://via.placeholder.com/600x200?text=Image+Placeholder'} alt="Image Block" className="w-full object-cover" />
                    )}
                  </div>
                )
              }

              const isComplex = ['digital_product', 'appointment', 'event', 'physical_product', 'blog'].includes(link.type);
              if (isComplex) {
                return (
                  <ComplexBlockRender 
                    key={i} 
                    link={link} 
                    theme={theme} 
                    onClick={(product) => {
                      if (product.type === 'blog') {
                        navigate(`/${slug}/blog/${product.id}`);
                      } else {
                        setSelectedProduct(product);
                        setSelectedVariantIndex(0);
                        setIsCheckoutOpen(true);
                        setCheckoutForm({ name: '', phone: '', address: '', email: '', customAnswers: {} });
                      }
                    }} 
                  />
                )
              }

              return (
                <a
                  key={i}
                  href={link.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-lg font-bold transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-[0.98] ${theme.button_style} ${theme.button_border || 'border border-transparent'} ${theme.button_shadow || 'shadow-sm'} relative overflow-hidden ${theme.layout === 'grid' ? 'aspect-square p-4 flex flex-col items-center justify-center text-center gap-3' : 'py-4 px-6'}`}
                  style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
                >
                  <div className={`flex relative z-10 w-full ${theme.layout === 'grid' ? 'flex-col items-center justify-center' : `items-center gap-4 ${theme.button_align || 'justify-center'}`}`}>
                    {link.thumbnail_url ? (
                      <div className="shrink-0">
                        <img src={link.thumbnail_url} alt="thumbnail" className={`${theme.layout === 'grid' ? 'w-16 h-16 mb-2' : 'w-12 h-12'} rounded-lg object-cover shadow-sm`} />
                      </div>
                    ) : (link.icon && LucideIcons[link.icon]) && (
                      <div className="flex items-center justify-center shrink-0">
                        {(() => {
                          const IconComponent = LucideIcons[link.icon];
                          return <IconComponent className={`${theme.layout === 'grid' ? 'w-10 h-10 mb-2' : 'w-6 h-6'}`} />;
                        })()}
                      </div>
                    )}
                    
                    <div className={`flex flex-col w-full ${theme.layout === 'grid' ? 'items-center text-center' : (theme.button_align === 'justify-start' ? 'items-start text-left' : 'items-center text-center')}`}>
                      <span className="truncate w-full leading-tight">{link.title || 'Untitled Link'}</span>
                      {link.subtitle && <span className="text-sm font-medium opacity-80 truncate w-full mt-1 leading-none">{link.subtitle}</span>}
                    </div>
                  </div>
                </a>
              )
            })
          ) : (
            <p className="text-center opacity-50 w-full col-span-2">No links have been added yet.</p>
          )}
        </div>
        
        {/* Custom Footer */}
        {theme.footer_enabled && (
          <div className="w-full mt-16 mb-4 text-center">
            <p className="text-sm font-medium opacity-70" style={{ color: theme.text_color }}>
              {theme.footer_text || `© ${new Date().getFullYear()} ${title || 'RYZ Shortlink'}`}
            </p>
          </div>
        )}

        {/* Footer Brand */}
        {!theme.hide_branding && (
          <a 
            href="/" 
            className="mt-12 mb-12 opacity-40 hover:opacity-100 transition-opacity flex flex-col items-center gap-2 group" 
            style={{ color: theme.text_color }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-1">Powered by</div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: theme.text_color, color: theme.bg_type === 'color' ? theme.bg_value : '#000' }}>R</div>
              RYZLink
            </div>
          </a>
        )}
      </div>

      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in-up overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between shrink-0 shadow-sm">
            <button 
              type="button" 
              onClick={() => setIsCheckoutOpen(false)} 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <LucideIcons.ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h3 className="text-lg font-black text-slate-900 hidden sm:block">Secure Checkout</h3>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleCheckout} className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-10">
              
              {/* Left Column: Form Fields */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
                  <h4 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                    <LucideIcons.User className="w-5 h-5 text-slate-400" /> Customer Details
                  </h4>
                  
                  {selectedProduct.variants?.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Variant</label>
                      <select 
                        value={selectedVariantIndex}
                        onChange={(e) => setSelectedVariantIndex(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                      >
                        {selectedProduct.variants.map((v, i) => (
                          <option key={i} value={i}>{v.name} {v.price ? `- Rp ${parseInt(v.price).toLocaleString('id-ID')}` : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name */}
                  {selectedProduct.ask_name !== false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        required={selectedProduct.require_name !== false}
                        type="text" 
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                      />
                    </div>
                  )}

                  {/* Phone */}
                  {selectedProduct.ask_phone !== false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        required={selectedProduct.require_phone !== false}
                        type="tel" 
                        placeholder="e.g. 081234567890"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                        value={checkoutForm.phone || ''}
                        onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                      />
                    </div>
                  )}

                  {/* Email */}
                  {selectedProduct.custom_message_email && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                        value={checkoutForm.email || ''}
                        onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                      />
                    </div>
                  )}

                  {/* Address */}
                  {(selectedProduct.type === 'physical_product' || selectedProduct.ask_address || selectedProduct.require_address) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Shipping Address</label>
                      
                      {(selectedProduct.type === 'physical_product' && biteshipOrigin?.origin_area_id) ? (
                        <div className="space-y-4">
                           <div className="relative">
                              <label className="block text-sm font-medium text-slate-600 mb-1">Kecamatan Tujuan</label>
                              <div className="relative">
                                <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Cari kecamatan (min 3 huruf)"
                                  className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                                  value={areaSearchInput}
                                  onChange={(e) => {
                                    setAreaSearchInput(e.target.value);
                                    if (e.target.value.length >= 3) {
                                      searchArea(e.target.value);
                                      setShowAreaResults(true);
                                    } else {
                                      setShowAreaResults(false);
                                    }
                                  }}
                                />
                              </div>
                              {isSearchingArea && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                                  Mencari...
                                </div>
                              )}
                              {showAreaResults && areas.length > 0 && !isSearchingArea && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                  {areas.map(area => (
                                    <button
                                      key={area.id}
                                      type="button"
                                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm transition-colors"
                                      onClick={() => {
                                        setSelectedDestinationArea(area);
                                        setAreaSearchInput(area.name);
                                        setShowAreaResults(false);
                                        handleCalculateRates(area.id);
                                      }}
                                    >
                                      <span className="font-bold text-slate-800 block">{area.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                           </div>
                           
                           {/* Shipping Rates */}
                           {isLoadingRates ? (
                              <div className="text-sm font-medium text-slate-500 animate-pulse bg-slate-50 p-4 rounded-xl border border-slate-200">Menghitung tarif ongkos kirim...</div>
                           ) : shippingRates.length > 0 ? (
                              <div className="space-y-2 mt-4">
                                 <label className="block text-sm font-medium text-slate-600 mb-2">Pilih Kurir</label>
                                 <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                                   {shippingRates.map((rate, i) => (
                                     <label key={i} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedRate?.courier_service_code === rate.courier_service_code ? 'border-[#0b5cff] bg-blue-50/50 ring-1 ring-[#0b5cff]/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <div className="flex items-center gap-3">
                                          <input 
                                            type="radio" 
                                            name="shipping_rate"
                                            checked={selectedRate?.courier_service_code === rate.courier_service_code}
                                            onChange={() => setSelectedRate(rate)}
                                            className="w-4 h-4 text-[#0b5cff]"
                                          />
                                          <div>
                                            <div className="font-bold text-slate-800 text-sm uppercase">{rate.courier_name} - {rate.courier_service_name}</div>
                                            <div className="text-xs font-medium text-slate-500 mt-0.5">{rate.duration}</div>
                                          </div>
                                        </div>
                                        <div className="font-bold text-slate-900">
                                          Rp {rate.price.toLocaleString('id-ID')}
                                        </div>
                                     </label>
                                   ))}
                                 </div>
                              </div>
                           ) : selectedDestinationArea && !isLoadingRates && (
                              <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">Tidak ada kurir tersedia untuk rute ini.</div>
                           )}

                           <div>
                             <label className="block text-sm font-medium text-slate-600 mb-1">Detail Alamat Lengkap</label>
                             <textarea 
                                required={selectedProduct.require_address}
                                placeholder="Jalan, RT/RW, Blok, No Rumah..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900 resize-none"
                                rows={2}
                                value={checkoutForm.address}
                                onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                              />
                           </div>
                        </div>
                      ) : (
                        <textarea 
                          required={selectedProduct.type === 'physical_product' || selectedProduct.require_address}
                          placeholder="Alamat lengkap (Jalan, RT/RW, Kecamatan, Kota, Kode Pos)"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900 resize-none"
                          rows={3}
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        />
                      )}
                    </div>
                  )}

                  {/* Custom Questions */}
                  {selectedProduct.custom_questions?.map((q, idx) => (
                    <div key={q.id || idx}>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{q.label}</label>
                      <input 
                        required={q.required}
                        type="text" 
                        placeholder="Your answer"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b5cff]/20 focus:outline-none transition-all font-medium text-slate-900"
                        value={checkoutForm.customAnswers[q.id] || ''}
                        onChange={(e) => setCheckoutForm({...checkoutForm, customAnswers: {...checkoutForm.customAnswers, [q.id]: e.target.value}})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="w-full lg:w-[400px] shrink-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-24">
                  <h4 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                    <LucideIcons.ShoppingCart className="w-5 h-5 text-slate-400" /> Order Summary
                  </h4>
                  
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative">
                      {selectedProduct.thumbnail_url ? (
                        <img src={selectedProduct.thumbnail_url} alt="Product" className="w-full h-full object-cover" />
                      ) : (selectedProduct.icon && LucideIcons[selectedProduct.icon]) ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          {(() => {
                            const IconComponent = LucideIcons[selectedProduct.icon];
                            return <IconComponent className="w-8 h-8" />;
                          })()}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          <LucideIcons.Image className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{selectedProduct.title || 'Untitled Product'}</h5>
                      {selectedProduct.variants?.length > 0 && selectedProduct.variants[selectedVariantIndex] && (
                        <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                          Variant: {selectedProduct.variants[selectedVariantIndex].name}
                        </p>
                      )}
                      <div className="mt-2 font-black text-slate-900 text-sm">
                        {(() => {
                          let p = selectedProduct.price;
                          if (selectedProduct.variants?.length > 0 && selectedProduct.variants[selectedVariantIndex]?.price) {
                            p = selectedProduct.variants[selectedVariantIndex].price;
                          }
                          return p ? `Rp ${parseInt(p).toLocaleString('id-ID')}` : 'FREE';
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Subtotal</span>
                        <span className="text-sm font-bold text-slate-800">
                          {(() => {
                            let p = selectedProduct.price || 0;
                            if (selectedProduct.variants?.length > 0 && selectedProduct.variants[selectedVariantIndex]?.price) {
                              p = selectedProduct.variants[selectedVariantIndex].price;
                            }
                            return p ? `Rp ${parseInt(p).toLocaleString('id-ID')}` : 'FREE';
                          })()}
                        </span>
                      </div>
                      
                      {selectedRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 font-medium">Shipping ({selectedRate.courier_name})</span>
                          <span className="text-sm font-bold text-slate-800">
                            Rp {selectedRate.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
                      <span className="text-slate-800 font-black text-lg">Total</span>
                      <span className="font-black text-[#0b5cff] text-xl">
                        {(() => {
                          let p = selectedProduct.price || 0;
                          if (selectedProduct.variants?.length > 0 && selectedProduct.variants[selectedVariantIndex]?.price) {
                            p = selectedProduct.variants[selectedVariantIndex].price;
                          }
                          let total = parseInt(p) + parseInt(selectedRate?.price || 0);
                          return total ? `Rp ${total.toLocaleString('id-ID')}` : 'FREE';
                        })()}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={selectedProduct.type === 'physical_product' && biteshipOrigin?.origin_area_id && (!selectedDestinationArea || !selectedRate)}
                    className="w-full bg-[#0b5cff] hover:bg-[#094acc] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <LucideIcons.CreditCard className="w-5 h-5" />
                    Bayar Sekarang
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                    <LucideIcons.Lock className="w-3 h-3" /> Secure and Encrypted Payment
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
