'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from '@/i18n/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    } 

    try {
      const decoded: any = jwtDecode(token);
      
      if (decoded.is_staff) {
        setIsAuthorized(true);
        setIsAdmin(true);
      } else {
        setIsAuthorized(true);
        setIsAdmin(false);
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      router.push('/login');
    }
  }, [router]);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full"></span>
          <span className="text-cyan-500 font-mono text-sm">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex text-slate-200">
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            {isAdmin ? 'Admin Panel' : 'Student Panel'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          {/* Learning module */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
              {t('dashboard_sidebar.learning')}
            </h3>
            <nav className="flex flex-col gap-1">
              <Link href="/dashboard/progress" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/progress') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                {t('dashboard_sidebar.my_progress')}
              </Link>
            </nav>
          </div>

          {/* Account module */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
              {t('dashboard_sidebar.account')}
            </h3>
            <nav className="flex flex-col gap-1">
              <Link href="/dashboard/account" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname === '/dashboard/account' ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                {t('dashboard_sidebar.my_account')}
              </Link>
            </nav>
          </div>

          {/* Admin Classes Module */}
          {isAdmin && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
                {t('dashboard_sidebar.classes_courses')}
              </h3>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard/topics" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/topics') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Topics
                </Link>
                <Link href="/dashboard/series" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/series') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Series
                </Link>
                <Link href="/dashboard/lessons" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/lessons') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Lessons
                </Link>
                <Link href="/dashboard/lesson-types" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/lesson-types') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Lesson Types
                </Link>
              </nav>
            </div>
          )}

          {/* Admin CV Module */}
          {isAdmin && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
                {t('dashboard_sidebar.curriculum_cv')}
              </h3>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard/profile" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/profile') ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Main Profile
                </Link>
                <Link href="/dashboard/experiences" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/experiences') ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Experience
                </Link>
                <Link href="/dashboard/education" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/education') ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Education
                </Link>
                <Link href="/dashboard/projects" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/projects') ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Projects (Portfolio)
                </Link>
              </nav>
            </div>
          )}

          {/* Admin Settings Module */}
          {isAdmin && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
                {t('dashboard_sidebar.admin_settings')}
              </h3>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard/users" className={`px-3 py-2 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/users') ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                  Users
                </Link>
              </nav>
            </div>
          )}

        </div>
      </aside>

      {/* Viewport content area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Dashboard Nav */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-40">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {isAdmin ? 'Admin Panel' : 'Student Panel'}
            </div>
            <h1 className="text-sm font-bold text-white">
              {pathname.includes('/dashboard/progress') && t('dashboard_sidebar.my_progress')}
              {pathname.includes('/dashboard/topics') && t('dashboard_sidebar.topics')}
              {pathname.includes('/dashboard/series') && t('dashboard_sidebar.series')}
              {pathname.includes('/dashboard/lessons') && t('dashboard_sidebar.lessons')}
              {pathname.includes('/dashboard/profile') && t('dashboard_sidebar.main_profile')}
              {pathname.includes('/dashboard/experiences') && t('dashboard_sidebar.experience')}
              {pathname.includes('/dashboard/education') && t('dashboard_sidebar.education')}
              {pathname.includes('/dashboard/projects') && t('dashboard_sidebar.projects')}
              {pathname.includes('/dashboard/lesson-types') && t('dashboard_sidebar.lesson_types')}
              {pathname.includes('/dashboard/users') && t('dashboard_sidebar.users')}
              {pathname === '/dashboard/account' && t('dashboard_sidebar.my_account')}
              {pathname === '/dashboard' && 'Overview'}
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors focus:outline-none"
          >
            <span>Menu</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </header>

        {/* Mobile Dropdown Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-4 z-40 backdrop-blur-md">
            
            {/* Learning section */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('dashboard_sidebar.learning')}
              </h3>
              <nav className="flex flex-col gap-1">
                <Link 
                  href="/dashboard/progress" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/progress') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                >
                  My Progress
                </Link>
              </nav>
            </div>

            {/* Account section */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('dashboard_sidebar.account')}
              </h3>
              <nav className="flex flex-col gap-1">
                <Link 
                  href="/dashboard/account" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname === '/dashboard/account' ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                >
                  My Account
                </Link>
              </nav>
            </div>

            {/* Admin Classes Section */}
            {isAdmin && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('dashboard_sidebar.classes_courses')}
                </h3>
                <nav className="flex flex-col gap-1">
                  <Link 
                    href="/dashboard/topics" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/topics') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.topics')}
                  </Link>
                  <Link 
                    href="/dashboard/series" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/series') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.series')}
                  </Link>
                  <Link 
                    href="/dashboard/lessons" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/lessons') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.lessons')}
                  </Link>
                  <Link 
                    href="/dashboard/lesson-types" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/lesson-types') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.lesson_types')}
                  </Link>
                </nav>
              </div>
            )}

            {/* Admin CV Section */}
            {isAdmin && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('dashboard_sidebar.curriculum_cv')}
                </h3>
                <nav className="flex flex-col gap-1">
                  <Link 
                    href="/dashboard/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/profile') ? 'bg-emerald-500/10 text-emerald-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.main_profile')}
                  </Link>
                  <Link 
                    href="/dashboard/experiences" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/experiences') ? 'bg-emerald-500/10 text-emerald-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.experience')}
                  </Link>
                  <Link 
                    href="/dashboard/education" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/education') ? 'bg-emerald-500/10 text-emerald-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.education')}
                  </Link>
                  <Link 
                    href="/dashboard/projects" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/projects') ? 'bg-emerald-500/10 text-emerald-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.projects')}
                  </Link>
                </nav>
              </div>
            )}

            {/* Admin Settings Section */}
            {isAdmin && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('dashboard_sidebar.admin_settings')}
                </h3>
                <nav className="flex flex-col gap-1">
                  <Link 
                    href="/dashboard/users" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.includes('/dashboard/users') ? 'bg-cyan-500/10 text-cyan-400 font-medium font-mono' : 'text-slate-400 hover:bg-slate-850'}`}
                  >
                    {t('dashboard_sidebar.users')}
                  </Link>
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Main Panel Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#0a0f1c] relative">
          {children}
        </main>
      </div>

    </div>
  );
}