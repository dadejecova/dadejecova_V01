'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface LessonListItem {
  id: number;
  title: string;
  slug: string;
  step_number?: number;
}

interface SidebarProps {
  lessons: LessonListItem[];
  topicSlug: string;
  seriesSlug: string;
  repositoryUrl?: string | null;
}

export default function LessonSidebar({ lessons, topicSlug, seriesSlug, repositoryUrl }: SidebarProps) {
  const params = useParams();
  const currentLessonSlug = params.lessonSlug as string;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      try {
        const progRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (progRes.ok) {
          const progData = await progRes.json();
          setCompletedLessonIds(progData.map((p: any) => p.lesson));
        }
      } catch (err) {}
    };

    fetchProgress();
  }, [currentLessonSlug]); // re-fetch when lesson changes so sidebar updates if we mark it complete

  const completedCountInSeries = lessons.filter(l => completedLessonIds.includes(l.id)).length;

  return (
    <aside className="w-full md:w-64 lg:w-80 flex-shrink-0">
      <div className="sticky top-24 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          <span>Series Outline</span>
          {isLoggedIn && lessons.length > 0 && (
            <span className="text-gengar-light">{completedCountInSeries}/{lessons.length}</span>
          )}
        </div>
        
        <nav className="flex flex-col gap-1">
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => {
              const isActive = currentLessonSlug === lesson.slug;
              const isCompleted = completedLessonIds.includes(lesson.id);
              
              return (
                <Link 
                  key={lesson.id}
                  href={`/topics/${topicSlug}/${seriesSlug}/${lesson.slug}`}
                  className={`p-3 rounded-lg text-sm flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-slate-800/80 text-white font-medium shadow-sm border-l-2 border-gengar' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`font-mono text-xs ${isActive ? 'text-gengar' : 'text-slate-600 group-hover:text-gengar'}`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </div>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-gengar-light flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 italic">No lessons listed yet.</p>
          )}
        </nav>

        {repositoryUrl && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all text-xs font-semibold"
            >
              <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
              Series Repository
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
