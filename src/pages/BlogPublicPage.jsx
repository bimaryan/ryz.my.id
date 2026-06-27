import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BlogPublicPage() {
  const { slug, blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const { data: blogData, error: blogError } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', blogId)
          .single();

        if (blogError) throw blogError;

        const { data: chaptersData, error: chaptersError } = await supabase
          .from('blog_chapters')
          .select('*')
          .eq('blog_id', blogId)
          .order('order_index', { ascending: true });

        if (chaptersError) throw chaptersError;

        const { data: pageData } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single();

        if (pageData) {
          setPage(pageData);
        }

        setBlog({
          ...blogData,
          chapters: chaptersData || []
        });
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, slug]);

  const [selectedChapter, setSelectedChapter] = useState(null);

  const theme = page?.theme || {};
  const bgStyle = theme.bg_type === 'gradient' ? theme.bg_value : theme.bg_type === 'image' ? `url(${theme.bg_value}) center/cover` : theme.bg_value || theme.bg_color || '#f8fafc';
  const textColor = theme.text_color || '#0f172a';
  const fontStyle = theme.font_family ? { fontFamily: theme.font_family } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgStyle }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: bgStyle, color: textColor, ...fontStyle }}>
        <h1 className="text-xl font-bold mb-4">Blog not found</h1>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold shadow">Go Back</button>
      </div>
    );
  }

  if (selectedChapter) {
    return (
      <div 
        className={`min-h-screen flex flex-col font-sans pb-12 ${theme.bg_animation && theme.bg_animation !== 'none' ? theme.bg_animation : ''} ${theme.bg_animated && theme.bg_type === 'gradient' ? 'animate-gradient' : ''} ${theme.bg_pattern && theme.bg_pattern !== 'none' ? 'bg-pattern-' + theme.bg_pattern : ''}`}
        style={{ background: bgStyle, color: textColor, ...fontStyle }}
      >
        <div className="sticky top-0 bg-black/5 backdrop-blur-md z-10 border-b border-black/10">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between p-4">
            <button 
              onClick={() => setSelectedChapter(null)}
              className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="font-bold text-sm line-clamp-1 px-4 text-center">{blog.title}</div>
            <button className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all shrink-0">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 pb-20">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl text-slate-900">
            <div className="mb-8 border-b border-slate-100 pb-8">
              <div className="text-[#0b5cff] font-black text-xs uppercase tracking-widest mb-3">{selectedChapter.part_name}</div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">{selectedChapter.title}</h1>
            </div>
            
            <div 
              className="prose prose-slate prose-lg max-w-none prose-p:leading-loose prose-headings:font-bold prose-a:text-[#0b5cff] break-words whitespace-pre-wrap overflow-hidden"
              dangerouslySetInnerHTML={{ __html: selectedChapter.content || '<em>No content available.</em>' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col relative pb-10 font-sans ${theme.bg_animation && theme.bg_animation !== 'none' ? theme.bg_animation : ''} ${theme.bg_animated && theme.bg_type === 'gradient' ? 'animate-gradient' : ''} ${theme.bg_pattern && theme.bg_pattern !== 'none' ? 'bg-pattern-' + theme.bg_pattern : ''}`}
      style={{ background: bgStyle, color: textColor, ...fontStyle }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-black/5 backdrop-blur-md z-10 border-b border-black/10">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="font-bold text-sm line-clamp-1 px-4 text-center">{blog.title}</div>

          <button className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all shrink-0">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl text-slate-900">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight leading-tight">{blog.title || 'Untitled Blog'}</h1>
          </div>

          {blog.description && (
            <>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-slate-300"></span> DESCRIPTION
              </div>
              <div 
                className="prose prose-slate max-w-none text-slate-600 prose-p:leading-relaxed prose-headings:font-bold break-words whitespace-pre-wrap overflow-hidden mb-10"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
            </>
          )}
          
          {/* If there are chapters, list them */}
          {blog.chapters && blog.chapters.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-slate-300"></span> CHAPTERS
              </div>
              <div className="space-y-3">
                {blog.chapters.map((chap, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedChapter(chap)}
                    className="w-full text-left p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md hover:border-[#0b5cff]/30 transition-all group"
                  >
                    <div className="pr-4">
                      <div className="text-[10px] text-[#0b5cff] font-bold mb-1 uppercase tracking-widest">{chap.part_name}</div>
                      <div className="font-bold text-slate-800 text-lg group-hover:text-[#0b5cff] transition-colors line-clamp-2">{chap.title}</div>
                    </div>
                    {chap.is_free ? (
                      <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-[#0b5cff] rounded-lg shrink-0">Read</span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg shrink-0">Locked</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
