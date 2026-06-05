"use client";

import { Plus, TrendingUp, Users, Eye, FileText, Clock, Edit3, Folder, UploadCloud, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalViews = published.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalPublished = published.length;
  const totalDrafts = drafts.length;
  const activeSubscribers = 124; // Mocked until subscriber system is built

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [draftsRes, articlesRes] = await Promise.all([
          fetch('/api/drafts'),
          fetch('/api/articles')
        ]);
        
        const draftsData = await draftsRes.json();
        const articlesData = await articlesRes.json();
        
        if (draftsData.success) setDrafts(draftsData.data);
        if (articlesData.success) setPublished(articlesData.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)]">
      {/* Top Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-[var(--border)] bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold font-heading">Dashboard Overview</h1>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-bold text-[var(--foreground)]">Admin:</span>
            <span className="text-[var(--muted-foreground)] font-medium">Deepak</span>
          </div>
          <Link href="/admin/editor/new" className="flex items-center gap-2 bg-[var(--foreground)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Write Article
          </Link>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Quick Actions Panel */}
        <section className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-lg font-bold font-heading mb-1 text-[var(--foreground)]">Quick Actions</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Jump straight into managing your content.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link href="/admin/editor/new" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Write Article
            </Link>
            <Link href="/admin/categories" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-semibold hover:bg-[var(--muted)] transition-all shadow-sm">
              <Folder className="w-4 h-4" /> Create Category
            </Link>
            <Link href="/admin/media" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-semibold hover:bg-[var(--muted)] transition-all shadow-sm">
              <UploadCloud className="w-4 h-4" /> Upload Media
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <Link href="/admin/settings" className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[var(--primary)] transition-all group block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">Total Views</h3>
              <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? <div className="h-9 bg-[var(--muted)] animate-pulse rounded mb-1 w-24"></div> : <div className="text-3xl font-bold font-heading mb-1">{totalViews.toLocaleString()}</div>}
            <div className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from last month
            </div>
          </Link>
          
          {/* Stat Card 2 */}
          <Link href="/admin/articles" className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all group block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] group-hover:text-blue-600 transition-colors">Published Articles</h3>
              <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? <div className="h-9 bg-[var(--muted)] animate-pulse rounded mb-1 w-16"></div> : <div className="text-3xl font-bold font-heading mb-1">{totalPublished}</div>}
            <div className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
              All active content
            </div>
          </Link>

          {/* Stat Card 3 */}
          <Link href="/admin/drafts" className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-amber-500 transition-all group block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] group-hover:text-amber-600 transition-colors">Draft Articles</h3>
              <div className="p-2 rounded-md bg-amber-50 text-amber-600">
                <Edit3 className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? <div className="h-9 bg-[var(--muted)] animate-pulse rounded mb-1 w-16"></div> : <div className="text-3xl font-bold font-heading mb-1">{totalDrafts}</div>}
            <div className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
              Pending completion
            </div>
          </Link>

          {/* Stat Card 4 */}
          <Link href="/admin/settings" className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-orange-500 transition-all group block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] group-hover:text-orange-600 transition-colors">Subscribers</h3>
              <div className="p-2 rounded-md bg-orange-50 text-orange-500">
                <Users className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? <div className="h-9 bg-[var(--muted)] animate-pulse rounded mb-1 w-24"></div> : <div className="text-3xl font-bold font-heading mb-1">{activeSubscribers.toLocaleString()}</div>}
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5 this week
            </div>
          </Link>
        </div>

        {/* Content Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Articles Table */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Recent Publications</h3>
              <Link href="/admin/articles" className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#FAFAFA] text-[var(--muted-foreground)] text-xs uppercase tracking-wider border-b border-[var(--border)]">
                    <th className="px-6 py-3 font-semibold">Title</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-[var(--muted)] rounded w-3/4 mb-2"></div><div className="h-3 bg-[var(--muted)] rounded w-1/2"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-[var(--muted)] rounded-full"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-8 bg-[var(--muted)] rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : published.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[var(--muted-foreground)]">No published articles yet.</td>
                    </tr>
                  ) : published.slice(0, 5).map((item) => (
                    <tr key={item._id} className="hover:bg-[#FAFAFA] transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/editor/${item._id}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[var(--foreground)] truncate max-w-[250px]">{item.title}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">{item.category} • {new Date(item.publishedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.status || "Published"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-[var(--muted-foreground)]">
                        {item.views || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drafts Panel */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-500" /> Saved Drafts</h3>
              <Link href="/admin/drafts" className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[350px]">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4 items-center">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                        <div className="h-3 bg-[var(--muted)] rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-24 bg-[var(--muted)] rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : drafts.length === 0 ? (
                <div className="p-12 text-center flex-1 flex flex-col justify-center">
                  <Clock className="w-8 h-8 text-[var(--border)] mx-auto mb-3" />
                  <p className="text-[var(--muted-foreground)] font-medium">No drafts currently saved.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {drafts.slice(0, 5).map((draft) => (
                    <li key={draft._id} className="p-6 hover:bg-[#FAFAFA] transition-colors group">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-[var(--foreground)] text-base mb-1 truncate">{draft.title || "Untitled Draft"}</h4>
                          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> 
                            Last saved: {new Date(draft.lastSaved).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <Link href={`/admin/editor/${draft._id}`} className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-xs font-bold shadow-sm hover:border-amber-500 hover:text-amber-600 transition-colors shrink-0">
                          Continue
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
