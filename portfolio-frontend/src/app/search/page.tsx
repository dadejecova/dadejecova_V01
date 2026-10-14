// src/app/search/page.tsx
import Link from 'next/link';

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  description: string;
  technology: string;
  series_slug?: string; // Importante para construir la URL después
  topic_slug?: string;
}

// Next.js 15+ requiere que searchParams sea awaited, si usas v14 o inferior puedes omitir el await
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}) {
  // Resolvemos los params
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  
  let results: SearchResult[] = [];
  let error = false;

  if (query) {
    try {
      // Fetch a Django usando el filtro 'search' que ya habilitaste en api.py
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/?search=${encodeURIComponent(query)}`, {
        cache: 'no-store' 
      });

      if (!res.ok) throw new Error('Error en la API');
      
      const data = await res.json();
      results = data.results || data; 

    } catch (err) {
      console.error('Search error:', err);
      error = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 border-b border-slate-800 pb-6 mt-10">
          <Link href="/" className="text-sm font-mono text-emerald-500 hover:text-emerald-400 mb-6 inline-block">
            &larr; Back
          </Link>
          <h1 className="text-3xl font-light text-white mb-2">
            Results for: <span className="font-semibold text-emerald-400">"{query}"</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {results.length} lesson(s) found.
          </p>
        </div>

        {results.map((lesson) => (
           <Link 
              key={lesson.id} 
              href={`/topics/${lesson.topic_slug}/${lesson.series_slug}/${lesson.slug}`}
              className="block mb-4"
           >
             <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group">
                <h3 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-slate-400 mt-2 line-clamp-2">{lesson.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-500">
                  <span className="bg-slate-800 px-2 py-1 rounded">Technology: {lesson.technology}</span>
                  {lesson.topic_slug && <span className="bg-emerald-900/30 text-emerald-500 px-2 py-1 rounded border border-emerald-800/50">{lesson.topic_slug}</span>}
                </div>
             </div>
           </Link>
        ))}
      </div>
    </div>
  );
}