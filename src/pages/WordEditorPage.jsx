import { useState, useRef, useEffect } from 'react';
import { DocxEditor } from '@eigenpal/docx-editor-react';
import '@eigenpal/docx-editor-react/styles.css';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, Share2, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

// Utility for Base64 -> ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export default function WordEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);
  
  const [buffer, setBuffer] = useState(null);
  const [title, setTitle] = useState('Untitled Document');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [allowPublicEdit, setAllowPublicEdit] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(!!id);
  const [savedDocs, setSavedDocs] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Fetch list of documents when on the "Home" view (no id and no buffer)
  useEffect(() => {
    if (user && !id && !buffer) {
      fetchSavedDocs();
    }
  }, [user, id, buffer]);

  const fetchSavedDocs = async () => {
    setIsLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('word_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      setSavedDocs(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = async (docId) => {
    setIsLoadingDoc(true);
    try {
      // 1. Fetch metadata
      const { data: doc, error: dbError } = await supabase
        .from('word_documents')
        .select('*')
        .eq('id', docId)
        .single();
        
      if (dbError) throw dbError;
      
      setTitle(doc.title);
      setIsPublic(doc.is_public);
      setAllowPublicEdit(doc.allow_public_edit || false);
      
      // 2. Fetch file from Database fallback (Base64 in file_url) or Storage
      if (doc.file_url && doc.file_url.startsWith('UEsD')) {
        // Use Base64 from database (DOCX zip magic number PK)
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
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Gagal memuat dokumen dari server.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitle(file.name.replace('.docx', ''));
      const arrayBuffer = await file.arrayBuffer();
      setBuffer(arrayBuffer);
      // Remove id from URL if we load a new local file
      if (id) navigate('/dashboard/word-editor', { replace: true });
    }
  };

  const handleSaveToCloud = async () => {
    if (!buffer) return;
    if (!user) {
      toast.error('Anda harus login untuk menyimpan ke Cloud');
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. Get the latest buffer from editor
      let currentBuffer = buffer;
      if (editorRef.current) {
        currentBuffer = await editorRef.current.save();
      }
      
      // 2. Generate a unique filename
      const fileExt = 'docx';
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const blob = new Blob([currentBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      // 3. Upload to Supabase Storage (with fallback)
      let storageSuccess = true;
      try {
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, blob, { upsert: true });
          
        if (uploadError) throw uploadError;
      } catch (err) {
        console.warn('Storage upload failed, falling back to base64 in database:', err);
        storageSuccess = false;
      }
      
      const base64Content = storageSuccess ? null : arrayBufferToBase64(currentBuffer);
      const finalFileUrl = base64Content ? base64Content : fileName;
      
      // 4. Save to Database
      if (id) {
        // Update existing document
        const { error: dbError } = await supabase
          .from('word_documents')
          .update({
            title: title,
            file_url: finalFileUrl, // Store Base64 directly here if storage failed
            is_public: isPublic,
            allow_public_edit: allowPublicEdit,
            updated_at: new Date()
          })
          .eq('id', id);
          
        if (dbError) throw dbError;
        toast.success('Dokumen berhasil diperbarui!');
      } else {
        // Insert new document
        const { data: insertData, error: dbError } = await supabase
          .from('word_documents')
          .insert({
            user_id: user.id,
            title: title,
            file_url: finalFileUrl, // Store Base64 directly here if storage failed
            is_public: isPublic,
            allow_public_edit: allowPublicEdit
          })
          .select()
          .single();
          
        if (dbError) throw dbError;
        toast.success('Dokumen berhasil disimpan ke Cloud!');
        navigate(`/dashboard/word-editor/${insertData.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Gagal menyimpan: ' + (error.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden h-screen">
      <Helmet>
        <title>{title} | Word Editor RYZ</title>
      </Helmet>

      {/* Header */}
      {buffer ? (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-2 min-w-0 w-full">
              <FileText className="w-6 h-6 text-blue-600 shrink-0 hidden sm:block" />
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 bg-transparent w-full min-w-0 truncate"
                placeholder="Untitled Document"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col gap-1 mr-1 sm:mr-2">
              <label className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={(e) => {
                    setIsPublic(e.target.checked);
                    if (!e.target.checked) setAllowPublicEdit(false);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="hidden sm:inline">Publik (Bisa Dibagikan)</span>
                <span className="sm:hidden">Publik</span>
              </label>
              
              {isPublic && (
                <label className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 cursor-pointer sm:ml-4 whitespace-nowrap shrink-0">
                  <input 
                    type="checkbox" 
                    checked={allowPublicEdit} 
                    onChange={(e) => setAllowPublicEdit(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                  />
                  Izinkan Tamu Mengedit
                </label>
              )}
            </div>
            
            {id && isPublic && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/d/${id}`);
                  toast.success('Link tautan publik disalin!');
                }}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors shrink-0 whitespace-nowrap"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button 
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm transition-colors shrink-0 whitespace-nowrap"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">Save to Cloud</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </header>
      ) : (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center shadow-sm z-10 shrink-0">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">Word Editor RYZ</h1>
        </header>
      )}

      {/* Editor Container / File Upload View */}
      <div className="flex-1 w-full relative overflow-y-auto bg-gray-50">
        {isLoadingDoc ? (
           <div className="flex h-full items-center justify-center">
             <LoadingSpinner text="Memuat Dokumen dari Supabase..." fullScreen={false} />
           </div>
        ) : !buffer ? (
          <div className="max-w-5xl mx-auto px-4 py-12">
            {/* Upload Hero Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 text-center mb-12">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                <UploadCloud className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Upload Dokumen Word</h2>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">Pilih file .docx dari perangkat Anda untuk mulai membaca atau mengeditnya langsung di dalam browser.</p>
              
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                <UploadCloud className="w-5 h-5" />
                <span className="text-lg">Pilih File .docx</span>
                <input
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {/* Recent Documents Section */}
            {user ? (
               <div className="w-full">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                     <FileText className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900">
                     Dokumen Tersimpan Anda
                   </h3>
                 </div>
                 
                {isLoadingList ? (
                   <div className="py-20 bg-white rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center">
                     <LoadingSpinner text="Memuat daftar dokumen..." size="default" />
                   </div>
                 ) : savedDocs.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {savedDocs.map(doc => (
                       <Link 
                         key={doc.id}
                         to={`/dashboard/word-editor/${doc.id}`}
                         className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col h-full"
                       >
                         <div className="flex items-start justify-between mb-4">
                           <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                             <FileText className="w-8 h-8" />
                           </div>
                           <div className="flex flex-col items-end gap-1.5">
                             {doc.is_public && (
                               <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Public</span>
                             )}
                             {doc.allow_public_edit && (
                               <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Guest Edit</span>
                             )}
                           </div>
                         </div>
                         <h4 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                         <p className="text-xs text-gray-500 mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                           <span>Diperbarui:</span>
                           <span className="font-semibold">{new Date(doc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                         </p>
                       </Link>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-200 border-dashed">
                     <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 font-medium text-lg">Belum ada dokumen yang tersimpan di cloud.</p>
                     <p className="text-gray-400 mt-2">Gunakan tombol upload di atas untuk menyimpan dokumen pertama Anda.</p>
                   </div>
                 )}
               </div>
            ) : (
               <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-200">
                 <p className="text-gray-500 font-medium text-lg">
                   Silakan login untuk menyimpan dan melihat dokumen di Cloud.
                 </p>
               </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full">
            <DocxEditor 
              ref={editorRef} 
              documentBuffer={buffer} 
              mode="editing" 
              author={user?.email || "Author"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
