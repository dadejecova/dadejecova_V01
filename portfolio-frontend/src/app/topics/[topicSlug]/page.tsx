'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

interface SeriesData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  topic_name?: string;
}

export default function TopicDetailPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = use(params);
  const { t } = useTranslation();

  const [seriesList, setSeriesList] = useState<SeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/?topic=${topicSlug}`);
        if (response.ok) {
          const data = await response.json();
          setSeriesList(data);
        }
      } catch (error) {
        console.error('Error loading series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (topicSlug) {
      fetchSeries();
    }
  }, [topicSlug]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 p-8">
      <div className="max-w-5xl mx-auto mt-20">
        
        <Link href="/" className="text-gengar-light hover:text-[#d2a8ff] flex items-center gap-2 mb-8 transition-colors w-fit">
          &larr; {t('lessons.back_to_home')}
        </Link>

        <div className="mb-12 border-b border-slate-800/50 pb-6">
          <h1 className="text-4xl font-bold text-white mb-2 capitalize">
            {topicSlug.replace(/-/g, ' ')}
          </h1>
          <p className="text-slate-400 text-lg">
            Explore the learning series and tutorials within this category.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gengar"></div>
          </div>
        ) : seriesList.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center text-slate-400">
            No series published under this topic yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seriesList.map((series) => (
              <Link href={`/topics/${topicSlug}/${series.slug}`} key={series.id} className="block">
                <div 
                  className="bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-gengar/60 hover:shadow-[0_0_15px_rgba(194,153,250,0.15)] transition-all duration-500 flex flex-col group backdrop-blur-sm"
                >
                  {/* Contenedor de la Imagen de la Serie */}
                  <div className="h-48 bg-slate-900/80 overflow-hidden relative border-b border-slate-700/50">
                    {series.image ? (
                      <img 
                        src={series.image} 
                        alt={series.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold text-white group-hover:text-gengar-light transition-colors">
                        {series.name}
                      </h2>
                      <span className="bg-[#9a66ea]/10 text-gengar-light text-xs px-3 py-1 rounded-full font-mono border border-gengar/30">
                        Series
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 flex-grow">
                      {series.description || 'Explore the learning series and tutorials within this category.'}
                    </p>
                    
                    {/* Botón de Acción */}
                    <div 
                      className="mt-auto block w-full text-center bg-slate-800/60 group-hover:bg-[#9a66ea]/10 text-slate-200 group-hover:text-gengar-light font-medium py-3 px-4 rounded-lg transition-colors border border-slate-700 group-hover:border-[#c299fa]/50"
                    >
                      View Lessons
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
