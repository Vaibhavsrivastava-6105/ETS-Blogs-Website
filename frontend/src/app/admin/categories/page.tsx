"use client";

import { useState } from 'react';
import { 
  Folder, Plus, Search, Edit3, Trash2, Eye, 
  AlertTriangle, UploadCloud, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Software Design', slug: 'software-design', description: 'Architecture, patterns, and best practices for building robust software.', count: 12, views: 15400, status: 'Active' },
    { id: '2', name: 'Web Development', slug: 'web-development', description: 'Frontend and backend development for the modern web.', count: 8, views: 9200, status: 'Active' },
    { id: '3', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides on various technologies.', count: 24, views: 32100, status: 'Active' },
    { id: '4', name: 'Tech News', slug: 'tech-news', description: 'Latest updates from the tech world.', count: 5, views: 4300, status: 'Active' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('');
  
  // Delete State
  const [reassignTo, setReassignTo] = useState('');

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    const newCat = {
      id: Date.now().toString(),
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDesc,
      count: 0,
      views: 0,
      status: 'Active'
    };
    setCategories([newCat, ...categories]);
    // Reset form
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormIcon('');
  };

  const handleDelete = () => {
    if (!showDeleteModal) return;
    setCategories(categories.filter(c => c.id !== showDeleteModal));
    setShowDeleteModal(null);
    setReassignTo('');
  };

  const categoryToDelete = categories.find(c => c.id === showDeleteModal);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col min-h-screen">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-[var(--border)] bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">Categories and Filters</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Add new categories and organize your content.</p>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT HALF: Add Category Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm p-6 sticky top-28">
            <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-[var(--foreground)]">Add New Category</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Create a new topic for your articles</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5">Category Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formSlug) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5">URL Slug</label>
                <input 
                  type="text" 
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. artificial-intelligence"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5">Description</label>
                <textarea 
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description of the category..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none transition-shadow"
                />
              </div>

              <button 
                type="submit" 
                disabled={!formName} 
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
              >
                <Plus className="w-4 h-4" /> Save Category
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT HALF: Categories List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* List Header & Search */}
            <div className="p-6 border-b border-[var(--border)] bg-[#FAFAFA] flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold font-heading text-[var(--foreground)] flex items-center gap-2">
                <Folder className="w-5 h-5 text-[var(--muted-foreground)]" /> Existing Categories
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input 
                  type="text" 
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Articles</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <Folder className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No categories found</h3>
                        <p className="text-[var(--muted-foreground)] text-sm">Create your first category using the form on the left.</p>
                      </td>
                    </tr>
                  ) : filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAFAFA] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--foreground)]">{cat.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">/{cat.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {cat.count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/articles?category=${cat.name}`} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--muted-foreground)]" title="View Articles">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setShowDeleteModal(cat.id)} className="p-2 bg-white border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-[var(--muted-foreground)]" title="Delete Category">
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
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-heading mb-2 text-[var(--foreground)]">Delete Category?</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                You are about to delete the <strong className="text-[var(--foreground)]">"{categoryToDelete.name}"</strong> category. It currently contains <strong className="text-[var(--foreground)]">{categoryToDelete.count} articles</strong>.
              </p>

              {/* Re-assignment select */}
              <div className="text-left bg-slate-50 p-4 rounded-xl border border-[var(--border)] mb-6">
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Reassign existing articles to:</label>
                <select 
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Uncategorized">Uncategorized</option>
                  {categories.filter(c => c.id !== categoryToDelete.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-[var(--foreground)] hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-md transition-all">
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
