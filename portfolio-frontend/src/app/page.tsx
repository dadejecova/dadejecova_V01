// src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Message {
  role: 'user' | 'model';
  parts: string[];
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useTranslation();

  // Chat State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', parts: ["Hello! I'm Isa, your interactive tutor. How can I help you today?"] }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_URL}/topics/`);
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [language, API_URL]);

  useEffect(() => {
    // Auto-scroll just the chat container to bottom, not the whole page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMsg: Message = { role: 'user', parts: [chatInput] };
    const newHistory = [...chatMessages, newUserMsg];
    setChatMessages(newHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/ai_tutor/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: chatInput,
          language: language,
          // We can optionally pass history, skipping the first greeting
          history: chatMessages.slice(1).map(m => ({ role: m.role, parts: m.parts }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages([...newHistory, { role: 'model', parts: [data.response] }]);
      } else if (response.status === 401) {
        setChatMessages([...newHistory, { role: 'model', parts: ["Your session has expired. Please log in again."] }]);
        setIsLoggedIn(false);
      } else {
        setChatMessages([...newHistory, { role: 'model', parts: ["Sorry, I encountered an error on the server."] }]);
      }
    } catch (error) {
      setChatMessages([...newHistory, { role: 'model', parts: ["Failed to connect to the server."] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* 1. HERO SECTION (Humanistic & Agent-Centric) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Text */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gengar/10 text-gengar-dark dark:text-gengar-light text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gengar opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gengar"></span>
              </span>
              Platform Active & Learning
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Trace Your Journey.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gengar to-indigo-500">
                Learn with Agents.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mb-8 leading-relaxed">
              This platform is a living record of our learning process. Explore tutorials, trace architectures, and interact with our sandboxed AI tutors to understand the code line by line.
            </p>
            
            <div className="flex gap-4">
              <a href="#topics" className="px-6 py-3 rounded-xl bg-gengar text-white font-semibold hover:bg-gengar-dark transition-all shadow-lg shadow-gengar/20">
                Start Learning
              </a>
            </div>
          </div>

          {/* Hero AI Chat Interface */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gengar to-indigo-500 rounded-3xl blur opacity-20 dark:opacity-40"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[400px]">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gengar/20 flex items-center justify-center text-xl">
                    👵
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Isa Tutor</h3>
                    <p className="text-xs text-gengar">Sandboxed AI Assistant</p>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-gengar text-white ml-auto rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none prose prose-sm dark:prose-invert max-w-none'
                    }`}
                  >
                    {/* Render Markdown securely */}
                    {msg.role === 'user' ? (
                      msg.parts.join('\n')
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.parts.join('\n')}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[50%] text-gray-500 text-sm animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              {isLoggedIn ? (
                <form onSubmit={handleSendMessage} className="relative shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this project's architecture..."
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-3 pl-4 pr-12 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gengar/50 text-sm text-gray-900 dark:text-white"
                    disabled={isChatLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gengar hover:text-gengar-dark disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              ) : (
                <div className="shrink-0 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 rounded-xl p-3 text-center text-sm">
                  Please <Link href="/login" className="font-semibold underline hover:text-orange-700 dark:hover:text-orange-300">log in</Link> to chat with Isa.
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 2. GRID SECTION */}
      <section id="topics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Latest Topics</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Deep dives into full-stack engineering, infrastructure, and agentic workflows.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gengar"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <div 
                key={topic.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Image Container */}
                <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                  {topic.image ? (
                    <img 
                      src={topic.image} 
                      alt={topic.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-gengar transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                    {topic.description || t('home.view_series_desc_fallback')}
                  </p>
                  
                  {/* Action Button */}
                  <Link 
                    href={`/topics/${topic.slug}`} 
                    className="mt-auto block w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-gengar hover:text-white text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {t('home.view_series')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}