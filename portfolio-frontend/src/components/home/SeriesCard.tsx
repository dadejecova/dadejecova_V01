// src/components/home/SeriesCard.tsx
import Link from "next/link";

// UI basada en django
export interface SeriesProps{
  id: number;
  name: string;
  slug: string;
  description: string;
  topicName?: string; 
}

export default function SeriesCard({ series }: { series: SeriesProps }) {
  return (
    <Link href={`/topics/${series.slug}`} className="group block h-full">
      <div className="flex flex-col h-full p-6 bg-slate-900/50 border border-slate-800 rounded-xl transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:-translate-y-1">
        
        {/* Etiqueta del Topic */}
        {series.topicName && (
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 block">
            {series.topicName}
          </span>
        )}

        {/* Título de la Serie */}
        <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-3 group-hover:text-cyan-400 transition-colors">
          {series.name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-slate-400 flex-grow mb-6 line-clamp-3">
          {series.description}
        </p>

        {/* Call to Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
          <span className="text-sm text-cyan-500 font-medium group-hover:underline decoration-2 underline-offset-4">
            Start Series
          </span>
          <svg className="w-5 h-5 text-cyan-500 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

      </div>
    </Link>
  );
}