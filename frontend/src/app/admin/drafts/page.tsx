"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Edit3, Trash2, Clock, Play, FileText,
  AlertCircle, History, RotateCcw, X, MoreHorizontal, Check
} from 'lucide-react';

export default function AdminDraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Recovery State
  const [hasUnfinishedDraft, setHasUnfinishedDraft] = useState(false);
  
  // Revisions Modal State
  const [showRevisions, setShowRevisions] = useState<string | null>(null);
  const [selectedDraftTitle, setSelectedDraftTitle] = useState("");

  useEffect(() => {
    fetchDrafts();
    
    // Check for crash recovery
    if (typeof window !== 'undefined') {
      const backup = localStorage.getItem('draft-backup-new');
      if (backup) {
        setHasUnfinishedDraft(true);
      }
    }
  }, []);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json();
      if (data.success) {
        setDrafts(data.data);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(drafts.map(d => d.category).filter(Boolean)))];

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || draft.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft permanently?")) {
      try {
        const res = await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
        if (res.ok) fetchDrafts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePublish = async (draft: any) => {
    if (confirm("Publish this draft directly?")) {
      try {
        await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title,
            slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            content: draft.content,
            category: draft.category,
            status: "Published",
            visibility: "Public"
          }),
        });
        await fetch(`/api/drafts/${draft._id}`, { method: 'DELETE' });
        fetchDrafts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRestoreBackup = () => {
    window.location.href = '/admin/editor/new';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] flex flex-col min-h-screen">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-[var(--border)] bg-white sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">Drafts</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your unfinished content and revisions.</p>
          </div>
          <Link href="/admin/editor/new" className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all">
            <Edit3 className="w-4 h-4" /> Start New Draft
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[#FAFAFA]"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">

        {/* Recovery Banner */}
        {hasUnfinishedDraft && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Unfinished Draft Recovered</h4>
                <p className="text-xs text-amber-700">You have an unsaved session from a previous visit.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => {
                  localStorage.removeItem('draft-backup-new');
                  setHasUnfinishedDraft(false);
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleRestoreBackup}
                className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Continue Writing
              </button>
            </div>
          </div>
        )}

        {/* Drafts Table */}
        <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Draft Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Last Saved</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 bg-[var(--muted)] rounded w-3/4 mb-1"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-24"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-[var(--muted)] rounded w-32 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredDrafts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Edit3 className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No drafts found</h3>
                      <p className="text-[var(--muted-foreground)]">You have a clean slate. Time to write something new!</p>
                    </td>
                  </tr>
                ) : filteredDrafts.map((draft) => (
                  <tr key={draft._id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4 max-w-sm">
                      <Link href={`/admin/editor/${draft._id}`} className="font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate block">
                        {draft.title || "Untitled Draft"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                      {draft.category || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-[10px] font-bold">D</div>
                        <span className="text-sm font-medium text-[var(--foreground)]">Deepak</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md inline-flex">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(draft.lastSaved || draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/editor/${draft._id}`} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--muted-foreground)]" title="Continue Editing">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => {
                          setSelectedDraftTitle(draft.title || "Untitled Draft");
                          setShowRevisions(draft._id);
                        }} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-blue-500 hover:text-blue-600 transition-colors text-[var(--muted-foreground)]" title="Version History">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => handlePublish(draft)} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors text-[var(--muted-foreground)]" title="Publish Directly">
                          <Play className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(draft._id)} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-[var(--muted-foreground)]" title="Delete Draft">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Revisions Modal (Mocked for UI) */}
      {showRevisions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold font-heading">Version History</h2>
              </div>
              <button onClick={() => setShowRevisions(null)} className="p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 border-b border-[var(--border)] bg-white">
              <p className="text-sm font-bold text-[var(--foreground)]">Draft: <span className="text-[var(--muted-foreground)] font-medium">{selectedDraftTitle}</span></p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-8 pb-4">
                
                {/* Current Version */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                  <div className="bg-white border border-[var(--border)] p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Current</span>
                          <span className="text-sm font-bold text-[var(--foreground)]">Latest Auto-save</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">Today at 10:45 AM</p>
                      </div>
                      <button className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 hover:text-[var(--foreground)]">
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Previous Versions */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--muted)] border-4 border-[#FAFAFA]"></div>
                  <div className="bg-white border border-[var(--border)] p-4 rounded-xl shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-bold text-[var(--foreground)]">Manual Save</span>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">Yesterday at 4:30 PM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 hover:text-[var(--foreground)]">
                          <FileText className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--muted)] border-4 border-[#FAFAFA]"></div>
                  <div className="bg-white border border-[var(--border)] p-4 rounded-xl shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-bold text-[var(--foreground)]">Auto-save</span>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">Oct 12 at 11:20 AM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 hover:text-[var(--foreground)]">
                          <FileText className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
