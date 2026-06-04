"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Settings, Image as ImageIcon, X, UploadCloud, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { EditorToolbar } from '@/components/editor/EditorToolbar';

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [category, setCategory] = useState("Software Design");
  const [tags, setTags] = useState("");
  const router = useRouter();
  const params = useParams();
  const initialId = params?.id as string;
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Press '/' for commands, or start typing...",
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
    }
  });

  // Load draft if initialId is provided
  useEffect(() => {
    if (initialId && initialId !== 'new') {
      setDraftId(initialId);
      fetch(`/api/drafts/${initialId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setTitle(data.data.title || '');
            if (editor && data.data.content && !editor.getText()) {
              editor.commands.setContent(data.data.content);
            }
          }
        })
        .catch(err => console.error("Failed to load draft:", err));
    }
  }, [initialId, editor]);

  // Auto-save logic simulation
  const handleAutoSave = useCallback(async () => {
    if (saveStatus !== "unsaved" || !editor) return;
    
    setSaveStatus("saving");
    
    try {
      const htmlContent = editor.getHTML();
      
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId, // Will be null on first save, triggering creation
          title: title || "Untitled Draft",
          content: htmlContent
        }),
      });

      const data = await res.json();
      
      if (data.success && data.data._id) {
        setDraftId(data.data._id); // Update with real MongoDB _id
      }
      
      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save failed", error);
    }
  }, [saveStatus, editor, title, draftId]);

  const handlePublish = async () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || "Untitled Article",
          content: htmlContent,
          category: category,
          tags: tags,
        }),
      });

      if (res.ok && draftId) {
        // Delete the draft since it is now published
        await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' });
      }

      router.push("/admin");
    } catch (error) {
      console.error("Publish failed", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoSave();
    }, 5000); // Auto save every 5 seconds for demo
    
    return () => clearInterval(timer);
  }, [handleAutoSave]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Editor Top Bar */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[var(--border)] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" /> 
                Saved to Drafts • {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDraftModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            onClick={() => setShowPublishModal(true)}
            className="bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            Publish
          </button>
        </div>
      </header>

      {/* Editor Toolbar (Pinned) */}
      <EditorToolbar editor={editor} />

      {/* Editor Canvas Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-50/50 via-slate-50 to-emerald-50/50 pb-32 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          
          {/* The "Paper" Document */}
          <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 rounded-3xl p-8 sm:p-16 min-h-[800px] transition-all">
            
            {/* Title Input */}
            <textarea
              ref={titleRef}
              rows={1}
              placeholder="Article Title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveStatus("unsaved");
                // Auto-resize logic
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  editor?.commands.focus();
                }
              }}
              className="w-full text-4xl sm:text-5xl font-black font-heading tracking-tight text-[var(--foreground)] placeholder-[var(--muted-foreground)] border-none focus:outline-none focus:ring-0 mb-12 bg-transparent resize-none overflow-hidden"
            />

            {/* TipTap Editor */}
            <div className="min-h-[500px] prose prose-lg max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </main>

      {/* PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl shadow-emerald-500/10 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-indigo-500 flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading text-white">Publish Article</h2>
              <button onClick={() => setShowPublishModal(false)} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-bold mb-2">Cover Photo</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option>Software Design</option>
                  <option>Web Development</option>
                  <option>Tutorials</option>
                  <option>Tech News</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold mb-2">Tags</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Next.js, React, Tailwind (comma separated)"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2 rounded-lg font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-indigo-500 text-white hover:opacity-90 shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE DRAFT MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center text-slate-900">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading mb-2">Save to Drafts?</h2>
            <p className="text-sm text-slate-500 mb-8">
              Are you sure you want to manually save your current progress to your drafts?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDraftModal(false)}
                className="px-5 py-2.5 w-full rounded-xl font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleAutoSave();
                  setShowDraftModal(false);
                }}
                className="px-5 py-2.5 w-full rounded-xl font-bold bg-slate-900 text-white hover:opacity-90 transition-opacity"
              >
                Yes, Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
