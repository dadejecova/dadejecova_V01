// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/layout/Navbar';
import { LanguageProvider } from '@/i18n/LanguageContext';
import './globals.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daniel Coello | Software & Lab',
  description: 'Portfolio and code laboratory of Daniel Coello. Full Stack & Data Engineer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Fondo global oscuro para toda la app */}
      <body className={`${inter.className} bg-[#0a0f1c] text-slate-200 antialiased min-h-screen flex flex-col`}>
        <LanguageProvider>
          <Navbar />
          
          {/* El contenido de cada page.tsx se renderiza aquí dentro */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Footer simple global */}
          <footer className="border-t border-slate-800/50 py-8 text-center text-sm text-slate-500 mt-auto">
            <p>© {new Date().getFullYear()} Daniel Coello. Built with Next.js and Django.</p>
          </footer>
        </LanguageProvider>

        <Analytics />
      </body>
    </html>
  );
}