import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaInstagram, FaXTwitter, FaGithub, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa6'
import { supabase } from '@/lib/supabase'
import * as LucideIcons from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import ComplexBlockRender from '@/components/ComplexBlockRender'

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
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '' })
  const [creatorWA, setCreatorWA] = useState('')

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (selectedProduct.ask_phone !== false && !checkoutForm.name) {
      alert("Please fill in your Name.");
      return;
    }
    if (selectedProduct.require_address && !checkoutForm.address) {
      alert("Please fill in your Shipping Address.");
      return;
    }
    let text = `Halo, saya tertarik dengan:\n\n*${selectedProduct.title}*\n`;
    if (selectedProduct.price) text += `Harga: Rp ${parseInt(selectedProduct.price).toLocaleString('id-ID')}\n`;
    if (checkoutForm.name) text += `\nNama Pemesan: ${checkoutForm.name}`;
    if (checkoutForm.address) text += `\nAlamat Pengiriman: ${checkoutForm.address}`;
    
    const waUrl = `https://wa.me/${creatorWA}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    setIsCheckoutOpen(false);
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
      className={`min-h-screen w-full flex flex-col items-center py-16 px-4 ${theme.bg_animated && theme.bg_type === 'gradient' ? 'animate-gradient' : ''}`}
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
          <link href={`https://fonts.googleapis.com/css2?family=${theme.font_family.replace(/ /g, '+')}:wght@400;600;700;800&display=swap`} rel="stylesheet" />
        )}
      </Helmet>

      <div className="w-full max-w-[600px] flex flex-col items-center animate-fade-in-up">
        {/* Avatar */}
        {avatar_url ? (
          <img src={avatar_url} alt={title || slug} className={`w-24 h-24 md:w-28 md:h-28 object-cover mb-6 shadow-xl border-4 border-white/20 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'}`} />
        ) : (
          <div className={`w-24 h-24 md:w-28 md:h-28 bg-black/5 mb-6 shadow-xl border-4 border-white/20 flex items-center justify-center text-black/20 ${theme.avatar_shape === 'clip-hexagon' ? '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]' : theme.avatar_shape || 'rounded-full'}`}>
            {LucideIcons.Image && <LucideIcons.Image className="h-10 w-10" />}
          </div>
        )}
        
        {/* Profile Info */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3 text-center tracking-tight" style={{ color: theme.text_color }}>
          {title || `@${slug}`}
        </h1>
        <p className="text-base md:text-lg text-center mb-10 opacity-90 max-w-md leading-relaxed" style={{ color: theme.text_color }}>
          {description}
        </p>

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
                        setIsCheckoutOpen(true);
                        setCheckoutForm({ name: '', phone: '' });
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
                  className={`block w-full text-lg font-bold transition-all duration-300 ${theme.button_animation || 'hover:scale-[1.02]'} active:scale-[0.98] ${theme.button_style} border relative overflow-hidden ${theme.layout === 'grid' ? 'aspect-square p-4 flex flex-col items-center justify-center text-center gap-3' : 'py-4 px-6'}`}
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
        
        {/* Footer Brand */}
        <a 
          href="/" 
          className="mt-20 opacity-40 hover:opacity-100 transition-opacity flex flex-col items-center gap-2 group" 
          style={{ color: theme.text_color }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-1">Powered by</div>
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: theme.text_color, color: theme.bg_type === 'color' ? theme.bg_value : '#000' }}>R</div>
            RYZLink
          </div>
        </a>
      </div>

      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex flex-col items-center p-6 text-center border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-1">{selectedProduct.title || 'Checkout'}</h3>
              <p className="text-sm font-bold text-slate-500">{selectedProduct.price ? `Rp ${parseInt(selectedProduct.price).toLocaleString('id-ID')}` : 'FREE'}</p>
            </div>
            
            <form onSubmit={handleCheckout} className="p-6 flex flex-col gap-4">
              {selectedProduct.ask_phone !== false ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-medium text-slate-900"
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                    />
                    <p className="text-[11px] text-slate-500 mt-2">Pesan akan diteruskan ke WhatsApp kreator.</p>
                  </div>
                  {selectedProduct.require_address && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Shipping Address</label>
                      <textarea 
                        required
                        placeholder="Alamat lengkap (Jalan, RT/RW, Kecamatan, Kota, Kode Pos)"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-medium text-slate-900 resize-none"
                        rows={3}
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 py-4">
                  Proceed to complete your transaction via WhatsApp.
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-3 px-4 font-bold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-lg shadow-green-500/30 flex justify-center items-center gap-2">
                  <LucideIcons.MessageCircle className="w-5 h-5" /> Checkout via WA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
