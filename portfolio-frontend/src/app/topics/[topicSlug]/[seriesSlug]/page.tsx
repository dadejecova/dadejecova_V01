'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface LessonListItem {
  id: number;
  title: string;
  slug: string;
  step_number?: number;
}

interface SeriesData {
  id: number;
  name: string;
  slug: string;
  description: string;
  lessons: LessonListItem[];
}

export default function SeriesDefaultPage({
  params,
}: {
  params: Promise<{ topicSlug: string; seriesSlug: string }>;
}) {
  const { topicSlug, seriesSlug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineRedirect = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${seriesSlug}/`);
        if (!res.ok) {
          throw new Error('Failed to load series syllabus.');
        }
        const series: SeriesData = await res.json();
        const lessons = series.lessons || [];

        if (lessons.length === 0) {
          setLoading(false);
          return;
        }

        // Sort lessons by step_number or id
        lessons.sort((a, b) => (a.step_number || a.id) - (b.step_number || b.id));

        // Fetch progress if logged in
        let completedLessonIds: number[] = [];
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const progRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (progRes.ok) {
              const progData = await progRes.json();
              completedLessonIds = progData.map((p: any) => p.lesson);
            }
          } catch (err) {
            console.error('Failed to load progress', err);
          }
        }

        // Find the first uncompleted lesson
        const nextLesson = lessons.find((l) => !completedLessonIds.includes(l.id));

        // Redirect to next uncompleted lesson, or the first lesson if all completed
        const targetLesson = nextLesson || lessons[0];
        router.replace(`/topics/${topicSlug}/${seriesSlug}/${targetLesson.slug}`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred.');
        setLoading(false);
      }
    };

    determineRedirect();
  }, [topicSlug, seriesSlug, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 text-sm font-mono animate-pulse">Resuming your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400 font-mono">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="text-center py-20 text-slate-500 font-mono">
      No lessons available for this series yet.
    </div>
  );
}
