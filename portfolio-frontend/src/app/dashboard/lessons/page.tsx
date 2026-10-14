'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Topic {
  id: number;
  name: string;
}

interface Series {
  id: number;
  name: string;
  topic: number;
}

interface LessonType {
  id: number;
  name: string;
}

interface Lesson {
  id: number;
  title: string;
  title_es?: string;
  slug: string;
  description: string;
  description_es?: string;
  content: string;
  content_es?: string;
  image: string | null;
  technology: string;
  repository_url: string;
  video_url: string;
  lesson_type: number;
  lesson_type_name?: string;
  topic: number;
  topic_name?: string;
  series: number | null;
  series_name?: string;
  step_number?: number | null;
}

export default function LessonsManagerPage() {
  const router = useRouter();
  
  // Tab and search states
  const [activeTab, setActiveTab] = useState<'editor' | 'list'>('editor');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para cargar datos del backend
  const [topics, setTopics] = useState<Topic[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [lessonTypesList, setLessonTypesList] = useState<LessonType[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [technology, setTechnology] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [content, setContent] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Relaciones y Orden
  const [lessonType, setLessonType] = useState(''); 
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOrganizersAndLessons();
  }, []);

  const fetchOrganizersAndLessons = async () => {
    try {
      const [topicsRes, seriesRes, typesRes, lessonsRes] = await Promise.all([
        fetch(`${API_URL}/topics/?raw=true`), 
        fetch(`${API_URL}/series/?raw=true`),
        fetch(`${API_URL}/lesson-types/?raw=true`),
        fetch(`${API_URL}/lessons/?raw=true`)
      ]);

      if (topicsRes.ok) setTopics(await topicsRes.json());
      if (seriesRes.ok) setSeriesList(await seriesRes.json());
      if (typesRes.ok) setLessonTypesList(await typesRes.json());
      if (lessonsRes.ok) setLessons(await lessonsRes.json());
    } catch (error) {
      console.error("Error loading organization data:", error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const startEdit = (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to edit "${lesson.title}"? Any unsaved changes in the current editor session will be overwritten.`)) {
      return;
    }
    setEditingLesson(lesson);
    setServerError('');
    setSuccessMsg('');
    
    setTitle(lesson.title);
    setTitleEs(lesson.title_es || '');
    setTechnology(lesson.technology || '');
    setDescription(lesson.description || '');
    setDescriptionEs(lesson.description_es || '');
    setContent(lesson.content || '');
    setContentEs(lesson.content_es || '');
    setRepoUrl(lesson.repository_url || '');
    setVideoUrl(lesson.video_url || '');
    setLessonType(lesson.lesson_type?.toString() || '');
    setSelectedTopic(lesson.topic?.toString() || '');
    setSelectedSeries(lesson.series?.toString() || '');
    setImageFile(null);
    setFormLang('en');

    // Switch tab to editor and scroll smoothly to top
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setServerError('');
    setSuccessMsg('');
    
    setTitle('');
    setTitleEs('');
    setDescription('');
    setDescriptionEs('');
    setContent('');
    setContentEs('');
    setTechnology('');
    setRepoUrl('');
    setVideoUrl('');
    setLessonType('');
    setSelectedTopic('');
    setSelectedSeries('');
    setImageFile(null);
    setFormLang('en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    setIsSaving(true);
    
    const generateSlug = (text: string) => {
      return text.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('title_es', titleEs);
    formData.append('slug', generateSlug(title));
    
    if (lessonType) {
      formData.append('lesson_type', lessonType);
    }
    
    formData.append('technology', technology);
    formData.append('description', description);
    formData.append('description_es', descriptionEs);
    formData.append('content', content);
    formData.append('content_es', contentEs);
    
    let formattedRepoUrl = repoUrl.trim();
    if (formattedRepoUrl && !/^https?:\/\//i.test(formattedRepoUrl)) {
      formattedRepoUrl = 'https://' + formattedRepoUrl;
    }
    if (formattedRepoUrl) {
      formData.append('repository_url', formattedRepoUrl);
    } else {
      formData.append('repository_url', '');
    }

    formData.append('video_url', videoUrl.trim());

    if (selectedTopic) formData.append('topic', selectedTopic);
    if (selectedSeries) {
      formData.append('series', selectedSeries);
    } else {
      formData.append('series', '');
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = editingLesson 
        ? `${API_URL}/lessons/${editingLesson.slug}/`
        : `${API_URL}/lessons/`;
      const method = editingLesson ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      if (response.ok) {
        setSuccessMsg(editingLesson ? 'Lesson updated successfully!' : 'Lesson published successfully!');
        cancelEdit();
        // Refresh lessons list
        const lessonsRes = await fetch(`${API_URL}/lessons/?raw=true`);
        if (lessonsRes.ok) setLessons(await lessonsRes.json());
        // Switch to list view to see the results
        setActiveTab('list');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorData = await response.json();
        setServerError(`Error saving: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setServerError('Connection error with server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string, id: number) => {
    if (!confirm('Are you sure you want to delete this Lesson?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/lessons/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLessons(lessons.filter(l => l.id !== id));
      } else {
        alert('Could not delete Lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const filteredSeries = seriesList.filter(s => 
    selectedTopic === '' || s.topic.toString() === selectedTopic
  );

  // Filter lessons for searchable directory
  const filteredLessons = lessons.filter(lesson => {
    const query = searchQuery.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(query) ||
      (lesson.technology || '').toLowerCase().includes(query) ||
      (lesson.topic_name || '').toLowerCase().includes(query) ||
      (lesson.series_name || '').toLowerCase().includes(query) ||
      (lesson.lesson_type_name || '').toLowerCase().includes(query) ||
      lesson.slug.toLowerCase().includes(query)
    );
  });

  // Group lessons by series dynamically
  const groupedLessons = filteredLessons.reduce((groups, lesson) => {
    const seriesName = lesson.series_name || 'Standalone Lessons';
    if (!groups[seriesName]) {
      groups[seriesName] = [];
    }
    groups[seriesName].push(lesson);
    return groups;
  }, {} as Record<string, Lesson[]>);

  // Sort lessons within each group sequentially by step_number or id
  Object.keys(groupedLessons).forEach(key => {
    groupedLessons[key].sort((a, b) => (a.step_number || a.id) - (b.step_number || b.id));
  });

  // Sort group headers alphabetically, leaving Standalone Lessons at the bottom
  const sortedSeriesNames = Object.keys(groupedLessons).sort((a, b) => {
    if (a === 'Standalone Lessons') return 1;
    if (b === 'Standalone Lessons') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-[#0a0f1c] text-slate-200">
        
      {/* Header section */}
      <div className="mb-8 border-b border-slate-800/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <span>Lessons Manager</span>
            {editingLesson && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono animate-pulse">
                Editing Mode
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {editingLesson 
              ? `Currently editing: "${editingLesson.title}"` 
              : 'Create, edit, and organize lessons, topics, and microservice syllabus.'}
          </p>
        </div>
        
        {editingLesson && (
          <button 
            onClick={cancelEdit}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all text-sm font-semibold"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      
      {serverError && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-300 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">{serverError}</span>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex border-b border-slate-800/80 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'editor'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{editingLesson ? '✏️ Edit Lesson' : '➕ Create Lesson'}</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'list'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📁 Lessons Directory</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            {lessons.length}
          </span>
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === 'editor' ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Editor */}
          <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-xl border border-slate-800/80 space-y-6 backdrop-blur-sm">
            
            {/* Language Switcher */}
            <div className="flex border-b border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'en'
                    ? 'border-emerald-500 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setFormLang('es')}
                className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'es'
                    ? 'border-emerald-500 text-emerald-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Español
              </button>
            </div>

            {formLang === 'en' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lesson Title</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-3 text-white text-base font-semibold transition-all" 
                    placeholder="e.g.: Exploratory Data Analysis with Pandas..." 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Description (Summary)</label>
                  <textarea 
                    required 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-2.5 text-slate-200 text-sm h-20 transition-all" 
                    placeholder="Brief summary of what this lesson is about..." 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Content (Markdown)</label>
                     <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 border border-cyan-800/30 rounded-full">Supports Markdown & Codeblocks</span>
                  </div>
                  <textarea 
                    required 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-4 text-slate-300 font-mono text-sm h-96 transition-all" 
                    placeholder="## Introduction&#10;Here begins your tutorial...&#10;&#10;```python&#10;print('Hello World')&#10;```" 
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Título de la Lección (Spanish)</label>
                  <input 
                    type="text" 
                    value={titleEs} 
                    onChange={(e) => setTitleEs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-3 text-white text-base font-semibold transition-all" 
                    placeholder="Ej: Análisis Exploratorio de Datos con Pandas..." 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resumen / Descripción Corta (Spanish)</label>
                  <textarea 
                    value={descriptionEs} 
                    onChange={(e) => setDescriptionEs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-2.5 text-slate-200 text-sm h-20 transition-all" 
                    placeholder="Resumen de la lección..." 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contenido Principal (Markdown) (Spanish)</label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 border border-cyan-800/30 rounded-full">Soporta Markdown y Bloques de Código</span>
                  </div>
                  <textarea 
                    value={contentEs} 
                    onChange={(e) => setContentEs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-4 text-slate-300 font-mono text-sm h-96 transition-all" 
                    placeholder="## Introducción&#10;Aquí empieza tu tutorial...&#10;&#10;```python&#10;print('Hola Mundo')&#10;```" 
                  />
                </div>
              </>
            )}

            {/* Shared fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Technology</label>
                <input 
                  type="text" 
                  value={technology} 
                  onChange={(e) => setTechnology(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-3 py-2.5 text-white text-sm transition-all" 
                  placeholder="e.g.: React, Python, Docker" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Repo URL (Optional)</label>
                <input 
                  type="text" 
                  value={repoUrl} 
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-3 py-2.5 text-white text-sm transition-all" 
                  placeholder="https://github.com/..." 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Video URL (YouTube/Vimeo) - Optional</label>
              <input 
                type="url" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-4 py-2.5 text-white text-sm transition-all" 
                placeholder="https://www.youtube.com/watch?v=..." 
              />
            </div>
            
            <div className="flex gap-3 lg:hidden pt-4">
              {editingLesson && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Publish Lesson'}
              </button>
            </div>
          </div>
          
          {/* Side Column: Organization */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800/80 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">Organization</h3>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content Type</label>
                  <select 
                    value={lessonType} 
                    onChange={(e) => setLessonType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-3 py-2 text-white text-sm"
                    required
                  >
                    <option value="">-- Select --</option>
                    {lessonTypesList.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Cover Image {editingLesson && <span className="text-[10px] text-slate-500">(Leave empty to keep current)</span>}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs outline-none file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 hover:file:cursor-pointer" 
                  />
                </div>

                <hr className="border-slate-800/80 my-4" />

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parent Topic (Topic)</label>
                  <select 
                    value={selectedTopic} 
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setSelectedSeries(''); 
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">-- Select Topic --</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Belongs to a Series?</label>
                  <select 
                    value={selectedSeries} 
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none rounded-lg px-3 py-2 text-white text-sm disabled:opacity-40"
                    disabled={!selectedTopic}
                  >
                    <option value="">-- Select Series --</option>
                    {filteredSeries.map(series => (
                      <option key={series.id} value={series.id}>{series.name}</option>
                    ))}
                  </select>
                  {!selectedTopic && <p className="text-[10px] text-slate-500 mt-1.5 italic">Select a parent topic first to load series list.</p>}
                </div>

                {selectedSeries && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Step / Order in the Series</label>
                    <input 
                      type="text" 
                      value="Auto-assigned sequentially" 
                      disabled
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-500 text-xs italic outline-none cursor-not-allowed" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 hidden lg:flex">
              {editingLesson && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Publish Lesson'}
              </button>
            </div>
            
          </div>

        </form>
      ) : (
        /* Lessons Directory Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons by title, tech, topic, series..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredLessons.length} of {lessons.length} lessons
            </div>
          </div>

          <div className="space-y-6">
            {loadingLessons ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="p-16 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                No lessons found matching your filters.
              </div>
            ) : (
              sortedSeriesNames.map((seriesName) => (
                <div key={seriesName} className="space-y-4">
                  
                  {/* Section header for each series */}
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-6 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{seriesName}</span>
                    <span className="text-xs font-normal text-slate-500 font-mono">
                      ({groupedLessons[seriesName].length} {groupedLessons[seriesName].length === 1 ? 'lesson' : 'lessons'})
                    </span>
                  </h3>
                  
                  {/* Indented layout for lessons under this series */}
                  <div className="space-y-3 pl-4 border-l border-slate-800/80">
                    {groupedLessons[seriesName].map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-lg hover:shadow-emerald-950/5"
                      >
                        <div className="space-y-2 max-w-2xl min-w-0">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700/50 rounded-full text-xs font-semibold text-emerald-400">
                              {lesson.lesson_type_name || 'Standard'}
                            </span>
                            {lesson.technology && (
                              <span className="px-2.5 py-0.5 bg-cyan-950/20 border border-cyan-800/40 rounded-full text-xs font-mono text-cyan-400">
                                {lesson.technology}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-white leading-snug truncate">
                            {lesson.title}
                          </h3>
                          {lesson.title_es && (
                            <span className="text-xs text-slate-500 block font-mono">ES: {lesson.title_es}</span>
                          )}
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            {lesson.topic_name && (
                              <span className="flex items-center gap-1">
                                <span className="text-slate-600">Topic:</span>
                                <span className="text-slate-300 font-medium">{lesson.topic_name}</span>
                              </span>
                            )}
                            <span className="text-slate-600 font-mono">/{lesson.slug}</span>
                          </div>
                          
                          {lesson.description && (
                            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                              {lesson.description}
                            </p>
                          )}
                          {lesson.description_es && (
                            <p className="text-xs text-slate-500 italic line-clamp-2 mt-0.5">
                              ES: {lesson.description_es}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                          <button
                            onClick={() => startEdit(lesson)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-emerald-950/30 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700 hover:border-emerald-700/50 transition-all text-xs font-semibold"
                            title="Edit Lesson"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.slug, lesson.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-red-950/30 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-700/50 transition-all text-xs font-semibold"
                            title="Delete Lesson"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}