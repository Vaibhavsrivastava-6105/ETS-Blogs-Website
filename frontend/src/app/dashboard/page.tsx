"use client";

import { Heart, Moon, Trash2, ArrowRight, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const [username, setUsername] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "User");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      router.push("/");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] dark:bg-zinc-950 text-[var(--foreground)] transition-colors duration-300">
      <header className="h-16 px-8 flex items-center justify-between border-b border-[var(--border)] bg-white dark:bg-zinc-900 sticky top-0 z-10 transition-colors duration-300">
        <h1 className="text-xl font-bold font-heading">Welcome back, {username}</h1>
        <Link href="/articles" className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
          Explore Articles <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <div className="p-8 max-w-5xl mx-auto space-y-12">
        {/* Liked Articles Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-2xl font-bold font-heading">Liked Articles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Article 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm transition-colors duration-300 hover:shadow-md">
              <div className="w-full h-40 bg-indigo-100 dark:bg-indigo-950 rounded-xl mb-4 overflow-hidden relative">
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 p-2 rounded-full">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              </div>
              <h3 className="font-bold font-heading text-lg mb-2 line-clamp-2">Building Next-Gen Web Apps with App Router</h3>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">A deep dive into server components and layouts...</p>
              <button className="text-[var(--primary)] font-semibold text-sm hover:underline">Read Article</button>
            </div>

            {/* Mock Article 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm transition-colors duration-300 hover:shadow-md">
              <div className="w-full h-40 bg-emerald-100 dark:bg-emerald-950 rounded-xl mb-4 overflow-hidden relative">
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 p-2 rounded-full">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              </div>
              <h3 className="font-bold font-heading text-lg mb-2 line-clamp-2">Mastering Tailwind CSS v4</h3>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">Everything you need to know about the new utility engine...</p>
              <button className="text-[var(--primary)] font-semibold text-sm hover:underline">Read Article</button>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h2 className="text-2xl font-bold font-heading">Account Settings</h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] overflow-hidden transition-colors duration-300 shadow-sm">
            {/* Dark Mode Toggle */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Dark Mode
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">Toggle between light and dark themes for the dashboard.</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-[var(--primary)]' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-red-600 mb-1 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">Permanently delete your account and all associated data.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
