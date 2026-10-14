// src/app/dashboard/topics/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Topic {
  id: number;
  name: string;
  name_es?: string;
  slug: string;
  description: string;
  description_es?: string;
  image: string | null;
}

export default function TopicsManagerPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_URL}/topics/?raw=true`);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (topic: Topic) => {
    if (!confirm(`Are you sure you want to edit topic "${topic.name}"? Unsaved changes in the form will be lost.`)) {
      return;
    }
    setEditingTopic(topic);
    setName(topic.name);
    setNameEs(topic.name_es || '');
    setDescription(topic.description || '');
    setDescriptionEs(topic.description_es || '');
    setImageFile(null);
    setFormLang('en');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setName('');
    setNameEs('');
    setDescription('');
    setDescriptionEs('');
    setImageFile(null);
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
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingTopic 
        ? `${API_URL}/topics/${editingTopic.slug}/` 
        : `${API_URL}/topics/`;
      const method = editingTopic ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        // Reset form
        setName('');
        setNameEs('');
        setDescription('');
        setDescriptionEs('');
        setImageFile(null);
        setEditingTopic(null);
        setFormLang('en');
        // Refresh list
        fetchTopics();
      } else {
        alert(editingTopic ? 'Error updating Topic' : 'Error creating Topic');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string, id: number) => {
    if (!confirm('Are you sure you want to delete this Topic? This will affect all related Series and Lessons.')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/topics/${slug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setTopics(topics.filter(t => t.id !== id));
      } else {
        alert('Could not delete Topic');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const query = searchQuery.toLowerCase();
    return (
      topic.name.toLowerCase().includes(query) ||
      (topic.name_es || '').toLowerCase().includes(query) ||
      topic.slug.toLowerCase().includes(query) ||
      (topic.description || '').toLowerCase().includes(query) ||
      (topic.description_es || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Formulario (Crear/Editar) */}
      <div className="lg:w-1/3">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingTopic ? 'Edit Topic' : 'Create New Topic'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Topic Name</label>
                  <input 
                    type="text" required
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g.: Python"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Brief description of the topic..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Tema (Spanish)</label>
                  <input 
                    type="text"
                    value={nameEs} onChange={e => setNameEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Ej: Python"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descripción (Spanish)</label>
                  <textarea 
                    rows={3}
                    value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Descripción breve del tema..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Image (Icon) {editingTopic && <span className="text-xs text-slate-500">(Leave blank to keep existing)</span>}
              </label>
              <input 
                type="file" accept="image/*"
                onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-cyan-500/10 file:text-cyan-400
                  hover:file:bg-cyan-500/20 transition-all cursor-pointer"
              />
            </div>

            <div className="flex gap-3 mt-4">
              {editingTopic && (
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
                {isSaving ? 'Saving...' : editingTopic ? 'Update Topic' : 'Create Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista Activa */}
      <div className="lg:w-2/3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 border-b border-slate-800/80 pb-4">
          <h2 className="text-xl font-bold text-white">Existing Topics</h2>
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
              placeholder="Search topics by name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-slate-400">Loading topics...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-mono">
            No topics found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map(topic => (
              <div key={topic.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 relative group flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {topic.name}
                    </h3>
                    {topic.name_es && (
                      <span className="text-xs text-slate-500 block font-mono">ES: {topic.name_es}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(topic)}
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                      title="Edit Topic"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(topic.slug, topic.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Topic"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-500 mb-3">/{topic.slug}</div>
                <p className="text-sm text-slate-400 flex-1 line-clamp-2">
                  {topic.description || 'No description'}
                </p>
                {topic.description_es && (
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                    ES: {topic.description_es}
                  </p>
                )}
                {topic.image && (
                  <div className="mt-4 w-10 h-10 rounded overflow-hidden bg-slate-900 border border-slate-700">
                    <img src={topic.image} alt={topic.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
