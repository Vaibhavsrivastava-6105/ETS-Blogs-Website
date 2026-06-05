"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, MoreHorizontal, Edit3, Eye, Copy, 
  Archive, Trash2, ChevronLeft, ChevronRight, CheckSquare, Square,
  ArrowUpDown, Folder, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derived filters
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || article.status === statusFilter || (statusFilter === 'Published' && !article.status);
    const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const currentArticles = sortedArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedArticles.length === currentArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(currentArticles.map(a => a._id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(selectedArticles.filter(item => item !== id));
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to move this article to trash?")) {
      try {
        const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
        if (res.ok) fetchArticles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDuplicate = async (article: any) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${article.title} (Copy)`,
          content: article.content,
          category: article.category,
          tags: article.tags,
          status: 'Draft'
        }),
      });
      if (res.ok) fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedArticles.length === 0) return;
    try {
      for (const id of selectedArticles) {
        await fetch(`/api/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      setSelectedArticles([]);
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
      for (const id of selectedArticles) {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      }
      setSelectedArticles([]);
      fetchArticles();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-8 py-6 border-b border-[var(--border)] bg-white sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">Articles</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage, edit, and organize all your published and scheduled content.</p>
          </div>
          <Link href="/admin/editor/new" className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> New Article
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[#FAFAFA]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Filters */}
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>

            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium bg-white hover:bg-[#FAFAFA] text-[var(--foreground)] whitespace-nowrap shrink-0">
              <ArrowUpDown className="w-4 h-4" /> Sort By {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        
        {/* Bulk Actions Banner */}
        {selectedArticles.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between mb-6 shadow-sm animate-in fade-in slide-in-from-top-4">
            <span className="text-sm font-bold text-blue-800">
              {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkUpdateStatus('Published')} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Bulk Publish</button>
              <button onClick={() => handleBulkUpdateStatus('Archived')} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Archive</button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm transition-colors flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[var(--border)]">
                  <th className="px-6 py-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      {selectedArticles.length === currentArticles.length && currentArticles.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Views</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="w-5 h-5 bg-[var(--muted)] rounded mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-5 bg-[var(--muted)] rounded w-3/4 mb-1"></div><div className="h-3 bg-[var(--muted)] rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-[var(--muted)] rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-[var(--muted)] rounded-full"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-[var(--muted)] rounded w-8 ml-auto"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-[var(--muted)] rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-[var(--muted)] rounded-full mx-auto"></div></td>
                    </tr>
                  ))
                ) : currentArticles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <FileText className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No articles found</h3>
                      <p className="text-[var(--muted-foreground)]">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                ) : currentArticles.map((article) => (
                  <tr key={article._id} className={`hover:bg-[#FAFAFA] transition-colors ${selectedArticles.includes(article._id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleSelect(article._id)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        {selectedArticles.includes(article._id) ? (
                          <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <Link href={`/admin/editor/${article._id}`} className="font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate block">
                        {article.title}
                      </Link>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1 truncate">/{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-[10px] font-bold">D</div>
                        <span className="text-sm font-medium text-[var(--foreground)]">Deepak</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        <Folder className="w-3 h-3" /> {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        article.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        article.status === 'Archived' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {article.status || "Published"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-[var(--foreground)]">
                      {article.views?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] text-right whitespace-nowrap">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center relative action-menu-container">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === article._id ? null : article._id);
                        }}
                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {/* Action Menu Dropdown (Click) */}
                      {openMenuId === article._id && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 bg-white border border-[var(--border)] rounded-xl shadow-xl transition-all z-10 py-1">
                          <Link href={`/admin/editor/${article._id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-[#FAFAFA] text-[var(--foreground)]">
                          <Edit3 className="w-4 h-4 text-[var(--muted-foreground)]" /> Edit Article
                        </Link>
                        <Link href={`/articles/${article._id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-[#FAFAFA] text-[var(--foreground)]">
                          <Eye className="w-4 h-4 text-[var(--muted-foreground)]" /> Preview
                        </Link>
                        <button onClick={() => handleDuplicate(article)} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-[#FAFAFA] text-[var(--foreground)]">
                          <Copy className="w-4 h-4 text-[var(--muted-foreground)]" /> Duplicate
                        </button>
                        <button onClick={() => handleUpdateStatus(article._id, 'Archived')} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-[#FAFAFA] text-[var(--foreground)]">
                          <Archive className="w-4 h-4 text-[var(--muted-foreground)]" /> Archive
                        </button>
                        <div className="h-px bg-[var(--border)] my-1"></div>
                        <button onClick={() => handleDelete(article._id)} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && filteredArticles.length > 0 && (
            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between bg-[#FAFAFA]">
              <div className="text-sm font-medium text-[var(--muted-foreground)]">
                Showing <span className="text-[var(--foreground)] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[var(--foreground)] font-bold">{Math.min(currentPage * itemsPerPage, filteredArticles.length)}</span> of <span className="text-[var(--foreground)] font-bold">{filteredArticles.length}</span> articles
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)] transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 border rounded-lg text-sm font-bold transition-colors shadow-sm ${
                      currentPage === i + 1 
                      ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]' 
                      : 'bg-white border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)] transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
