import Link from 'next/link';
import LessonSidebar from './LessonSidebar';

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
  repository_url?: string | null;
  lessons: LessonListItem[];
}

export default async function SeriesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicSlug: string, seriesSlug: string }>;
}) {
  const { topicSlug, seriesSlug } = await params;

  let series: SeriesData | null = null;
  let lessons: LessonListItem[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${seriesSlug}/`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      series = await res.json();
      lessons = series?.lessons || []; 
      
      lessons.sort((a, b) => (a.step_number || a.id) - (b.step_number || b.id));
    }
  } catch (error) {
    console.error("Error loading syllabus:", error);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
          <Link href={`/topics/${topicSlug}`} className="text-sm font-mono text-slate-500 hover:text-gengar-light transition-colors">
            &larr; Back to {topicSlug.replace(/-/g, ' ')}
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          <LessonSidebar 
            lessons={lessons} 
            topicSlug={topicSlug} 
            seriesSlug={seriesSlug} 
            repositoryUrl={series?.repository_url}
          />

          <main className="flex-1 min-w-0 bg-slate-900/20 border border-slate-800/50 rounded-xl p-6 md:p-10">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
