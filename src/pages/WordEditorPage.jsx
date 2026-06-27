import { useState, useRef, useEffect } from 'react';
import { DocxEditor } from '@eigenpal/docx-editor-react';
import '@eigenpal/docx-editor-react/styles.css';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, Share2, Loader2, FileText, Menu, Search, Grid, LayoutGrid, ArrowDownAZ, Folder, ChevronDown, MoreVertical, List, Edit2, Trash2, FolderPlus, ChevronRight, History, Play, RotateCcw, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { createPortal } from 'react-dom';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-600 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Aplikasi Crash! (Error Boundary)</h1>
          <pre className="bg-white p-4 rounded border border-red-200 overflow-auto">
            {this.state.error?.toString()}
            <br/>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Muat Ulang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

// Global cache to prevent reload UI when switching sidebar tabs
let cachedDocs = null;
let cachedFolders = null;
let lastFetchWordDocs = 0;

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
 const [savedDocs, setSavedDocs] = useState(cachedDocs || []);
 const [isLoadingList, setIsLoadingList] = useState(!cachedDocs);
 const [viewMode, setViewMode] = useState('grid');
 const [activeMenu, setActiveMenu] = useState(null);
 const [deleteDocTarget, setDeleteDocTarget] = useState(null);
 const [renameDocTarget, setRenameDocTarget] = useState(null);
 const [moveDocTarget, setMoveDocTarget] = useState(null);
 const [newTitle, setNewTitle] = useState('');
 const [activeViewers, setActiveViewers] = useState([]);
 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 const [folders, setFolders] = useState(cachedFolders || []);
 const [currentFolderId, setCurrentFolderId] = useState(null);
 const [isCreatingFolder, setIsCreatingFolder] = useState(false);
 const [newFolderNameState, setNewFolderNameState] = useState('');
 const menuRef = useRef(null);

 const [showHistory, setShowHistory] = useState(false);
 const [docVersions, setDocVersions] = useState([]);
 const [isLoadingVersions, setIsLoadingVersions] = useState(false);
 const lastVersionTime = useRef(Date.now());

 // Auto-save effect
 useEffect(() => {
   if (!hasUnsavedChanges || isSaving || !id) return;

   const timer = setTimeout(() => {
     handleSaveToCloud(true);
   }, 3000); // 3 seconds debounce

   return () => clearTimeout(timer);
 }, [hasUnsavedChanges, isSaving, id, title, isPublic, allowPublicEdit]);

 useEffect(() => {
   if (!id) return;

   const viewerId = user ? user.id : Math.random().toString(36).substring(7);
   const viewerName = user && user.email ? (user.email.split('@')[0]) : 'Guest ' + Math.floor(Math.random() * 1000);
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
 }, [id, user?.id]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (menuRef.current && !menuRef.current.contains(event.target)) {
 setActiveMenu(null);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const executeDeleteDoc = async () => {
 if (!deleteDocTarget) return;
 
 try {
 const { error } = await supabase
 .from('word_documents')
 .delete()
 .eq('id', deleteDocTarget.id);
 
 if (error) throw error;
 
 if (deleteDocTarget.file_url && !deleteDocTarget.file_url.startsWith('UEsD')) {
 await supabase.storage.from('documents').remove([deleteDocTarget.file_url]);
 }
 
 const newDocs = savedDocs.filter(d => d.id !== deleteDocTarget.id);
 setSavedDocs(newDocs);
 cachedDocs = newDocs; // update cache
 toast.success("Dokumen berhasil dihapus");
 } catch (error) {
 console.error("Error deleting doc:", error);
 toast.error("Gagal menghapus dokumen");
 } finally {
 setDeleteDocTarget(null);
 }
 };

 const openRenameModal = (doc) => {
 setRenameDocTarget(doc);
 setNewTitle(doc.title);
 };

 const executeRenameDoc = async (e) => {
 if (e) e.preventDefault();
 if (!renameDocTarget || !newTitle || newTitle === renameDocTarget.title) {
 setRenameDocTarget(null);
 return;
 }
 
 try {
 const { error } = await supabase
 .from('word_documents')
 .update({ title: newTitle, updated_at: new Date() })
 .eq('id', renameDocTarget.id);
 
 if (error) throw error;
 
 const newDocs = savedDocs.map(d => d.id === renameDocTarget.id ? { ...d, title: newTitle, updated_at: new Date() } : d);
 setSavedDocs(newDocs);
 cachedDocs = newDocs; // update cache
 toast.success("Dokumen berhasil diubah namanya");
 } catch (error) {
 console.error("Error renaming doc:", error);
 toast.error("Gagal mengubah nama dokumen");
 } finally {
 setRenameDocTarget(null);
 }
 };

  const executeMoveDoc = async (folderId) => {
    if (!moveDocTarget) return;
    try {
      const { error } = await supabase
        .from('word_documents')
        .update({ folder_id: folderId })
        .eq('id', moveDocTarget.id);
      
      if (error) throw error;
      
      const newDocs = savedDocs.map(d => d.id === moveDocTarget.id ? { ...d, folder_id: folderId } : d);
      setSavedDocs(newDocs);
      cachedDocs = newDocs;
      toast.success("Dokumen dipindahkan");
    } catch (err) {
      console.error("Error moving doc:", err);
      toast.error("Gagal memindahkan");
    } finally {
      setMoveDocTarget(null);
    }
  };

 // Fetch list of documents when on the"Home" view (no id and no buffer)
 useEffect(() => {
 if (user && !id && !buffer) {
 fetchSavedDocs();
 }
 }, [user, id, buffer]);

  const fetchSavedDocs = async () => {
  // Only show loading spinner if we don't have cache
  if (!cachedDocs) {
  setIsLoadingList(true);
  }
  
  try {
  const docsRes = await supabase
    .from('word_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (docsRes.error) throw docsRes.error;

  const foldersRes = await supabase
    .from('word_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });
  
  cachedDocs = docsRes.data || [];
  cachedFolders = foldersRes.error ? [] : (foldersRes.data || []);
  
  lastFetchWordDocs = Date.now();
  setSavedDocs(cachedDocs);
  setFolders(cachedFolders);
  } catch (error) {
  console.error('Error fetching documents:', error);
  } finally {
  setIsLoadingList(false);
  }
  };

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderNameState.trim()) return;
    try {
      const { data, error } = await supabase
        .from('word_folders')
        .insert({ user_id: user.id, name: newFolderNameState.trim() })
        .select()
        .single();
      if (error) throw error;
      
      const newFolders = [...folders, data].sort((a,b) => a.name.localeCompare(b.name));
      setFolders(newFolders);
      cachedFolders = newFolders;
      setIsCreatingFolder(false);
      setNewFolderNameState('');
      toast.success("Folder berhasil dibuat!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat folder");
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

  const fetchVersions = async () => {
    if (!id) return;
    setIsLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from('word_document_versions')
        .select('*')
        .eq('document_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocVersions(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat riwayat versi');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const loadVersion = async (version) => {
    try {
      setIsLoadingDoc(true);
      if (version.file_url && version.file_url.startsWith('UEsD')) {
        const arrayBuffer = base64ToArrayBuffer(version.file_url);
        setBuffer(arrayBuffer);
      } else {
        const { data: fileData, error: storageError } = await supabase.storage
          .from('documents')
          .download(version.file_url);
        if (storageError) throw storageError;
        const arrayBuffer = await fileData.arrayBuffer();
        setBuffer(arrayBuffer);
      }
      setHasUnsavedChanges(true); 
      toast.success(`Versi "${version.version_name}" dimuat! (Klik Save untuk menyimpan)`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat versi');
    } finally {
      setIsLoadingDoc(false);
      setShowHistory(false);
    }
  };

 const handleSaveToCloud = async (isAutoSave = false) => {
 if (!buffer) return;
 if (!user) {
 if (!isAutoSave) toast.error('Anda harus login untuk menyimpan ke Cloud');
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
 if (!isAutoSave) toast.success('Dokumen berhasil diperbarui!');
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
 if (!isAutoSave) toast.success('Dokumen berhasil disimpan ke Cloud!');
 if (!isAutoSave) navigate(`/dashboard/word-editor/${insertData.id}`, { replace: true });
 }
 setHasUnsavedChanges(false);
 } catch (error) {
 console.error('Error saving document:', error);
 if (!isAutoSave) toast.error('Gagal menyimpan: ' + (error.message || 'Server error'));
 } finally {
 setIsSaving(false);
 }
 };

  const currentFolderName = currentFolderId ? folders.find(f => f.id === currentFolderId)?.name : null;
  const displayedDocs = savedDocs.filter(d => (d.folder_id || null) === currentFolderId);
  const displayedFolders = currentFolderId ? [] : folders;

  const hasItems = displayedDocs.length > 0 || displayedFolders.length > 0;

  return (
  <ErrorBoundary>
  <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden h-screen">
  <Helmet>
  <title>{title} | Word Editor RYZ</title>
  </Helmet>

  {/* Header */}
  {buffer ? (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0 gap-3">
 <div className="flex items-center gap-2 min-w-0 flex-1">
 <Link to="/dashboard/word-editor" className="text-gray-500 hover:text-gray-700 transition-colors shrink-0">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 
 <div className="flex items-center gap-2 min-w-0 w-full">
 <FileText className="w-6 h-6 text-blue-600 shrink-0 hidden sm:block" />
 <input 
 type="text" 
 value={title}
 onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
 className="text-lg font-semibold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 bg-transparent w-full min-w-0 truncate"
 placeholder="Untitled Document"
 />
 </div>
 </div>
 
 <div className="flex items-center gap-2 shrink-0">
 {activeViewers.length > 0 && (
 <div className="flex items-center -space-x-2 mr-1 sm:mr-3">
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

 {id && (
    <button 
      onClick={() => {
        setShowHistory(!showHistory);
        if (!showHistory) fetchVersions();
      }}
      className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors shrink-0 whitespace-nowrap rounded-md ${showHistory ? 'bg-blue-100 text-blue-700' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
    >
      <History className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">Riwayat</span>
    </button>
  )}

 <button 
 onClick={() => handleSaveToCloud(false)}
 disabled={isSaving}
 className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm transition-colors shrink-0 whitespace-nowrap"
 >
 {isSaving ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
 <span className="hidden sm:inline">Save to Cloud</span>
 <span className="sm:hidden">Save</span>
 </button>
 </div>
 </header>
 ) : (
 <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center shadow-sm z-10 shrink-0 sticky top-0">
 <Link to="/dashboard/word-editor" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-colors mr-3">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div className="flex items-center gap-2">
 <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
 <FileText className="w-5 h-5" />
 </div>
 <h1 className="text-xl font-bold text-slate-800 tracking-tight">Word Editor <span className="text-blue-600">RYZ</span></h1>
 </div>
 </header>
 )}

 {/* Editor Container / File Upload View */}
 <div className="flex-1 w-full relative overflow-hidden bg-slate-50 flex">
 {isLoadingDoc ? (
 <div className="flex w-full h-full items-center justify-center">
 <LoadingSpinner text="Memuat Dokumen dari Supabase..." fullScreen={false} />
 </div>
 ) : !buffer ? (
 <div className="w-full h-full overflow-y-auto">
 {/* Template Gallery Section */}
 <div className="bg-slate-50 py-8 border-b border-slate-200/60">
 <div className="max-w-6xl mx-auto px-4 lg:px-8">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-lg font-bold text-slate-800">Mulai dokumen baru</h2>
 <p className="text-sm text-slate-500 mt-1">Buat dokumen dari template atau upload file docx Anda.</p>
 </div>
 </div>
 
 <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar px-1">
 {/* Blank document card which triggers file upload */}
 <label className="cursor-pointer group flex flex-col shrink-0">
 <div className="w-[160px] h-[200px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:border-blue-500 transition-all duration-300 relative overflow-hidden transform">
 <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
 <UploadCloud className="w-8 h-8 text-blue-600" />
 </div>
 <input type="file" accept=".docx" className="hidden" onChange={handleFileUpload} />
 </div>
 <span className="mt-3 text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors text-center">Upload File</span>
 </label>
 
 {/* Dummy templates */}
 {['Laporan Bulanan', 'Proposal Proyek', 'Invoice Standar', 'Surat Penawaran'].map((name) => (
 <div key={name} className="flex flex-col shrink-0 cursor-not-allowed opacity-60 hover:opacity-100 transition-opacity group">
 <div className="w-[160px] h-[200px] bg-white/50 backdrop-blur-sm border border-slate-200 border-dashed rounded-2xl flex flex-col items-center p-5 relative overflow-hidden group-hover:border-slate-300 transition-colors">
 <div className="w-full h-full flex flex-col gap-2.5">
 <div className="w-1/3 h-2 bg-slate-300 rounded-full mb-2"></div>
 <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
 <div className="w-5/6 h-1.5 bg-slate-200 rounded-full"></div>
 <div className="w-4/5 h-1.5 bg-slate-200 rounded-full"></div>
 <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
 <div className="w-full h-10 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-lg mt-auto border border-slate-200/50"></div>
 </div>
 </div>
 <span className="mt-3 text-sm font-medium text-slate-600 text-center" title={name}>{name}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 
 {/* Recent Documents Section */}
 <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
 
 <div className="flex items-center gap-2">
   {currentFolderId ? (
     <div className="flex items-center text-slate-600 gap-2 font-bold text-lg">
       <button onClick={() => setCurrentFolderId(null)} className="hover:text-blue-600 transition-colors">Dokumen Anda</button>
       <ChevronRight className="w-5 h-5 text-slate-400" />
       <span className="text-slate-800">{currentFolderName}</span>
     </div>
   ) : (
     <h2 className="text-xl font-bold text-slate-800">Dokumen Anda</h2>
   )}
 </div>

 <div className="flex items-center gap-2">
 <button 
   onClick={() => setIsCreatingFolder(true)}
   className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
 >
   <FolderPlus className="w-4 h-4" /> New Folder
 </button>
 <div className="bg-white border border-slate-200 rounded-lg flex items-center p-1 shadow-sm">
 <button 
 onClick={() => setViewMode('grid')}
 className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
 title="Tampilan Grid"
 >
 <LayoutGrid className="w-4 h-4" />
 </button>
 <button 
 onClick={() => setViewMode('list')}
 className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
 title="Tampilan List"
 >
 <List className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>

 {user ? (
 <>
 {isLoadingList ? (
 <div className="py-20 flex items-center justify-center">
 <LoadingSpinner text="Memuat dokumen..." size="default" />
 </div>
 ) : hasItems ? (
 viewMode === 'grid' ? (
 <div>
 {/* Render Folders Section */}
 {displayedFolders.length > 0 && (
   <div className="mb-8">
     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Folders</h3>
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
       {displayedFolders.map(folder => (
         <div key={folder.id} 
              onClick={() => setCurrentFolderId(folder.id)}
              className="group bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all h-16">
           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
             <Folder className="w-6 h-6 fill-current opacity-80" />
           </div>
           <div className="flex-1 min-w-0">
             <h4 className="font-semibold text-slate-800 text-sm truncate">{folder.name}</h4>
           </div>
         </div>
       ))}
     </div>
   </div>
 )}

 {/* Render Docs Section */}
 {displayedDocs.length > 0 && (
   <div>
     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Files</h3>
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
       {displayedDocs.map(doc => (
       <div key={doc.id} className="group border border-gray-200 hover:border-blue-500 bg-white hover:shadow-md transition-all duration-200 flex flex-col h-[280px] relative rounded-md overflow-hidden">
       <Link 
       to={`/dashboard/word-editor/${doc.id}`}
       className="flex flex-col h-full"
       >
       {/* Thumbnail Section */}
       <div className="flex-1 bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-gray-200 relative group-hover:bg-blue-50/50 transition-colors">
       <FileText className="w-16 h-16 text-blue-500/40 group-hover:text-blue-500/60 transition-colors transform group-hover:scale-110 duration-300" strokeWidth={1.5} />
       </div>

       {/* Bottom Info Section */}
       <div className="h-[75px] bg-white p-3 flex items-start gap-3">
       <div className="mt-0.5 shrink-0">
       <FileText className="w-5 h-5 text-blue-500 fill-blue-500/10" />
       </div>
       <div className="flex flex-col min-w-0 pr-6">
       <h4 className="font-semibold text-gray-800 text-sm truncate">{doc.title}</h4>
       <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
       <span className="truncate">
       Dibuka {new Date(doc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
       </span>
       {doc.is_public && (
       <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] uppercase font-bold ml-1">Publik</span>
       )}
       </div>
       </div>
       </div>
       </Link>
       
       {/* Actions Dropdown */}
       <div className="absolute bottom-2 right-2 z-20">
       <button 
       onClick={(e) => {
       e.preventDefault();
       e.stopPropagation();
       setActiveMenu(activeMenu === doc.id ? null : doc.id);
       }}
       className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
       >
       <MoreVertical className="w-5 h-5" />
       </button>
       {activeMenu === doc.id && (
       <div ref={menuRef} className="absolute right-0 bottom-8 mb-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 overflow-hidden z-30">
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMoveDocTarget(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
       <FolderPlus className="w-4 h-4" /> Move to...
       </button>
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRenameModal(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
       <Edit2 className="w-4 h-4" /> Rename
       </button>
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteDocTarget(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
       <Trash2 className="w-4 h-4" /> Delete
       </button>
       </div>
       )}
       </div>
       </div>
       ))}
     </div>
   </div>
 )}
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {/* Render Folders Section */}
 {displayedFolders.length > 0 && (
   <div>
     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Folders</h3>
     <div className="flex flex-col gap-2">
       {displayedFolders.map(folder => (
         <div key={folder.id} 
              onClick={() => setCurrentFolderId(folder.id)}
              className="group bg-white border border-slate-200/80 rounded-xl hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-400 p-3 flex items-center gap-4 cursor-pointer transition-all">
           <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
             <Folder className="w-5 h-5 fill-current opacity-80" />
           </div>
           <h4 className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors leading-tight">{folder.name}</h4>
         </div>
       ))}
     </div>
   </div>
 )}

 {/* Render Docs Section */}
 {displayedDocs.length > 0 && (
   <div>
     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Files</h3>
     <div className="flex flex-col gap-3">
       {displayedDocs.map(doc => (
       <div key={doc.id} className="group bg-white border border-slate-200/80 rounded-xl hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-400 transition-all duration-300 flex items-center justify-between relative">
       <Link 
       to={`/dashboard/word-editor/${doc.id}`}
       className="flex items-center justify-between flex-1 p-4 pr-16"
       >
       <div className="flex items-center gap-4">
       <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
       <FileText className="w-5 h-5" />
       </div>
       <div>
       <h4 className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors leading-tight mb-1">{doc.title}</h4>
       <div className="flex items-center gap-2">
       {doc.is_public && (
       <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">Public</span>
       )}
       {doc.allow_public_edit && (
       <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">Guest Edit</span>
       )}
       </div>
       </div>
       </div>
       <div className="text-sm text-slate-500 font-medium hidden sm:block">
       {new Date(doc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
       </div>
       </Link>
       
       {/* Actions Dropdown */}
       <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
       <button 
       onClick={(e) => {
       e.preventDefault();
       e.stopPropagation();
       setActiveMenu(activeMenu === doc.id ? null : doc.id);
       }}
       className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
       >
       <MoreVertical className="w-5 h-5" />
       </button>
       {activeMenu === doc.id && (
       <div ref={menuRef} className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 overflow-hidden z-30">
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMoveDocTarget(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
       <FolderPlus className="w-4 h-4" /> Move to...
       </button>
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRenameModal(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
       <Edit2 className="w-4 h-4" /> Rename
       </button>
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteDocTarget(doc); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
       <Trash2 className="w-4 h-4" /> Delete
       </button>
       </div>
       )}
       </div>
       </div>
       ))}
     </div>
   </div>
 )}
 </div>
 )
 ) : (
 <div className="py-16 text-center bg-white border border-slate-200/60 rounded-2xl border-dashed">
  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
  <FileText className="w-8 h-8 text-slate-300" />
  </div>
  <p className="text-slate-500 font-medium">Belum ada dokumen yang disimpan.</p>
  <p className="text-sm text-slate-400 mt-1">Upload file docx pertama Anda di atas untuk memulai!</p>
  </div>
 )}
 </>
 ) : (
 <div className="py-20 text-center bg-white border border-slate-200 rounded-xl">
  <p className="text-gray-500 mb-4">Silakan login untuk melihat daftar dokumen yang tersimpan di Cloud.</p>
  <Link 
  to="/auth" 
  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
  >
  Login ke RYZ
  </Link>
  </div>
 )}
 </div>
 </div>
 ) : (
  <div className="flex-1 overflow-hidden relative">
     <DocxEditor 
     ref={editorRef} 
     documentBuffer={buffer} 
     mode="editing" 
     author={user?.email || "Author"}
     onChange={() => setHasUnsavedChanges(true)}
     />

  {/* Version History Sidebar */}
  {showHistory && (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] border-l border-slate-200 z-40 flex flex-col animate-in slide-in-from-right-8 duration-300">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-4 h-4 text-blue-600"/> Riwayat Versi</h3>
        <button onClick={() => setShowHistory(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-4 h-4"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingVersions ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-70">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2"/>
            <span className="text-sm text-slate-500">Memuat riwayat...</span>
          </div>
        ) : docVersions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            Belum ada versi tersimpan.
          </div>
        ) : (
          docVersions.map(v => (
            <div key={v.id} className="p-3 border border-slate-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
              <div className="font-medium text-slate-800 text-sm mb-1">{v.version_name}</div>
              <div className="text-xs text-slate-500 mb-3">{new Date(v.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <button 
                onClick={() => loadVersion(v)}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100"
              >
                <RotateCcw className="w-3 h-3"/> Restore Versi Ini
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )}
  </div>
  )}
  </div>

  {/* Rename Modal */}
 {renameDocTarget && createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
 <h3 className="text-xl font-bold text-slate-900 mb-4">Ganti Nama Dokumen</h3>
 <form onSubmit={executeRenameDoc}>
 <div className="mb-6">
 <input 
 type="text" 
 value={newTitle}
 onChange={(e) => setNewTitle(e.target.value)}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
 placeholder="Masukkan nama baru"
 autoFocus
 />
 </div>
 <div className="flex gap-3">
 <button 
 type="button"
 onClick={() => setRenameDocTarget(null)}
 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
 >
 Batal
 </button>
 <button 
 type="submit"
 className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
 disabled={!newTitle.trim()}
 >
 Simpan
 </button>
 </div>
 </form>
 </div>
 </div>,
 document.body
 )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteDocTarget}
          onClose={() => setDeleteDocTarget(null)}
          onConfirm={executeDeleteDoc}
          title="Hapus Dokumen?"
          message={`Anda yakin ingin menghapus dokumen "${deleteDocTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          cancelText="Batal"
        />

        {/* Create Folder Modal */}
        {isCreatingFolder && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Buat Folder Baru</h3>
              <form onSubmit={createFolder}>
                <input
                  autoFocus
                  type="text"
                  value={newFolderNameState}
                  onChange={(e) => setNewFolderNameState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-medium mb-6"
                  placeholder="Nama Folder"
                  required
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsCreatingFolder(false); setNewFolderNameState(''); }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderNameState.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                  >
                    Buat Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Move Folder Modal */}
        {moveDocTarget && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Pindahkan Dokumen</h3>
                <button onClick={() => setMoveDocTarget(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">Pilih folder tujuan untuk "{moveDocTarget.title}":</p>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  <button 
                    onClick={() => executeMoveDoc(null)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Folder className="w-5 h-5 text-slate-400" /> Root (Tidak masuk folder)
                  </button>
                  {folders.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => executeMoveDoc(f.id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Folder className="w-5 h-5 text-blue-500" /> {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
    );
  }
