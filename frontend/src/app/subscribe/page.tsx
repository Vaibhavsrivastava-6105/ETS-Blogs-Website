"use client";

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!isSubmitted ? (
          <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-xl text-center">
            <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-3">
              Subscribe to Publisher.
            </h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              Get the latest insights, tutorials, and technical deep-dives delivered straight to your inbox every week.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  required 
                  placeholder="name@company.com" 
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all text-center"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[var(--foreground)] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-[var(--muted-foreground)] mt-6">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-xl text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight mb-4">You're on the list!</h2>
            <p className="text-[var(--muted-foreground)] mb-8">
              Thank you for subscribing. Keep an eye on your inbox for our next issue.
            </p>
            <Link href="/" className="inline-block px-6 py-3 border border-[var(--border)] rounded-xl font-bold text-[var(--foreground)] hover:bg-[#FAFAFA] transition-colors w-full">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
