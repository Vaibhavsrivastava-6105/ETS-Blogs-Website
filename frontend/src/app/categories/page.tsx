"use client";

import Link from 'next/link';
import { ArrowRight, Code, Shield, Brain, Paintbrush, Database, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const CATEGORY_DEFINITIONS = [
  {
    name: "Engineering",
    slug: "engineering",
    description: "Deep dives into software architecture, system design, and modern frontend frameworks.",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Exploring autonomous agents, LLMs, and the future of human-computer interaction.",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Security",
    slug: "security",
    description: "Modern enterprise security, zero trust architectures, and compliance strategies.",
    icon: Shield,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    name: "Design",
    slug: "design",
    description: "Product design philosophies, UI/UX case studies, and user psychology.",
    icon: Paintbrush,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    name: "Databases",
    slug: "databases",
    description: "Scaling distributed systems, query optimization, and data infrastructure.",
    icon: Database,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>(CATEGORY_DEFINITIONS.map(c => ({...c, articles: []})));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const grouped = CATEGORY_DEFINITIONS.map(cat => ({
            ...cat,
            articles: data.data.filter((a: any) => a.category?.toLowerCase() === cat.name.toLowerCase() || a.category === cat.name)
          }));
          setCategories(grouped);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <div className="bg-[var(--background)] min-h-screen pb-32">
      {/* Header Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[var(--border)] bg-[#FAFAFA]">
        <h1 className="text-5xl md:text-7xl font-bold font-heading text-[var(--foreground)] tracking-tighter mb-6 leading-tight">
          Topics & <span className="text-[var(--primary)]">Categories</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
          Navigate our comprehensive library by topic. Find exact insights on the subjects that matter to you.
        </p>
      </section>

      {/* Category Navigation Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[var(--border)]">
        {isLoading && (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.slug} className="group p-8 rounded-2xl border border-[var(--border)] bg-white hover:border-[var(--primary)] hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${category.bgColor} ${category.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-3">{category.name}</h2>
                <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">{category.articles.length} Articles</span>
                  <a href={`#${category.slug}`} className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categorized Articles Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="space-y-32">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.slug} id={category.slug} className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[var(--border)]">
                  <div className={`p-3 rounded-xl ${category.bgColor} ${category.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight">{category.name}</h3>
                  <Link href={`/categories/${category.slug}`} className="ml-auto text-sm font-bold text-[var(--primary)] hover:underline">
                    View All {category.name} →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.articles.map((article: any) => (
                    <Link href={`/articles/${article._id}`} key={article._id} className="group block">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--muted)] border border-[var(--border)] mb-4">
                        {article.coverImage ? (
                          <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs group-hover:scale-105 transition-transform duration-500">{category.name}</div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                      <h4 className="text-lg font-bold font-heading leading-snug group-hover:text-[var(--primary)] transition-colors text-[var(--foreground)]">
                        {article.title}
                      </h4>
                    </Link>
                  ))}
                  
                  {/* Empty state filler if less than 4 articles */}
                  {category.articles.length < 4 && Array.from({ length: 4 - category.articles.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="hidden lg:flex flex-col items-center justify-center p-6 border border-dashed border-[var(--border)] rounded-xl bg-[var(--muted)]/50">
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">More coming soon</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
