"use client";

import { Plus, TrendingUp, Users, Eye, FileText, Clock, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);

  const totalViews = published.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalPublished = published.length;
  const totalDrafts = drafts.length;
  const activeSubscribers = 0; // Placeholder until subscriber system is built

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
      }
    };

    fetchData();
  }, []);
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)]">
      {/* Top Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-[var(--border)] bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold font-heading">Overview</h1>
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

      <div className="p-8 max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat Card 1 */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Total Views</h3>
              <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-heading mb-1">{totalViews.toLocaleString()}</div>
            <div className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0% from last month
            </div>
          </div>
          
          {/* Stat Card 2 */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Published Articles</h3>
              <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-heading mb-1">{totalPublished}</div>
            <div className="text-xs font-medium text-[var(--muted-foreground)]">
              {totalDrafts} drafts pending
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Active Subscribers</h3>
              <div className="p-2 rounded-md bg-orange-50 text-[var(--secondary)]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-heading mb-1">{activeSubscribers.toLocaleString()}</div>
            <div className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0 this week
            </div>
          </div>
        </div>

        {/* Content Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Drafts Panel */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2"><Edit3 className="w-5 h-5 text-[var(--primary)]" /> Saved Drafts</h3>
            </div>
            
            {drafts.length === 0 ? (
              <div className="p-12 text-center flex-1 flex flex-col justify-center">
                <Clock className="w-8 h-8 text-[var(--border)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)] font-medium">No drafts currently saved.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)] flex-1 overflow-y-auto max-h-[400px]">
                {drafts.map((draft) => (
                  <li key={draft._id} className="p-6 hover:bg-[var(--muted)]/50 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-[var(--foreground)] text-lg mb-1">{draft.title}</h4>
                        <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> 
                          Last saved: {new Date(draft.lastSaved).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Link href={`/admin/editor/${draft._id}`} className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-semibold shadow-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        Resume Editing
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Articles Table */}
          <div className="bg-white border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
              <h3 className="font-bold font-heading text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Recent Publications</h3>
              <button className="text-sm font-semibold text-[var(--primary)] hover:underline">View All</button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {published.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[var(--muted-foreground)]">No published articles yet.</td>
                  </tr>
                ) : published.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--foreground)] truncate max-w-[200px]">{item.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">{item.category} • {new Date(item.publishedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right">
                      {item.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
