import Link from 'next/link';
import { ArrowLeft, Share2, Link as LinkIcon, Bookmark } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Disable cache for local dev

export default async function SingleArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch from the backend API
  const res = await fetch(`http://localhost:5000/api/articles/${slug}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) return notFound();
    return <div className="p-24 text-center">Failed to load article</div>;
  }

  const article = await res.json();

  return (
    <div className="bg-[var(--background)] min-h-screen pb-32">
      {/* Sticky Header Actions */}
      <div className="sticky top-16 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/articles" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
          <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
            <button className="hover:text-[var(--foreground)] transition-colors"><Share2 className="w-4 h-4" /></button>
            <button className="hover:text-[var(--foreground)] transition-colors"><LinkIcon className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <button className="hover:text-[var(--foreground)] transition-colors"><Bookmark className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 md:pt-24">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm font-medium">
            {article.category && (
              <>
                <Link href={`/categories/${article.category.slug}`} className="text-[var(--foreground)] hover:underline underline-offset-4 decoration-[var(--border)] uppercase tracking-wider text-xs">
                  {article.category.name}
                </Link>
                <span className="text-[var(--muted-foreground)]">•</span>
              </>
            )}
            <span className="text-[var(--muted-foreground)]">
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tighter text-[var(--foreground)] leading-[1.1] mb-8">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 py-6 border-y border-[var(--border)]">
            <img src={article.author?.profileImage || "https://i.pravatar.cc/150"} alt="Author" className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-semibold text-[var(--foreground)]">{article.author?.firstName} {article.author?.lastName}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{article.author?.bio || 'Author'}</div>
            </div>
            <button className="ml-auto px-4 py-1.5 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--muted)] transition-colors">
              Follow
            </button>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <figure className="mb-16 -mx-4 sm:mx-0">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full sm:rounded-2xl border sm:border-[var(--border)] object-cover aspect-[21/9]"
            />
          </figure>
        )}

        {/* Content Body */}
        {/* Using dangerouslySetInnerHTML because TipTap output is HTML. 
            In a real app, use a sanitizer like DOMPurify or parse it into components. */}
        <div 
          className="prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight max-w-none prose-p:leading-relaxed prose-a:text-[var(--foreground)] prose-a:underline-offset-4 prose-a:decoration-[var(--border)] hover:prose-a:decoration-[var(--foreground)] prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
