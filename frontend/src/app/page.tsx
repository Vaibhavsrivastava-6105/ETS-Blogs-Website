"use client";

import { useState, useEffect } from 'react';
import { Search, ArrowRight, TrendingUp, Sparkles, Loader2, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecentArticles(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (queryToSearch: string = searchQuery) => {
    if (!queryToSearch.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchQuery(queryToSearch); // Ensure input matches if triggered by trending tag
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setSearchError(data.error || 'Failed to search');
        setSearchResults([]);
      } else {
        setSearchResults(data.data);
      }
    } catch (error) {
      setSearchError('Network error occurred while searching.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* HERO SECTION (SPLIT LAYOUT) */}
      <section 
        className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[var(--border)] bg-[#FCFCFA]"
        style={{ 
          backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: HERO TEXT */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 text-left"
          >
            <div className="inline-flex items-center gap-4 py-2 text-[var(--secondary)] text-xs font-bold uppercase tracking-[0.3em] mb-6">
              <span className="w-8 h-[2px] bg-[var(--secondary)]"></span> EXCELTECHSOLUTION PREMIER BLOG
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-black font-sans text-[var(--foreground)] tracking-tighter mb-4 leading-[0.85]">
              ExcelTech<br/>Solution <br /> 
              Blogs.
            </h1>
            
            <h2 className="text-2xl md:text-3xl text-[var(--foreground)] mb-10 max-w-xl leading-tight font-serif">
              “Explore deep dives, practical <span className="italic text-[var(--secondary)] font-bold">guides</span>, and thoughtful perspectives”
            </h2>
            
            {/* Search Bar */}
            <div className="w-full relative group shadow-sm bg-white border border-[var(--border)]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-4 py-4 border-2 border-transparent focus:border-[var(--primary)] leading-5 bg-white text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-0 text-base transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
                placeholder="Search articles with AI..." 
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button 
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-[var(--primary)] hover:bg-blue-800 text-white px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all shadow-md disabled:opacity-70 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Trending Searches */}
            <div className="mt-6 flex flex-wrap justify-start items-center gap-2 text-xs">
              <span className="text-[var(--muted-foreground)] font-bold uppercase tracking-widest text-[10px]">Trending:</span>
              {['React', 'AI Agents', 'Stripe UI', 'Tailwind'].map((term) => (
                <button 
                  key={term} 
                  onClick={() => handleSearch(term)}
                  className="px-2 py-1 bg-white border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: BLOGS BESIDE IT */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">
                Latest Publications
              </h3>
              <Link href="/articles" className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] hover:underline">
                View All
              </Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {recentArticles.slice(0, 3).map((article) => (
                <Link href={`/articles/${article._id}`} key={article._id} className="group flex items-start gap-5 p-5 bg-white border border-[var(--border)] rounded-xl hover:shadow-xl transition-all shadow-sm">
                  <div className="w-28 h-28 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 border border-[var(--border)] rounded-lg overflow-hidden relative">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--primary)] font-black text-4xl opacity-20">
                        {article.title?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-1">
                    <div className="text-xs font-black tracking-widest uppercase text-[var(--secondary)] mb-2">
                      {article.category}
                    </div>
                    <h4 className="text-xl font-black font-sans uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors leading-tight mb-3 text-[var(--foreground)] line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></span>
                      <span>5 min read</span>
                    </div>
                  </div>
                </Link>
              ))}
              
              {recentArticles.length === 0 && (
                 <div className="p-8 text-center border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-widest font-bold">
                   No articles published yet.
                 </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* EDITOR'S PICKS SECTION */}
      {!isSearching && searchResults === null && recentArticles.length > 3 && (
        <section className="py-16 md:py-20 bg-white border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10 border-b border-[var(--border)] pb-4">
              <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight">Editor's Picks</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentArticles.slice(3, 5).map((article) => (
                <Link href={`/articles/${article._id}`} key={article._id} className="group flex flex-col bg-[#FCFCFA] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-xl transition-all">
                  {article.coverImage && (
                    <div className="w-full h-56 overflow-hidden border-b border-[var(--border)]">
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)]">{article.category}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black font-heading group-hover:text-[var(--primary)] transition-colors leading-[1.2] text-[var(--foreground)] mb-4">
                      {article.title}
                    </h3>
                    <div 
                      className="text-[var(--muted-foreground)] line-clamp-3 mb-6" 
                      dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200) + '...' }}
                    />
                    <div className="mt-auto flex items-center gap-2 text-sm text-[var(--muted-foreground)] pt-6 border-t border-[var(--border)]/50 font-medium uppercase tracking-widest">
                      <FileText className="w-4 h-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL OTHER ARTICLES SECTION */}
      {!isSearching && searchResults === null && recentArticles.length > 5 && (
        <section className="py-16 md:py-24 bg-[#FAFAFA] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10 border-b border-[var(--border)] pb-4">
              <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight">Other Articles</h2>
              <Link href="/articles" className="text-[var(--primary)] font-bold hover:underline text-xs uppercase tracking-widest">
                View Catalog
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArticles.slice(5).map((article) => (
                <Link href={`/articles/${article._id}`} key={article._id} className="group flex flex-col bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--secondary)]">{article.category}</span>
                    </div>
                    <h3 className="text-xl font-bold font-sans uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors leading-[1.2] text-[var(--foreground)] mb-4 line-clamp-2">
                      {article.title}
                    </h3>
                    <div 
                      className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-6" 
                      dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }}
                    />
                    <div className="mt-auto flex items-center gap-2 text-[10px] text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]/50 uppercase tracking-widest font-bold">
                      <FileText className="w-3 h-3" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED CONTENT OR SEARCH RESULTS */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[var(--primary)]" />
              <p className="text-xl font-medium">Gemini AI is analyzing articles...</p>
            </div>
          )}

          {!isSearching && searchError && (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="w-10 h-10 mb-4" />
              <p className="text-xl font-medium">{searchError}</p>
            </div>
          )}

          {!isSearching && !searchError && searchResults !== null && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-2">No relevant articles found</h3>
              <p>Try searching for different keywords or concepts.</p>
            </div>
          )}

          {!isSearching && !searchError && searchResults !== null && searchResults.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-10 border-b border-[var(--border)] pb-4">
                <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight">AI Search Results</h2>
                <button onClick={() => setSearchResults(null)} className="text-[var(--primary)] font-medium hover:opacity-80 transition-opacity">
                  Clear Search
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((article) => (
                  <Link href={`/articles`} key={article._id} className="group flex flex-col bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)]">{article.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold font-heading group-hover:text-[var(--primary)] transition-colors leading-[1.2] text-[var(--foreground)] mb-4">
                        {article.title}
                      </h3>
                      <div 
                        className="text-[var(--muted-foreground)] line-clamp-3 mb-6" 
                        dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200) + '...' }}
                      />
                      <div className="mt-auto flex items-center gap-2 text-sm text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]/50">
                        <FileText className="w-4 h-4" />
                        <span>Published {new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}


        </div>
      </section>
    </div>
  );
}
