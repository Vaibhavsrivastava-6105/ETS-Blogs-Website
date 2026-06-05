"use client";

import Link from 'next/link';
import { Search, Loader2, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = ["All", "Software Design", "Web Development", "Tutorials", "Tech News"];

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: { firstName: string; lastName: string; profileImage: string };
  publishedAt: string;
}

import { Suspense } from 'react';

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>}>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New States for Filters
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, category: activeCategory })
        });
        const data = await res.json();
        
        // Client-side sorting based on our new filter
        let fetchedArticles = Array.isArray(data.data) ? data.data : [];
        if (sortOrder === "asc") {
          fetchedArticles = fetchedArticles.sort((a: any, b: any) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        } else {
          fetchedArticles = fetchedArticles.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        }
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      fetchArticles();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, sortOrder]);

  return (
    <div className="bg-[var(--background)] min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* LEFT SIDEBAR: Hero, Search, Filters & Categories */}
        <aside className="lg:w-80 flex-shrink-0 flex flex-col gap-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--foreground)] tracking-tight mb-4 leading-tight">
              Explore<br />Articles
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              Dive into our library of expert insights and tutorials.
            </p>
          </div>

          <div className="flex flex-col gap-8 bg-white border border-[var(--border)] p-6 rounded-2xl shadow-sm sticky top-28">
            
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Search</label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input 
                  type="text" 
                  placeholder="Keywords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-[#FAFAFA] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Sort By</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm appearance-none cursor-pointer"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Categories Menu */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Categories</label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-between group
                      ${activeCategory === category 
                        ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' 
                        : 'text-[var(--muted-foreground)] hover:bg-[#FAFAFA] hover:text-[var(--foreground)]'
                      }`}
                  >
                    {category}
                    {activeCategory === category && <ArrowRight className="w-4 h-4 opacity-70" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT CONTENT AREA: Dynamic Header & Articles Grid */}
        <main className="flex-1 flex flex-col min-h-screen">
          
          {/* Top Dynamic Header */}
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[var(--border)]">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="ETS Logo" className="w-full h-full object-contain scale-[1.3]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-heading text-[var(--foreground)] tracking-tight">
              {activeCategory === "All" ? "All Categories" : activeCategory}
            </h2>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {articles.map((article: any) => (
                <Link href={`/articles/${article._id}`} key={article._id} className="group flex flex-col bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  
                  {/* Image Container */}
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative border-b border-[var(--border)]">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                        <span className="text-[var(--muted-foreground)] font-serif italic">No image available</span>
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[var(--foreground)] shadow-sm">
                        {article.category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold font-heading text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight">
                      {article.title}
                    </h2>
                    
                    <p className="text-[var(--muted-foreground)] text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                      {article.excerpt || "Read more about this topic inside the article."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden border border-[var(--border)] shrink-0">
                          {article.author?.profileImage ? (
                            <img src={article.author.profileImage} alt={article.author.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--foreground)]">
                            {article.author?.firstName || 'Admin'} {article.author?.lastName || ''}
                          </span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-[var(--border)] rounded-3xl bg-[#FAFAFA]">
              <Search className="w-12 h-12 text-[var(--muted-foreground)] mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2 font-heading">No articles found</h3>
              <p className="text-[var(--muted-foreground)]">Try adjusting your filters or search query.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
