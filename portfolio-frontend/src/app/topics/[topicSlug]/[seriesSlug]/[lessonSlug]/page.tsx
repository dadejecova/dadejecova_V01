'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '@/i18n/LanguageContext';
import remarkGfm from 'remark-gfm';
import LessonQuiz from './LessonQuiz';
import CodeBlockWithExplain from './CodeBlockWithExplain';

interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string; 
  technology: string;
  image: string | null;
  video_url: string | null;
  repository_url: string | null;
  step_number: number;
  created_at: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const lessonSlug = params.lessonSlug as string;

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressId, setProgressId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      try {
        // Fetch lesson
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonSlug}/`);
        let lessonId = null;
        if (response.ok) {
          const data = await response.json();
          setCurrentLesson(data);
          lessonId = data.id;
        }

        // Fetch progress if logged in
        const token = localStorage.getItem('access_token');
        if (token && lessonId) {
          setIsLoggedIn(true);
          const progRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (progRes.ok) {
            const progData = await progRes.json();
            // find if this lesson is in user's completed list
            const completion = progData.find((p: any) => p.lesson === lessonId);
            if (completion) {
              setIsCompleted(true);
              setProgressId(completion.id);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonSlug) fetchLessonAndProgress();
  }, [lessonSlug]);

  const toggleCompletion = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setIsMarking(true);
    const token = localStorage.getItem('access_token');

    try {
      if (isCompleted && progressId) {
        // Unmark (Delete)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/${progressId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setIsCompleted(false);
          setProgressId(null);
        }
      } else if (currentLesson) {
        // Mark as complete (POST)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ lesson: currentLesson.id })
        });
        if (res.ok) {
          const data = await res.json();
          setIsCompleted(true);
          setProgressId(data.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  // Helper to convert youtube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <>
      {currentLesson ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              {currentLesson.title}
            </h1>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {currentLesson.repository_url && (
                <a 
                  href={currentLesson.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-[#161b22] text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-lg text-sm"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                  </svg>
                  {t('lessons.view_code')}
                </a>
              )}

              {/* Completion Button */}
              <button 
                onClick={toggleCompletion}
                disabled={isMarking}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all shadow-lg text-sm
                  ${isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 hover:bg-emerald-500/30' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCompleted 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" className="opacity-50" />
                  }
                </svg>
                {isMarking ? t('lessons.processing') : isCompleted ? t('lessons.completed') : t('lessons.mark_as_read')}
              </button>
            </div>
          </div>

          {currentLesson.video_url ? (
            <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
              <iframe 
                src={getEmbedUrl(currentLesson.video_url) || currentLesson.video_url} 
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            currentLesson.image && (
              <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative flex items-center justify-center">
                <img 
                  src={currentLesson.image} 
                  alt={currentLesson.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )
          )}

          <article className="prose prose-invert prose-emerald max-w-none bg-slate-800/20 p-8 rounded-2xl border border-slate-800/50">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                Part {currentLesson.step_number}
              </span>
              <span className="text-slate-500 text-xs">
                Published: {new Date(currentLesson.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-slate-300">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ node, children, ...props }: any) {
                    const hasLanguage = Array.isArray(children)
                      ? children.some((child: any) => child?.props?.className?.startsWith('language-'))
                      : children?.props?.className?.startsWith('language-');

                    if (hasLanguage) {
                      return <>{children}</>;
                    }

                    return (
                      <pre className="p-4 bg-slate-950/60 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed rounded-xl border border-slate-800 my-6" {...props}>
                        {children}
                      </pre>
                    );
                  },
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (match) {
                      return (
                        <CodeBlockWithExplain 
                          code={String(children).replace(/\n$/, '')} 
                          language={match[1]} 
                        />
                      );
                    }
                    // Inline code or simple block code (wrapped by pre component)
                    return <code className={className} {...props}>{children}</code>;
                  }
                }}
              >
                {currentLesson.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* AI-Powered Lesson Evaluation */}
          <LessonQuiz 
            lessonSlug={lessonSlug}
            isLoggedIn={isLoggedIn}
          />
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">Lesson not found.</div>
      )}
    </>
  );
}
