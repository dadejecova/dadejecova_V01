'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Use timeout to avoid synchronous setState during render cycle
    setTimeout(() => {
      setIsLoggedIn(!!token);
    }, 0);

    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: any = jwtDecode(token);
        setIsAdmin(!!decoded.is_staff);
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }

    if (pathname !== '/search') {
      setSearchQuery('');
    }

    // Close mobile menu on path changes
    setIsOpen(false);
  }, [pathname]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setIsOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0a0f1c]/80 border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo / Marca */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-slate-100 flex items-center tracking-tight font-mono">
              <span className="text-gengar-light">~/</span>dadejecova
              <span className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">_</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-end space-x-6">

            {/* Buscador */}
            <form onSubmit={handleSearch} className="relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                name='q'
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('navbar.search_placeholder')}
                className="block w-full pl-10 pr-3 py-1.5 border border-slate-700 rounded-md bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all"
              />
            </form>

            <Link href="/aboutme" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium">
              {t('navbar.about')}
            </Link>

            {/* Enlace al Dashboard/Progreso según rol */}
            {isLoggedIn && (
              <Link href={isAdmin ? "/dashboard" : "/dashboard/progress"} className="text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">
                {isAdmin ? t('navbar.dashboard') : t('navbar.admin_progress')}
              </Link>
            )}
          </div>

          {/* Estado de la Sesión (Desktop) */}
          <div className="hidden md:flex items-center border-l border-slate-800 pl-6 gap-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-sm font-mono text-rose-400 hover:text-rose-300 transition-colors"
              >
                [ {t('navbar.logout')} ]
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-mono text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  [ {t('navbar.login')} ]
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-mono text-slate-900 bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 rounded transition-colors"
                >
                  {t('navbar.register')}
                </Link>
              </>
            )}

            {/* Language Selector */}
            <div className="relative ml-2">
              <button 
                type="button" 
                onClick={() => setIsLangOpen(!isLangOpen)}
                onBlur={() => setTimeout(() => setIsLangOpen(false), 200)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 rounded-md px-2.5 py-1"
              >
                <span>{language.toUpperCase()}</span>
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute right-0 mt-1.5 w-24 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 transition-all duration-200 z-50 ${isLangOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-slate-800 ${language === 'en' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('es');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-slate-800 ${language === 'es' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
                >
                  Español
                </button>
              </div>
            </div>
          </div>

          {/* Botón Hamburguesa para Móvil */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable para Móvil */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0f1c]/95 backdrop-blur-lg" id="mobile-menu">
          <div className="px-4 pt-2 pb-6 space-y-4">
            
            {/* Buscador Móvil */}
            <form onSubmit={handleSearch} className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                name='q'
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('navbar.search_placeholder')}
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
              />
            </form>

            {/* Enlaces de Navegación */}
            <div className="flex flex-col space-y-3 pl-1">
              <Link href="/aboutme" className="text-slate-300 hover:text-emerald-400 transition-colors text-base font-medium py-1">
                {t('navbar.about')}
              </Link>
              
              {isLoggedIn && (
                <Link href={isAdmin ? "/dashboard" : "/dashboard/progress"} className="text-slate-300 hover:text-cyan-400 transition-colors text-base font-medium py-1">
                  {isAdmin ? t('navbar.dashboard') : t('navbar.admin_progress')}
                </Link>
              )}
            </div>

            {/* Estado de la Sesión Móvil */}
            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3 pl-1">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-base font-mono text-rose-400 hover:text-rose-300 transition-colors py-1"
                >
                  [ {t('navbar.logout')} ]
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full text-center text-sm font-mono text-cyan-500 hover:text-cyan-400 transition-colors py-2 border border-cyan-500/20 rounded"
                  >
                    [ {t('navbar.login')} ]
                  </Link>
                  <Link
                    href="/register"
                    className="w-full text-center text-sm font-mono text-slate-950 bg-cyan-500 hover:bg-cyan-400 py-2 rounded transition-colors font-semibold"
                  >
                    {t('navbar.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Language Selector */}
            <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between px-1">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Language / Idioma</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${language === 'en' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold' : 'border-slate-800 text-slate-500 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('es');
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${language === 'es' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500 hover:text-white'}`}
                >
                  ES
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}