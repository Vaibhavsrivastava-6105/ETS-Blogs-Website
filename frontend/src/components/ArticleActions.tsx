"use client";

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

export default function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
      <button 
        onClick={handleShare}
        className="hover:text-[var(--foreground)] transition-colors relative group flex items-center justify-center"
        aria-label="Share article"
      >
        <Share2 className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Share</span>
      </button>
      
      <button 
        onClick={handleCopyLink}
        className="hover:text-[var(--foreground)] transition-colors relative group flex items-center justify-center"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {copied ? 'Copied!' : 'Copy Link'}
        </span>
      </button>
    </div>
  );
}
