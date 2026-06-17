import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BlogPublicPage() {
  const { slug, blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
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
  }, [blogId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0b5cff] animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-slate-800">Blog not found</h1>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#0b5cff] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-24 font-sans text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-200">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all relative">
            <ShoppingCart className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 bg-[#0b5cff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6">
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{blog.title || 'adada'}</h1>
          <div className="text-base font-black text-[#0b5cff] whitespace-nowrap ml-4 bg-blue-50 px-3 py-1 rounded-lg">
            {blog.currency || 'IDR'} {blog.price || '0'}
          </div>
        </div>

        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-slate-300"></span> DESCRIPTION
        </div>

        <div 
          className="prose prose-slate max-w-none text-slate-600 prose-p:leading-relaxed prose-headings:font-bold"
          dangerouslySetInnerHTML={{ __html: blog.description || 'No description provided.' }}
        />
        
        {/* If there are chapters, list them */}
        {blog.chapters && blog.chapters.length > 0 && (
          <div className="mt-10">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-300"></span> CHAPTERS
            </div>
            <div className="space-y-3">
              {blog.chapters.map((chap, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">{chap.part_name}</div>
                    <div className="font-bold text-slate-800">{chap.title}</div>
                  </div>
                  {chap.is_free ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-[#0b5cff]/10 text-[#0b5cff] rounded-lg">Free</span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-200 flex items-center gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <button className="w-[54px] h-[54px] rounded-2xl border-2 border-[#0b5cff] text-[#0b5cff] flex items-center justify-center shrink-0 hover:bg-blue-50 transition-colors shadow-sm">
          <div className="relative flex items-center justify-center">
            <span className="absolute -left-3 -top-1 text-xs font-black">+</span>
            <ShoppingCart className="w-5 h-5" />
          </div>
        </button>
        <button className="flex-1 h-[54px] bg-[#0b5cff] hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
          Buy Now
        </button>
      </div>

    </div>
  );
}
