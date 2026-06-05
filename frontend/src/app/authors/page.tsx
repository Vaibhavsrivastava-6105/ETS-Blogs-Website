"use client";

import { MessageCircle, Briefcase, Code, ArrowRight, BookOpen, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AuthorsPage() {
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const uniqueAuthorsMap = new Map();
          data.data.forEach((article: any) => {
            if (article.author && article.author.firstName) {
               const authorId = article.author._id || (article.author.firstName + article.author.lastName);
               if (!uniqueAuthorsMap.has(authorId)) {
                  uniqueAuthorsMap.set(authorId, {
                     id: authorId,
                     name: `${article.author.firstName} ${article.author.lastName}`,
                     role: article.author.role || "Writer",
                     image: article.author.profileImage || "https://i.pravatar.cc/150",
                     bio: article.author.bio || "Author and contributor to our publication.",
                     expertise: article.author.expertise || ["Technology"],
                     social: article.author.social || {},
                     articleCount: 1,
                  });
               } else {
                  const existing = uniqueAuthorsMap.get(authorId);
                  existing.articleCount += 1;
               }
            }
          });
          setAuthors(Array.from(uniqueAuthorsMap.values()));
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
          Meet Our <span className="text-[var(--primary)]">Writers</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
          The brightest minds in tech, design, and engineering sharing their unvarnished insights and architectural deep-dives.
        </p>
      </section>

      {/* Authors Grid */}
      <section className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
        ) : authors.length === 0 ? (
           <div className="text-center py-20 text-[var(--muted-foreground)] border border-[var(--border)] border-dashed rounded-2xl">No authors found in the database.</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {authors.map((author) => (
            <div key={author.id} className="group flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-white hover:border-[var(--primary)] hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all">
              
              {/* Avatar Column */}
              <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
                <img 
                  src={author.image} 
                  alt={author.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-sm mb-4"
                />
                <div className="flex items-center justify-center gap-3 w-full sm:justify-start">
                  {author.social.twitter && (
                    <a href={author.social.twitter} className="text-[var(--muted-foreground)] hover:text-[#1DA1F2] transition-colors"><MessageCircle className="w-5 h-5" /></a>
                  )}
                  {author.social.github && (
                    <a href={author.social.github} className="text-[var(--muted-foreground)] hover:text-black transition-colors"><Code className="w-5 h-5" /></a>
                  )}
                  {author.social.linkedin && (
                    <a href={author.social.linkedin} className="text-[var(--muted-foreground)] hover:text-[#0A66C2] transition-colors"><Briefcase className="w-5 h-5" /></a>
                  )}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex flex-col flex-grow text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h2 className="text-2xl font-bold font-heading text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {author.name}
                  </h2>
                  <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)] border border-[var(--border)] w-fit mx-auto sm:mx-0">
                    <BookOpen className="w-3.5 h-3.5" /> {author.articleCount} Articles
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
                  {author.role}
                </h3>
                
                <p className="text-[var(--muted-foreground)] leading-relaxed mb-6 flex-grow">
                  {author.bio}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-3">Focus Areas</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {author.expertise.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-[#FAFAFA] border border-[var(--border)] rounded-full text-xs font-semibold text-[var(--secondary)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Profile Action Buttons */}
                <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Link href={`/articles?q=${encodeURIComponent(author.name)}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white hover:opacity-90 rounded-lg text-sm font-semibold transition-opacity shadow-sm">
                    <BookOpen className="w-4 h-4" /> Read Articles
                  </Link>
                  {author.social.linkedin && (
                    <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-lg text-sm font-semibold transition-colors">
                      <Briefcase className="w-4 h-4" /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
        )}
      </section>
      
      {/* CTA */}
      <section className="mt-32 border-t border-[var(--border)] bg-[#FAFAFA] py-24 px-4 sm:px-6 lg:px-8 text-center">
        {!isApplying && !isSubmitted && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-6">
              Want to write for us?
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] mb-10">
              We are always looking for deep, technical insights from practicing engineers and designers. Pitch us your draft today.
            </p>
            <button 
              onClick={() => setIsApplying(true)} 
              className="bg-[var(--foreground)] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Apply as an Author
            </button>
          </div>
        )}

        {isApplying && !isSubmitted && (
          <div className="max-w-2xl mx-auto text-left bg-white p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-2">Author Application</h2>
            <p className="text-[var(--muted-foreground)] mb-8">Fill out the details below to pitch your expertise to our editorial team.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">LinkedIn Profile URL</label>
                <input type="text" required placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-3 bg-[#FAFAFA] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Statement of Purpose (SOP)</label>
                <textarea required rows={4} placeholder="Tell us briefly about what topics you want to write about and why..." className="w-full px-4 py-3 bg-[#FAFAFA] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Resume / CV</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border)] border-dashed rounded-xl bg-[#FAFAFA] hover:bg-gray-50 transition-colors relative group">
                  <div className="space-y-1 text-center">
                    <UploadCloud className={`mx-auto h-12 w-12 transition-colors ${fileName ? 'text-green-500' : 'text-[var(--muted-foreground)] group-hover:text-[var(--primary)]'}`} />
                    <div className="flex justify-center text-sm text-[var(--muted-foreground)] mt-4">
                      {fileName ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">{fileName} attached</span>
                          <button type="button" onClick={() => setFileName("")} className="text-green-900 hover:underline text-xs ml-2">Remove</button>
                        </div>
                      ) : (
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--primary)] hover:text-indigo-500 px-3 py-1.5 border border-[var(--border)] shadow-sm transition-colors">
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setFileName(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {!fileName && <p className="text-xs text-[var(--muted-foreground)] mt-3">PDF or DOCX up to 10MB</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsApplying(false)} className="px-6 py-3 border border-[var(--border)] rounded-xl font-bold text-[var(--foreground)] hover:bg-[#FAFAFA] transition-colors w-full">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl font-bold transition-all w-full shadow-md">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {isSubmitted && (
          <div className="max-w-md mx-auto text-center py-12 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-4">Application Received!</h2>
            <p className="text-[var(--muted-foreground)] mb-8">
              Thank you for applying. Our editorial team will review your SOP and Resume, and get back to you via LinkedIn shortly.
            </p>
            <button onClick={() => { setIsSubmitted(false); setIsApplying(false); }} className="px-6 py-3 border border-[var(--border)] rounded-xl font-bold text-[var(--foreground)] hover:bg-[#FAFAFA] transition-colors">
              Back to Authors
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
