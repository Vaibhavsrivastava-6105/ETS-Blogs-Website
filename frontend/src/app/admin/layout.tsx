"use client";

import Link from 'next/link';
import { LayoutDashboard, FileText, Edit3, Folder, Image as ImageIcon, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin" && localStorage.getItem("isAdmin") !== "true") {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    router.push("/login");
  };

  if (isChecking) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--muted)] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)] bg-white">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="/logo.jpg" alt="ETS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading font-bold text-lg text-[var(--foreground)] tracking-tight">
              ETS<span className="text-[var(--primary)]">.</span> <span className="text-sm font-medium text-[var(--muted-foreground)] ml-1">Workspace</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-bold tracking-wider text-[var(--muted-foreground)] uppercase mb-3 px-2">Menu</div>
          
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-white text-[var(--foreground)] shadow-sm border border-[var(--border)]">
            <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" />
            Dashboard
          </Link>
          <Link href="/admin/articles" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <FileText className="w-4 h-4" />
            Articles
          </Link>
          <Link href="/admin/drafts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <Edit3 className="w-4 h-4" />
            Drafts
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <Folder className="w-4 h-4" />
            Categories
          </Link>
          <Link href="/admin/media" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <ImageIcon className="w-4 h-4" />
            Media Library
          </Link>
          
          <div className="mt-8 mb-3 px-2 text-xs font-bold tracking-wider text-[var(--muted-foreground)] uppercase">System</div>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
