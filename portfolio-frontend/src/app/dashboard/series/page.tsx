// src/app/dashboard/series/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Topic {
  id: number;
  name: string;
}

interface Series {
  id: number;
  name: string;
  name_es?: string;
  slug: string;
  description: string;
  description_es?: string;
  topic: number;
  topic_name?: string;
  image?: string | null;
  repository_url?: string | null;
}

export default function SeriesManagerPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [seriesRes, topicsRes] = await Promise.all([
        fetch(`${API_URL}/series/?raw=true`),
        fetch(`${API_URL}/topics/?raw=true`)
      ]);
      
      if (seriesRes.ok && topicsRes.ok) {
        const sData = await seriesRes.json();
        const tData = await topicsRes.json();
        setSeriesList(sData);
        setTopics(tData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (series: Series) => {
    if (!confirm(`Are you sure you want to edit series "${series.name}"? Unsaved changes in the form will be lost.`)) {
      return;
    }
    setEditingSeries(series);
    setName(series.name);
    setNameEs(series.name_es || '');
    setDescription(series.description || '');
    setDescriptionEs(series.description_es || '');
    setSelectedTopic(series.topic.toString());
    setImageUrl(series.image || null);
    setRepositoryUrl(series.repository_url || '');
    setImageFile(null);
    setFormLang('en');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSeries(null);
    setName('');
    setNameEs('');
    setDescription('');
    setDescriptionEs('');
    setSelectedTopic('');
    setImageUrl(null);
    setImageFile(null);
    setRepositoryUrl('');
    setFormLang('en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem('access_token');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('name_es', nameEs);
    formData.append('description', description);
    formData.append('description_es', descriptionEs);
    formData.append('topic', selectedTopic);
    formData.append('repository_url', repositoryUrl);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingSeries 
        ? `${API_URL}/series/${editingSeries.slug}/` 
        : `${API_URL}/series/`;
      const method = editingSeries ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setName('');
        setNameEs('');
        setDescription('');
        setDescriptionEs('');
        setSelectedTopic('');
        setImageUrl(null);
        setImageFile(null);
        setRepositoryUrl('');
        setEditingSeries(null);
        setFormLang('en');
        fetchData();
      } else {
        alert(editingSeries ? 'Error updating Series' : 'Error creating Series');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string, id: number) => {
    if (!confirm('Are you sure you want to delete this Series? All associated Lessons may be affected.')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/series/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSeriesList(seriesList.filter(s => s.id !== id));
      } else {
        alert('Could not delete Series');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  // Helper to display topic name in the list
  const getTopicName = (topicId: number) => {
    const t = topics.find(t => t.id === topicId);
    return t ? t.name : `Topic #${topicId}`;
  };

  // Filter series list
  const filteredSeries = seriesList.filter(series => {
    const query = searchQuery.toLowerCase();
    const topicName = getTopicName(series.topic).toLowerCase();
    return (
      series.name.toLowerCase().includes(query) ||
      (series.name_es || '').toLowerCase().includes(query) ||
      series.slug.toLowerCase().includes(query) ||
      (series.description || '').toLowerCase().includes(query) ||
      (series.description_es || '').toLowerCase().includes(query) ||
      topicName.includes(query)
    );
  });

  // Group filtered series list by parent Topic name
  const groupedSeries = filteredSeries.reduce((groups, series) => {
    const topicName = getTopicName(series.topic);
    if (!groups[topicName]) {
      groups[topicName] = [];
    }
    groups[topicName].push(series);
    return groups;
  }, {} as Record<string, Series[]>);

  const sortedTopicNames = Object.keys(groupedSeries).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Formulario (Crear/Editar) */}
      <div className="lg:w-1/3">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingSeries ? 'Edit Series' : 'Create New Series'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Parent Topic (Topic)</label>
              <select 
                required
                value={selectedTopic} 
                onChange={e => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">-- Select Topic --</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="flex border-b border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'en'
                    ? 'border-cyan-500 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setFormLang('es')}
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'es'
                    ? 'border-cyan-500 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Español
              </button>
            </div>

            {formLang === 'en' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Series Name</label>
                  <input 
                    type="text" required
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g.: Pandas Course"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Brief description of the series..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Serie (Spanish)</label>
                  <input 
                    type="text"
                    value={nameEs} onChange={e => setNameEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Ej: Curso de Pandas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descripción (Spanish)</label>
                  <textarea 
                    rows={3}
                    value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Descripción breve de la serie..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Repository URL</label>
              <input 
                type="url"
                value={repositoryUrl} onChange={e => setRepositoryUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="https://github.com/.../..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Series Image</label>
              {imageUrl && (
                <div className="mb-2 relative w-full h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                  <img src={imageUrl} alt="Current Series Image" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null);
                      setImageFile(null);
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 transition-colors shadow-md"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImageFile(file);
                    setImageUrl(URL.createObjectURL(file));
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 file:cursor-pointer"
              />
            </div>

            <div className="flex gap-3 mt-4">
              {editingSeries && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={isSaving}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingSeries ? 'Update Series' : 'Create Series'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista Activa */}
      <div className="lg:w-2/3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 border-b border-slate-800/80 pb-4">
          <h2 className="text-xl font-bold text-white">Existing Series</h2>
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search series..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-slate-400">Loading series...</div>
        ) : filteredSeries.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-mono">
            No series found.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTopicNames.map(topicName => (
              <div key={topicName} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-4 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{topicName}</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({groupedSeries[topicName].length} {groupedSeries[topicName].length === 1 ? 'series' : 'series'})
                  </span>
                </h3>
                
                <div className="space-y-4 pl-4 border-l border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedSeries[topicName].map(series => (
                    <div key={series.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 relative group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                              {series.name}
                            </h3>
                            {series.name_es && (
                              <span className="text-xs text-slate-500 block font-mono">ES: {series.name_es}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => startEdit(series)}
                              className="text-slate-500 hover:text-cyan-400 transition-colors"
                              title="Edit Series"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(series.slug, series.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete Series"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-500 mb-1">/{series.slug}</div>
                        {series.repository_url && (
                          <div className="text-xs font-mono text-emerald-400 truncate mb-3">
                            <a href={series.repository_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {series.repository_url}
                            </a>
                          </div>
                        )}
                        <p className="text-sm text-slate-400 line-clamp-3 mb-2">
                          {series.description || 'No description'}
                        </p>
                        {series.description_es && (
                          <p className="text-xs text-slate-500 italic line-clamp-3 mb-4">
                            ES: {series.description_es}
                          </p>
                        )}
                      </div>
                      
                      {series.image && (
                        <div className="h-28 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50 mt-auto">
                          <img src={series.image} alt={series.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) }
      </div>

    </div>
  );
}
