import Link from 'next/link';
import { ArrowLeft, Share2, Link as LinkIcon, Bookmark } from 'lucide-react';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import ArticleActions from '@/components/ArticleActions';

export const revalidate = 0; // Disable cache for local dev

export default async function SingleArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Direct database connection for Server Components
  await connectDB();
  
  let article;
  try {
    article = await Article.findById(slug);
  } catch (e) {
    // If slug is not a valid ObjectId, it might throw
    article = null;
  }

  if (!article) {
    return notFound();
  }

  // Fallback cover image based on seeded category or generic
  const coverImage = article.coverImage || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000`;

  return (
    <div className="bg-[var(--background)] min-h-screen pb-32">
      {/* Sticky Header Actions */}
      <div className="sticky top-16 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/articles" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
          <ArticleActions title={article.title} />
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 md:pt-24">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm font-medium">
            {article.category && (
              <>
                <Link href={`/categories`} className="text-[var(--foreground)] hover:underline underline-offset-4 decoration-[var(--border)] uppercase tracking-wider text-xs">
                  {article.category}
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
            <img src={(article as any).author?.profileImage || "https://i.pravatar.cc/150"} alt="Author" className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-semibold text-[var(--foreground)]">{(article as any).author?.firstName || "Admin"} {(article as any).author?.lastName || "User"}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{(article as any).author?.bio || 'Author and Contributor'}</div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <figure className="mb-16 -mx-4 sm:mx-0">
          <img 
            src={coverImage} 
            alt={article.title} 
            className="w-full sm:rounded-2xl border sm:border-[var(--border)] object-cover aspect-[21/9]"
          />
        </figure>

        {/* Content Body */}
        {/* Using dangerouslySetInnerHTML because TipTap output is HTML. 
            In a real app, use a sanitizer like DOMPurify or parse it into components. */}
        <div 
          className="prose prose-lg prose-headings:font-heading prose-headings:tracking-tight max-w-none prose-p:leading-relaxed prose-a:text-[var(--primary)] prose-a:underline-offset-4 prose-a:decoration-[var(--primary)] hover:prose-a:decoration-[var(--secondary)] prose-img:rounded-xl text-[var(--foreground)] prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)] prose-li:text-[var(--muted-foreground)] prose-strong:text-[var(--foreground)] prose-blockquote:text-[var(--foreground)] prose-blockquote:border-l-[var(--secondary)] prose-code:text-[var(--primary)] prose-pre:bg-[#111827] prose-pre:text-white"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
