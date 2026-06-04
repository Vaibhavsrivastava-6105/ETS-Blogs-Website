"use client";

import Link from 'next/link';
import { LayoutDashboard, Heart, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "user") {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    router.push("/");
  };

  if (isChecking) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[#FAFAFA] dark:bg-zinc-900 flex flex-col transition-colors duration-300">
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[var(--foreground)] flex items-center justify-center">
              <span className="text-white font-bold font-heading">P</span>
            </div>
            <span className="font-heading font-bold text-lg text-[var(--foreground)]">Reader</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-bold tracking-wider text-[var(--muted-foreground)] uppercase mb-3 px-2">Menu</div>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-zinc-800 text-[var(--foreground)] shadow-sm border border-[var(--border)] transition-colors">
            <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" />
            Dashboard
          </Link>
          <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <Heart className="w-4 h-4" />
            Liked Articles
          </button>
          
          <div className="mt-8 mb-3 px-2 text-xs font-bold tracking-wider text-[var(--muted-foreground)] uppercase">System</div>
          <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
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
