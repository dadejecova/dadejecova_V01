'use client';

import { useState, useEffect } from 'react';

interface LessonType {
  id: number;
  name: string;
  name_es?: string;
  slug: string;
}

export default function LessonTypesManagerPage() {
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<LessonType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchLessonTypes();
  }, []);

  const fetchLessonTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/lesson-types/?raw=true`);
      if (res.ok) {
        const data = await res.json();
        setLessonTypes(data);
      }
    } catch (error) {
      console.error('Error fetching lesson types:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (type: LessonType) => {
    if (!confirm(`Are you sure you want to edit lesson type "${type.name}"? Unsaved changes in the form will be lost.`)) {
      return;
    }
    setEditingType(type);
    setName(type.name);
    setNameEs(type.name_es || '');
    setSlug(type.slug);
    setFormLang('en');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingType(null);
    setName('');
    setNameEs('');
    setSlug('');
    setFormLang('en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem('access_token');
    
    const payload = {
      name,
      name_es: nameEs || undefined,
      slug: slug || undefined // Let backend auto-generate slug if empty
    };

    try {
      const url = editingType 
        ? `${API_URL}/lesson-types/${editingType.slug}/` 
        : `${API_URL}/lesson-types/`;
      const method = editingType ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setName('');
        setNameEs('');
        setSlug('');
        setEditingType(null);
        setFormLang('en');
        fetchLessonTypes();
      } else {
        alert(editingType ? 'Error updating Lesson Type' : 'Error creating Lesson Type');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slugToDelete: string, id: number) => {
    if (!confirm('Are you sure you want to delete this Lesson Type? All associated Lessons may be affected.')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/lesson-types/${slugToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLessonTypes(lessonTypes.filter(t => t.id !== id));
      } else {
        alert('Could not delete Lesson Type');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  const filteredTypes = lessonTypes.filter(type => {
    const query = searchQuery.toLowerCase();
    return (
      type.name.toLowerCase().includes(query) ||
      (type.name_es || '').toLowerCase().includes(query) ||
      type.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Form (Create/Edit) */}
      <div className="lg:w-1/3">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingType ? 'Edit Lesson Type' : 'Create Lesson Type'}
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
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input 
                  type="text" required
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g.: Coding Tutorial"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre (Spanish)</label>
                <input 
                  type="text"
                  value={nameEs} onChange={e => setNameEs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Ej: Tutorial de Programación"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Slug (Optional)</label>
              <input 
                type="text"
                value={slug} onChange={e => setSlug(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="e.g.: coding-tutorial"
              />
            </div>

            <div className="flex gap-3 mt-4">
              {editingType && (
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
                {isSaving ? 'Saving...' : editingType ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:w-2/3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 border-b border-slate-800/80 pb-4">
          <h2 className="text-xl font-bold text-white">Lesson Types</h2>
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
              placeholder="Search lesson types..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-slate-400">Loading lesson types...</div>
        ) : filteredTypes.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-mono">
            No lesson types found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTypes.map(type => (
              <div key={type.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 relative group flex flex-col justify-between">
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {type.name}
                    </h3>
                    {type.name_es && (
                      <span className="text-xs text-slate-500 block font-mono">ES: {type.name_es}</span>
                    )}
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(type)}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Edit Lesson Type"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(type.slug, type.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Lesson Type"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-500">/{type.slug}</div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
