"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import LinkExtension from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { 
  ArrowLeft, CheckCircle2, Clock, Image as ImageIcon, X, 
  UploadCloud, Save, Eye, Send, AlertTriangle, Settings, Calendar, Globe,
  Type, LayoutList, Quote, Code, List, Heading1, Heading2, Layout
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const initialId = unwrappedParams.id;

  const uploadToCloudinary = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await res.json();
          if (data.success) resolve(data.url);
          else reject(data.error);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Core Document State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  
  // Modals & Panels
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');
  
  // Document Metadata
  const [draftId, setDraftId] = useState<string | null>(null);
  const [category, setCategory] = useState("Software Design");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  
  // Publishing State
  const [status, setStatus] = useState("Draft");
  const [visibility, setVisibility] = useState("Public");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  
  // SEO Data
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const router = useRouter();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  
  // TipTap Editor Setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      LinkExtension.configure({ openOnClick: false }),
      CodeBlock,
      Placeholder.configure({
        placeholder: "Press '/' for commands, or start writing your masterpiece...",
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] leading-relaxed',
      },
    },
    onUpdate: () => {
      setSaveStatus("unsaved");
      // Cache locally for crash recovery
      if (typeof window !== 'undefined') {
        localStorage.setItem(`draft-backup-${initialId}`, JSON.stringify({
          title, content: editor?.getHTML(), timestamp: new Date().toISOString()
        }));
      }
    }
  });

  // Initialization & Crash Recovery
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!editor || fetchedRef.current) return;
    
    const checkRecovery = async () => {
      if (initialId && initialId !== 'new') {
        fetchedRef.current = true;
        // Load existing draft
        setDraftId(initialId);
        try {
          // First attempt to load as a Draft
          let res = await fetch(`/api/drafts/${initialId}`);
          let data = await res.json();
          
          // Fallback to loading as an Article if draft is missing
          if (!data.success || !data.data) {
            res = await fetch(`/api/articles/${initialId}`);
            data = await res.json();
          }

          if (data.success && data.data) {
            setTitle(data.data.title || '');
            setCategory(data.data.category || 'Software Design');
            
            // Format tags if they come as an array from Article
            const tagsData = data.data.tags;
            setTags(Array.isArray(tagsData) ? tagsData.join(', ') : (tagsData || ''));
            
            setCoverImage(data.data.coverImage || '');
            setMetaTitle(data.data.seo?.metaTitle || '');
            setMetaDescription(data.data.seo?.metaDescription || '');
            setKeywords(data.data.seo?.keywords || '');
            
            if (data.data.content) {
              editor.commands.setContent(data.data.content, { emitUpdate: false });
            }
          }
        } catch (err) {
          console.error("Failed to load document:", err);
          fetchedRef.current = false;
        }
      } else if (initialId === 'new') {
        fetchedRef.current = true;
        // New article check local storage crash recovery
        const backup = localStorage.getItem('draft-backup-new');
        if (backup) {
          const parsed = JSON.parse(backup);
          const backupAge = (new Date().getTime() - new Date(parsed.timestamp).getTime()) / 1000 / 60;
          if (backupAge < 60 * 24) { // Less than 24 hours old
            setShowRecoveryModal(true);
          }
        }
      }
    };
    checkRecovery();
  }, [initialId, editor]);

  // Auto-save logic
  const handleAutoSave = useCallback(async () => {
    if (saveStatus !== "unsaved" || !editor) return;
    
    setSaveStatus("saving");
    
    try {
      const htmlContent = editor.getHTML();
      
      const payload = {
        id: draftId,
        title: title || "Untitled Draft",
        content: htmlContent,
        category,
        tags,
        coverImage,
        seo: { metaTitle, metaDescription, keywords }
      };

      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success && data.data._id) {
        setDraftId(data.data._id);
        if (initialId === 'new') {
          // Update URL without triggering a full page reload so it's not "new" anymore
          router.replace(`/admin/editor/${data.data._id}`);
        }
        // Clear local backup on successful server save
        localStorage.removeItem(`draft-backup-${initialId}`);
      }
      
      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed", error);
    }
  }, [saveStatus, editor, title, draftId, category, tags, coverImage, metaTitle, metaDescription, keywords, initialId]);

  // Run auto-save every 15 seconds if unsaved
  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoSave();
    }, 15000);
    return () => clearInterval(timer);
  }, [handleAutoSave]);

  const handlePublish = async () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || "Untitled Article",
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          content: htmlContent,
          category,
          tags,
          coverImage,
          status: status,
          visibility: visibility,
          scheduledFor: status === 'Scheduled' ? `${scheduleDate}T${scheduleTime}:00.000Z` : null,
          seo: { metaTitle, metaDescription, keywords }
        }),
      });

      if (res.ok && draftId) {
        // Clean up draft
        await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' });
        localStorage.removeItem(`draft-backup-${initialId}`);
      }

      router.push("/admin/articles");
    } catch (error) {
      console.error("Publish failed", error);
    }
  };

  const recoverDraft = () => {
    const backup = localStorage.getItem(`draft-backup-${initialId}`);
    if (backup && editor) {
      const parsed = JSON.parse(backup);
      setTitle(parsed.title);
      editor.commands.setContent(parsed.content);
    }
    setShowRecoveryModal(false);
  };

  const discardRecovery = () => {
    localStorage.removeItem(`draft-backup-${initialId}`);
    setShowRecoveryModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] overflow-hidden">
      
      {/* Editor Top Header */}
      <header className="shrink-0 bg-white border-b border-[var(--border)] px-4 sm:px-6 h-16 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (saveStatus === "unsaved") handleAutoSave();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors border border-transparent hover:border-[var(--border)]"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            onClick={() => window.open(`/articles/${initialId}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--foreground)] bg-white border border-[var(--border)] shadow-sm hover:bg-[#FAFAFA] rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4" /> Publish
          </button>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left/Center Editor Canvas */}
        <div className="flex-1 overflow-y-auto bg-[#FCFCFA]">
          
          {/* Quick Toolbar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[var(--border)] px-8 py-2 flex items-center gap-1 shadow-sm overflow-x-auto">
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-slate-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}><Heading1 className="w-5 h-5" /></button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}><Heading2 className="w-5 h-5" /></button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-100 font-bold ${editor?.isActive('bold') ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}>B</button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-100 italic font-serif ${editor?.isActive('italic') ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}>I</button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-100 ${editor?.isActive('bulletList') ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}><List className="w-5 h-5" /></button>
            <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-100 ${editor?.isActive('blockquote') ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}><Quote className="w-5 h-5" /></button>
            <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded hover:bg-slate-100 ${editor?.isActive('codeBlock') ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}><Code className="w-5 h-5" /></button>
            <label className="p-2 rounded hover:bg-slate-100 text-slate-600 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSaveStatus('saving');
                  try {
                    const url = await uploadToCloudinary(file);
                    editor?.chain().focus().setImage({ src: url }).run();
                    setSaveStatus('saved');
                  } catch (err) {
                    alert('Failed to upload image');
                    setSaveStatus('saved');
                  }
                }
              }} />
              <ImageIcon className="w-5 h-5" />
            </label>
          </div>

          <div className="max-w-4xl mx-auto px-8 py-12 pb-32">
            
            {/* Title & Meta Data Input Area */}
            <div className="mb-8 group">
              <textarea
                ref={titleRef}
                rows={1}
                placeholder="Article Title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaveStatus("unsaved");
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full text-5xl font-black font-heading tracking-tight text-[var(--foreground)] placeholder-[var(--muted-foreground)]/50 border-none focus:outline-none focus:ring-0 bg-transparent resize-none overflow-hidden leading-tight"
              />
              
              {/* Slug Editor (visible when title has content) */}
              <div className={`mt-2 flex items-center gap-2 transition-opacity ${title ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">URL Slug:</span>
                <Globe className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span className="text-sm text-[var(--muted-foreground)]">yoursite.com/articles/</span>
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent border-b border-dashed border-[var(--border)] focus:border-[var(--primary)] text-sm font-bold text-[var(--foreground)] focus:outline-none px-1"
                />
              </div>
            </div>

            {/* TipTap Editor Area */}
            <div className="min-h-[500px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Configuration Panels */}
        <aside className="w-80 border-l border-[var(--border)] bg-white flex flex-col shrink-0 overflow-y-auto">
          {/* Sidebar Tabs */}
          <div className="flex p-2 border-b border-[var(--border)] gap-1 sticky top-0 bg-white z-10">
            <button onClick={() => setActiveTab('content')} className={`flex-1 py-2 text-xs font-bold rounded-md flex justify-center items-center gap-1.5 transition-colors ${activeTab === 'content' ? 'bg-[var(--foreground)] text-white shadow' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
              <LayoutList className="w-3.5 h-3.5" /> Content
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-xs font-bold rounded-md flex justify-center items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'bg-[var(--foreground)] text-white shadow' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
              <Settings className="w-3.5 h-3.5" /> Publish
            </button>
            <button onClick={() => setActiveTab('seo')} className={`flex-1 py-2 text-xs font-bold rounded-md flex justify-center items-center gap-1.5 transition-colors ${activeTab === 'seo' ? 'bg-[var(--foreground)] text-white shadow' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
              <Globe className="w-3.5 h-3.5" /> SEO
            </button>
          </div>

          <div className="p-6 space-y-8">
            
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <>
                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Featured Image</label>
                  {coverImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-[var(--border)] group">
                      <img src={coverImage} alt="Cover" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-bold shadow-sm text-black">
                          Replace
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSaveStatus('saving');
                              try {
                                const url = await uploadToCloudinary(file);
                                setCoverImage(url);
                                setSaveStatus('saved');
                              } catch (err) {
                                alert('Failed to upload cover image');
                                setSaveStatus('saved');
                              }
                            }
                          }} />
                        </label>
                        <button onClick={() => setCoverImage("")} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#FAFAFA] transition-colors cursor-pointer group block">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSaveStatus('saving');
                          try {
                            const url = await uploadToCloudinary(file);
                            setCoverImage(url);
                            setSaveStatus('saved');
                          } catch (err) {
                            alert('Failed to upload cover image');
                            setSaveStatus('saved');
                          }
                        }
                      }} />
                      <div className="w-10 h-10 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full flex items-center justify-center mb-3 group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[var(--foreground)] mb-1">Click to upload image</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] font-medium">JPEG, PNG, WEBP (Max 5MB)</p>
                    </label>
                  )}
                </div>

                <div className="h-px bg-[var(--border)]"></div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none"
                  >
                    <option>Software Design</option>
                    <option>Web Development</option>
                    <option>Tutorials</option>
                    <option>Tech News</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Tags</label>
                  <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Next.js, React (comma separated)"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">Separate tags with commas.</p>
                </div>
              </>
            )}

            {/* PUBLISH TAB */}
            {activeTab === 'settings' && (
              <>
                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Post Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none"
                  >
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Published">Published (Live)</option>
                    <option value="Scheduled">Scheduled (Future)</option>
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Visibility</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[#FAFAFA]">
                      <input type="radio" name="vis" checked={visibility === 'Public'} onChange={() => setVisibility('Public')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                      <div>
                        <div className="text-sm font-bold">Public</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Visible to everyone</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[#FAFAFA]">
                      <input type="radio" name="vis" checked={visibility === 'Private'} onChange={() => setVisibility('Private')} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
                      <div>
                        <div className="text-sm font-bold">Private</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Only visible to admins</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Schedule Options (only if Scheduled) */}
                {status === 'Scheduled' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule Publish</h4>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1.5">Date</label>
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1.5">Time</label>
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <>
                <div className="p-4 bg-[#FAFAFA] border border-[var(--border)] rounded-xl mb-6">
                  <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Search Preview</h4>
                  <div className="text-blue-600 text-sm font-bold truncate">{metaTitle || title || "Your Article Title"}</div>
                  <div className="text-emerald-700 text-xs truncate">yoursite.com/articles/{slug || "slug"}</div>
                  <div className="text-slate-600 text-xs mt-1 line-clamp-2">{metaDescription || "Your meta description will appear here in search engine results."}</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Meta Title</label>
                  <input 
                    type="text" 
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "SEO Title"}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Meta Description</label>
                  <textarea 
                    rows={4}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search engines (150-160 characters)"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none resize-none"
                  />
                  <div className="text-right text-xs text-[var(--muted-foreground)] mt-1 font-medium">{metaDescription.length}/160</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Focus Keywords</label>
                  <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. tech, design"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none"
                  />
                </div>
              </>
            )}

          </div>
        </aside>

      </div>

      {/* CRASH RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl shadow-amber-500/10 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading mb-2">Unfinished Draft Found</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-8 leading-relaxed font-medium">
              We noticed your browser closed while you were working on an unsaved article. Would you like to recover your previous session?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={recoverDraft}
                className="w-full px-5 py-3 rounded-xl font-bold bg-[var(--foreground)] text-white hover:opacity-90 shadow-md transition-all"
              >
                Resume Previous Session
              </button>
              <button 
                onClick={discardRecovery}
                className="w-full px-5 py-3 rounded-xl font-bold bg-slate-100 text-[var(--foreground)] hover:bg-slate-200 transition-colors"
              >
                Discard & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
