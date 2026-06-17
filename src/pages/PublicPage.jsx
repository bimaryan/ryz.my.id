import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import * as LucideIcons from 'lucide-react'
import { Helmet } from 'react-helmet-async'

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
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
            {theme.social_links?.instagram && <a href={theme.social_links.instagram} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.instagram : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>}
            {theme.social_links?.twitter && <a href={theme.social_links.twitter} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.twitter : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.15H5.078z"/></svg></a>}
            {theme.social_links?.github && <a href={theme.social_links.github} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.github : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg></a>}
            {theme.social_links?.linkedin && <a href={theme.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.linkedin : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
            {theme.social_links?.youtube && <a href={theme.social_links.youtube} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.youtube : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>}
            {theme.social_links?.tiktok && <a href={theme.social_links.tiktok} target="_blank" rel="noreferrer" className="hover:scale-110 hover:-translate-y-1 transition-all duration-300" style={{ color: theme.social_style === 'brand' ? BRAND_COLORS.tiktok : theme.text_color }}><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.68-.39 3.32-1.14 4.8-.75 1.48-1.84 2.75-3.15 3.68-1.31.93-2.82 1.5-4.4 1.68-1.58.18-3.19-.02-4.66-.58-1.47-.56-2.77-1.43-3.8-2.58-1.03-1.15-1.77-2.55-2.16-4.08-.39-1.53-.44-3.12-.14-4.63.3-1.51.93-2.92 1.84-4.14 1.15-1.52 2.68-2.65 4.43-3.23 1.75-.58 3.65-.58 5.4.01v4.06c-1.14-.37-2.39-.37-3.53.01-1.14.38-2.12 1.12-2.78 2.09-.66.97-.97 2.15-.89 3.32.08 1.17.56 2.27 1.37 3.12.81.85 1.89 1.36 3.07 1.45 1.18.09 2.37-.23 3.37-.91 1-.68 1.71-1.68 2.01-2.83.3-1.15.25-2.36-.15-3.48V.02h3.91z"/></svg></a>}
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
    </div>
  )
}
