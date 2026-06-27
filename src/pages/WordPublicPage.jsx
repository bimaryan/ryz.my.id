import { useState, useEffect, useRef } from 'react';
import { DocxEditor } from '@eigenpal/docx-editor-react';
import '@eigenpal/docx-editor-react/styles.css';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Loader2, FileText, Download, ShieldAlert, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Utility for ArrayBuffer <-> Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export default function WordPublicPage() {
  const { id } = useParams();
  const editorRef = useRef(null);
  
  const [buffer, setBuffer] = useState(null);
  const [title, setTitle] = useState('Loading Document...');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [docMeta, setDocMeta] = useState(null);
  const [allowEdit, setAllowEdit] = useState(false);
  const [activeViewers, setActiveViewers] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !id || !allowEdit) return;

    const timer = setTimeout(() => {
      handleSaveToCloud(true);
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, isSaving, id, allowEdit]);

  useEffect(() => {
    if (!id) return;

    const viewerId = Math.random().toString(36).substring(7);
    const viewerName = 'Guest ' + Math.floor(Math.random() * 1000);
    const color = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'][Math.floor(Math.random() * 9)];

    const room = supabase.channel(`doc_${id}`, {
      config: {
        presence: {
          key: viewerId,
        },
      },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const viewers = [];
        for (const key in state) {
           viewers.push(state[key][0]); 
        }
        setActiveViewers(viewers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({
            id: viewerId,
            name: viewerName,
            color: color
          });
        }
      });

    return () => {
      room.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPublicDocument(id);
    }
  }, [id]);

  const loadPublicDocument = async (docId) => {
    setIsLoading(true);
    try {
      // 1. Fetch metadata
      const { data: doc, error: dbError } = await supabase
        .from('word_documents')
        .select('*')
        .eq('id', docId)
        .eq('is_public', true)
        .single();
        
      if (dbError) {
        if (dbError.code === 'PGRST116') {
          throw new Error('Dokumen tidak ditemukan atau bersifat privat.');
        }
        throw dbError;
      }
      
      setTitle(doc.title);
      setAllowEdit(doc.allow_public_edit || false);
      setDocMeta(doc);
      
      // 2. Fetch file from database fallback (Base64 in file_url) or Storage
      if (doc.file_url && doc.file_url.startsWith('UEsD')) {
        // Use Base64 from database
        const arrayBuffer = base64ToArrayBuffer(doc.file_url);
        setBuffer(arrayBuffer);
      } else {
        // Use Storage
        const { data: fileData, error: storageError } = await supabase.storage
          .from('documents')
          .download(doc.file_url);
          
        if (storageError) throw storageError;
        
        const arrayBuffer = await fileData.arrayBuffer();
        setBuffer(arrayBuffer);
      }
      
      // Generate temporary URL for download
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 3600); // 1 hour
        
      if (urlData?.signedUrl) {
        setFileUrl(urlData.signedUrl);
      }
      
    } catch (err) {
      console.error('Error loading public document:', err);
      setError(err.message || 'Gagal memuat dokumen.');
      toast.error('Gagal membuka dokumen ini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCloud = async (isAutoSave = false) => {
    if (!buffer || !docMeta) return;
    
    setIsSaving(true);
    try {
      // 1. Get the latest buffer from editor
      let currentBuffer = buffer;
      if (editorRef.current) {
        currentBuffer = await editorRef.current.save();
      }
      
      // 2. We use base64 fallback for public saves as it avoids messy storage overwrites if guest doesn't have RLS
      const base64Content = arrayBufferToBase64(currentBuffer);
      
      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('word_documents')
        .update({
          file_url: base64Content,
          updated_at: new Date()
        })
        .eq('id', docMeta.id);
        
      if (dbError) throw dbError;
      if (!isAutoSave) toast.success('Editan berhasil disimpan ke Cloud!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving public document:', error);
      if (!isAutoSave) toast.error('Gagal menyimpan: ' + (error.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Helmet>
          <title>Dokumen Tidak Ditemukan</title>
        </Helmet>
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard/word-editor" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden h-screen">
      <Helmet>
        <title>{title} | Tampilan Publik</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="w-6 h-6 text-blue-600 shrink-0" />
          <h1 className="text-lg font-semibold text-gray-900 truncate" title={title}>
            {title}
          </h1>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium border border-gray-200 shrink-0 whitespace-nowrap hidden sm:inline-block">
            {allowEdit ? 'Guest Editor' : 'View Only'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {activeViewers.length > 0 && (
            <div className="flex items-center -space-x-2 mr-1 sm:mr-2">
              {activeViewers.map((v) => (
                <div 
                  key={v.id} 
                  title={v.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[9px] sm:text-[11px] font-bold border-2 border-white shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: v.color }}
                >
                  {v.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {!allowEdit && (
             <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs sm:text-sm font-medium border border-gray-200 flex items-center gap-1.5 whitespace-nowrap hidden sm:flex">
               Mode Lihat Saja
             </div>
          )}

          {allowEdit && (
            <button 
              onClick={() => handleSaveToCloud(false)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm transition-colors shrink-0 whitespace-nowrap"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">Simpan Editan</span>
              <span className="sm:hidden">Simpan</span>
            </button>
          )}

          {fileUrl && (
            <a 
              href={fileUrl}
              download={`${title}.docx`}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors shrink-0 whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </header>

      {/* Editor Container / Loading View */}
      <div className={`flex-1 w-full relative overflow-hidden bg-gray-100 ${!allowEdit ? 'view-only-mode' : ''}`}>
        {isLoading || !buffer ? (
           <LoadingSpinner text="Membuka dokumen..." />
        ) : (
          <DocxEditor 
            ref={editorRef} 
            documentBuffer={buffer} 
            mode={allowEdit ? "editing" : "viewing"} 
            author="Guest" 
            onChange={() => setHasUnsavedChanges(true)}
          />
        )}
      </div>
    </div>
  );
}
