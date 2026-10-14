'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/LanguageContext';

interface ExplanationItem {
  lines: string;
  meaning: string;
}

interface ExplanationResponse {
  explanation: ExplanationItem[];
  data_flow: string[];
}

interface CodeBlockWithExplainProps {
  code: string;
  language: string;
}

export default function CodeBlockWithExplain({ code, language }: CodeBlockWithExplainProps) {
  const [explanationData, setExplanationData] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleExplain = async () => {
    if (isOpen) {
      // If already open, just collapse it
      setIsOpen(false);
      return;
    }

    if (explanationData) {
      // If we already loaded explanations, just re-open
      setIsOpen(true);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError(t('lessons.explain_login_error'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/explain-code/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language })
      });

      if (res.ok) {
        const data = await res.json();
        setExplanationData(data);
        setIsOpen(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || t('lessons.error_failed_explain'));
      }
    } catch (err) {
      console.error('Error fetching code explanation:', err);
      setError(t('lessons.error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6 border border-slate-800 rounded-xl overflow-hidden shadow-lg bg-slate-900/10">
      {/* Code Header */}
      <div className="flex justify-between items-center bg-slate-900/50 border-b border-slate-800 px-4 py-2 text-[10px] text-slate-500 uppercase font-mono tracking-wider font-semibold select-none">
        <span>{language}</span>
        <button
          onClick={handleExplain}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 hover:border-cyan-700/60 rounded-md transition-all font-bold uppercase text-[9px] focus:outline-none"
        >
          {loading ? (
            <>
              <span className="animate-spin h-2.5 w-2.5 border border-cyan-400 border-t-transparent rounded-full" />
              <span>{t('lessons.explaining')}</span>
            </>
          ) : (
            <span>{isOpen ? t('lessons.hide_explanation') : t('lessons.explain_code')}</span>
          )}
        </button>
      </div>

      {/* Code block body */}
      <div className="relative">
        <pre className="p-4 bg-slate-950/60 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed max-w-full block">
          <code>{code}</code>
        </pre>
      </div>

      {/* Explainer Drawer */}
      {isOpen && explanationData && (
        <div className="border-t border-slate-800 bg-slate-900/30 p-5 animate-fadeIn">
          {/* Section 1: Line Breakdown */}
          <div className="mb-6">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <span>{t('lessons.lines_breakdown')}</span>
            </h5>
            <div className="flex flex-col gap-3">
              {explanationData.explanation.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-start text-xs border-b border-slate-850 pb-3 last:border-0 last:pb-0 gap-2 md:gap-4">
                  <pre className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-mono overflow-x-auto max-w-full md:max-w-[40%] flex-shrink-0 leading-normal">
                    <code>{item.lines}</code>
                  </pre>
                  <p className="text-slate-400 leading-relaxed mt-1 flex-1">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Data Flow */}
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-4 flex items-center gap-1.5">
              <span>{t('lessons.data_flow_sequence')}</span>
            </h5>
            <div className="relative border-l border-slate-800/80 pl-5 ml-2.5 flex flex-col gap-4">
              {explanationData.data_flow.map((step, idx) => (
                <div key={idx} className="relative text-xs">
                  {/* Step indicator dot */}
                  <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 border border-cyan-800/80 text-cyan-400 font-bold text-[9px] font-mono shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="border-t border-slate-800 bg-rose-950/10 p-3 text-xs text-rose-400 text-center select-none flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
