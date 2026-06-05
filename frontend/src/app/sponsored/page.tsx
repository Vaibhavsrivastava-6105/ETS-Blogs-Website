import React from 'react';

export const metadata = {
  title: 'Sponsored by ExcelTech Solutions | ETS Blogs',
  description: 'Learn more about our official sponsor and organizer, ExcelTech Solutions.',
};

export default function SponsoredPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-20 px-4 sm:px-6">
      
      <div className="max-w-5xl w-full">
        {/* Badge */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Official Organizer
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <h1 className="text-5xl md:text-6xl font-black font-heading tracking-tight text-[var(--foreground)] mb-6">
            Sponsored & Organized by <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ExcelTech Solutions</span>
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Empowering businesses through cutting-edge technology, innovative software development, and transformative digital solutions.
          </p>
        </div>

        {/* Card Section */}
        <div className="bg-white border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* Decorative Background Blur */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] tracking-tight">
                About ExcelTech Solutions
              </h2>
              <div className="space-y-4 text-[var(--muted-foreground)] text-lg leading-relaxed">
                <p>
                  <strong>ExcelTech Solutions</strong> is a premier technology firm specializing in delivering scalable software, comprehensive IT infrastructure, and robust digital ecosystems. 
                </p>
                <p>
                  Their team of industry experts works tirelessly to bridge the gap between complex business challenges and elegant technological solutions. They are the driving force organizing and sponsoring this platform, ensuring we have the resources to bring you top-tier content and features.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-8 bg-[#FAFAFA] p-10 rounded-2xl border border-[var(--border)] shadow-inner">
              <div className="w-28 h-28 bg-white rounded-3xl shadow-sm border border-[var(--border)] flex items-center justify-center overflow-hidden p-3">
                <img src="/logo.jpg" alt="ExcelTech Logo" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-2xl text-[var(--foreground)] mb-1">ExcelTech</h3>
                <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Technology Partner</p>
              </div>
              
              <a 
                href="https://exceltechsolutions.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all duration-300 bg-blue-600 font-heading tracking-widest uppercase rounded-xl hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                <span>Visit Website</span>
                <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
