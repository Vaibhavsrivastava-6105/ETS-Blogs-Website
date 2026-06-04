"use client";

import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (username === "deepak" && password === "deepak@123") {
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("username", "Deepak");
      router.push("/admin");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-xl w-full max-w-sm text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-heading mb-2 text-[var(--foreground)]">Admin Login</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">Enter your credentials to continue.</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold mb-1 text-[var(--foreground)]">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-2 border border-[var(--border)] bg-[#FAFAFA] rounded-xl focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all" 
              placeholder="Enter username" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-[var(--foreground)]">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-[var(--border)] bg-[#FAFAFA] rounded-xl focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all" 
              placeholder="Enter password" 
              required 
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button type="submit" className="w-full bg-[var(--foreground)] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
