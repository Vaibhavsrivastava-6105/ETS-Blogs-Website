"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname() || '';
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(
      localStorage.getItem("userRole") === "admin" || 
      localStorage.getItem("isAdmin") === "true"
    );
  }, []);

  // For visual styling specific to admin pages
  const isAdminRoute = pathname.startsWith('/admin');

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/articles" },
    { name: "Categories", href: "/categories" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-[var(--border)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-0 group">
                <div className="relative w-12 h-12 transition-transform group-hover:scale-105 flex items-center justify-center">
                  <img src="/logo.jpg" alt="ETS Logo" className="w-full h-full object-contain scale-[1.4]" />
                </div>
                <span className="font-heading font-black text-2xl tracking-tight text-[var(--foreground)] uppercase ml-1">
                  ETS<span className="text-[var(--primary)]">.</span>
                </span>
              </Link>
            </div>

            {/* Center: Links Removed (Nav is handled via Side Menu) */}

            {/* Right: Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/sponsored" className="text-xs uppercase tracking-widest font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors py-2 flex items-center gap-2 group">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-40 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)] opacity-70 group-hover:opacity-100 transition-opacity"></span>
                </span>
                Sponsored
              </Link>
              {isLoggedIn && !isAdminRoute && (
                <Link href="/admin" className="bg-[var(--primary)] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold transition-all hover:bg-blue-800">
                  Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center">
              <button onClick={() => setIsSideMenuOpen(true)} className="text-[var(--foreground)] hover:text-[var(--primary)] p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Side Menu Tab */}
      <button 
        onClick={() => setIsSideMenuOpen(true)}
        className="fixed right-0 top-1/3 z-50 bg-[var(--primary)] text-white py-6 px-2 flex flex-col items-center gap-4 hover:bg-blue-800 transition-colors shadow-lg rounded-l-md hidden lg:flex"
      >
        <Menu className="w-5 h-5" />
        <span 
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Navigation Menu
        </span>
      </button>

      {/* Side Menu Overlay */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-end items-center">
          {/* Side Menu Panel */}
          <div className="w-full max-w-[280px] bg-white h-auto max-h-[90vh] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-3xl overflow-hidden border-y border-l border-[var(--border)]">
            {/* Header */}
            <div className="px-6 py-6 flex justify-between items-center border-b border-[var(--border)]">
              <h2 className="text-[var(--primary)] font-bold text-xs uppercase tracking-widest">Navigation Menu</h2>
              <button onClick={() => setIsSideMenuOpen(false)} className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors bg-slate-100 p-2 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links List */}
            <div className="overflow-y-auto">
              <ul className="flex flex-col">
                <li className="border-b border-[var(--border)]/70">
                  <Link 
                    href="/articles" 
                    onClick={() => setIsSideMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-5 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 text-base font-medium transition-colors"
                  >
                    <Search className="w-5 h-5" /> Search
                  </Link>
                </li>
                {navLinks.map((link) => (
                  <li key={link.name} className="border-b border-[var(--border)]/70">
                    <Link 
                      href={link.href} 
                      onClick={() => setIsSideMenuOpen(false)}
                      className="block px-6 py-5 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 text-base font-medium transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}

                {isLoggedIn ? (
                  <li className="border-b border-[var(--border)]/70 bg-[var(--primary)]/5">
                    <Link 
                      href="/admin" 
                      onClick={() => setIsSideMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-5 text-[var(--primary)] hover:bg-[var(--primary)]/10 text-base font-bold transition-colors"
                    >
                      <User className="w-5 h-5" /> Dashboard
                    </Link>
                  </li>
                ) : (
                  <li className="border-b border-[var(--border)]/70 bg-[var(--muted)]/20">
                    <Link 
                      href="/login" 
                      onClick={() => setIsSideMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-5 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 text-base font-bold transition-colors"
                    >
                      <User className="w-5 h-5" /> Admin Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
