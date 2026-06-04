"use client";

import Link from 'next/link';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = ["All", "Engineering", "Design", "Product", "Artificial Intelligence", "Security", "Databases"];

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: { name: string };
  author: { firstName: string; lastName: string; profileImage: string };
  publishedAt: string;
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New States for Filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/articles/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: searchQuery, category: activeCategory })
        });
        const data = await res.json();
        
        // Client-side sorting based on our new filter
        let fetchedArticles = Array.isArray(data) ? data : [];
        if (sortOrder === "asc") {
          fetchedArticles = fetchedArticles.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        } else {
          fetchedArticles = fetchedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        }
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the AI search
    const timer = setTimeout(() => {
      fetchArticles();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, sortOrder]);

  return (
    <div className="bg-[var(--background)] min-h-screen pb-24">
      {/* Header Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[var(--border)]">
        <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-6">
          Explore Articles
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mb-10">
          Dive into our library of expert insights. Powered by Gemini AI, try searching naturally!
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Ask anything... (e.g. 'how to scale databases?')" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative">
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            
            {/* Filter Dropdown */}
            {isFiltersOpen && (
              <div className="absolute top-12 left-0 w-48 bg-white border border-[var(--border)] rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1">
                <span className="text-xs font-bold text-[var(--muted-foreground)] px-3 py-1 uppercase tracking-wider">Sort By</span>
                <button 
                  onClick={() => { setSortOrder("desc"); setIsFiltersOpen(false); }}
                  className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sortOrder === "desc" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--muted)] text-[var(--foreground)]"}`}
                >
                  Newest First
                </button>
                <button 
                  onClick={() => { setSortOrder("asc"); setIsFiltersOpen(false); }}
                  className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sortOrder === "asc" ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--muted)] text-[var(--foreground)]"}`}
                >
                  Oldest First
                </button>
              </div>
            )}

            <div className="h-6 w-px bg-[var(--border)] mx-1 hidden md:block"></div>
            
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${cat === activeCategory ? 'bg-[var(--foreground)] text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)] bg-transparent hover:bg-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[var(--muted-foreground)]">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-[var(--primary)]" />
            <p className="text-lg font-medium">Gemini is searching the catalog...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/30">
            <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-2">No articles found</h3>
            <p className="text-[var(--muted-foreground)]">Try adjusting your semantic search query or category filter.</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-6 px-6 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-semibold hover:bg-[var(--muted)] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link href={`/articles/${article.slug}`} key={article.id} className="group flex flex-col bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-50 transition-all hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden relative bg-[var(--muted)]">
                  <img 
                    src={article.coverImage || "https://images.unsplash.com/photo-1618401471353-b98a5233c591?auto=format&fit=crop&q=80"} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-[var(--primary)] shadow-sm">
                      {article.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight mb-3">
                    {article.title}
                  </h3>
                  
                  <p className="text-[var(--muted-foreground)] line-clamp-2 mb-6 flex-grow">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                    <img src={article.author?.profileImage || "https://i.pravatar.cc/150"} alt={article.author?.firstName} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{article.author?.firstName} {article.author?.lastName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>}>
      <ArticlesContent />
    </Suspense>
  );
}
