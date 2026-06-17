import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Image as ImageIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

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
      className="min-h-screen w-full flex flex-col items-center py-16 px-4 font-sans"
      style={{ backgroundColor: theme.bg_color, color: theme.text_color }}
    >
      <Helmet>
        <title>{title || `@${slug}`} | RYZLink</title>
        <meta name="description" content={description || `Link-in-Bio for ${title || slug}`} />
        <meta property="og:title" content={title || `@${slug}`} />
        <meta property="og:description" content={description || `Link-in-Bio for ${title || slug}`} />
        {avatar_url && <meta property="og:image" content={avatar_url} />}
      </Helmet>

      <div className="w-full max-w-[600px] flex flex-col items-center animate-fade-in-up">
        {/* Avatar */}
        {avatar_url ? (
          <img src={avatar_url} alt={title || slug} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-6 shadow-xl border-4 border-white/10" />
        ) : (
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-black/5 mb-6 shadow-xl border-4 border-white/10 flex items-center justify-center text-black/20">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        
        {/* Profile Info */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3 text-center tracking-tight" style={{ color: theme.text_color }}>
          {title || `@${slug}`}
        </h1>
        <p className="text-base md:text-lg text-center mb-10 opacity-90 max-w-md leading-relaxed" style={{ color: theme.text_color }}>
          {description}
        </p>

        {/* Links */}
        <div className="w-full space-y-4">
          {links && links.length > 0 ? (
            links.map((link, i) => (
              <a
                key={i}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 px-6 text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${theme.button_style}`}
                style={{ backgroundColor: theme.button_bg, color: theme.button_text }}
              >
                {link.title || 'Untitled Link'}
              </a>
            ))
          ) : (
            <p className="text-center opacity-50">No links have been added yet.</p>
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
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: theme.text_color, color: theme.bg_color }}>R</div>
            RYZLink
          </div>
        </a>
      </div>
    </div>
  )
}
