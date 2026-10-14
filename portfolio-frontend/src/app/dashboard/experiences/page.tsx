'use client';

import { useState, useEffect } from 'react';

interface Experience {
  id: number;
  company: string;
  position: string;
  position_es?: string;
  description: string;
  description_es?: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

export default function ExperiencesManagerPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [positionEs, setPositionEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [startDate, setStartDate] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch(`${API_URL}/experiences/?raw=true`);
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setCompany(exp.company);
    setPosition(exp.position);
    setPositionEs(exp.position_es || '');
    setDescription(exp.description);
    setDescriptionEs(exp.description_es || '');
    setStartDate(exp.start_date);
    setEndDate(exp.end_date || '');
    setIsCurrent(exp.is_current);
  };

  const cancelEdit = () => {
    setEditingExperience(null);
    setCompany('');
    setPosition('');
    setPositionEs('');
    setDescription('');
    setDescriptionEs('');
    setStartDate('');
    setFormLang('en');
    setEndDate('');
    setIsCurrent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem('access_token');
    
    const payload = {
      company,
      position,
      position_es: positionEs,
      description,
      description_es: descriptionEs,
      start_date: startDate,
      end_date: isCurrent ? null : (endDate || null),
      is_current: isCurrent
    };

    try {
      const url = editingExperience 
        ? `${API_URL}/experiences/${editingExperience.id}/` 
        : `${API_URL}/experiences/`;
      const method = editingExperience ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCompany('');
        setPosition('');
        setPositionEs('');
        setDescription('');
        setDescriptionEs('');
        setStartDate('');
        setFormLang('en');
        setEndDate('');
        setIsCurrent(false);
        setEditingExperience(null);
        fetchExperiences();
      } else {
        const err = await res.json();
        alert(`Error saving: ${JSON.stringify(err)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/experiences/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setExperiences(experiences.filter(e => e.id !== id));
      } else {
        alert('Could not delete');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Formulario (Crear/Editar) */}
      <div className="lg:w-1/3">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingExperience ? 'Edit Experience' : 'Add Experience'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Language Switcher */}
            <div className="flex border-b border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
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
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Company</label>
                  <input 
                    type="text" required
                    value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g.: Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Role / Position</label>
                  <input 
                    type="text" required
                    value={position} onChange={e => setPosition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g.: Senior Frontend Engineer"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Empresa</label>
                  <input 
                    type="text"
                    value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ej: Google (Same as English typically)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rol / Posición (Spanish)</label>
                  <input 
                    type="text"
                    value={positionEs} onChange={e => setPositionEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ej: Ingeniero Frontend Senior"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                <input 
                  type="date" required
                  value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                <input 
                  type="date" 
                  required={!isCurrent}
                  disabled={isCurrent}
                  value={isCurrent ? '' : endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="is_current"
                checked={isCurrent}
                onChange={e => {
                  setIsCurrent(e.target.checked);
                  if (e.target.checked) setEndDate('');
                }}
                className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-slate-300 cursor-pointer">
                I currently work here
              </label>
            </div>
            
            {formLang === 'en' ? (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Description of achievements</label>
                <textarea 
                  rows={4} required
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Developed the main architecture using React..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Descripción de logros (Spanish)</label>
                <textarea 
                  rows={4}
                  value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Desarrollé la arquitectura principal usando React..."
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {editingExperience && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={isSaving}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingExperience ? 'Update Experience' : 'Add Experience'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista Activa */}
      <div className="lg:w-2/3">
        <h2 className="text-xl font-bold text-white mb-6">Your Work History</h2>
        
        {loading ? (
          <div className="text-slate-400">Loading experience...</div>
        ) : experiences.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
            You haven't registered any work experience yet.
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map(exp => (
              <div key={exp.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative group flex gap-4">
                
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-3 h-3 rounded-full ${exp.is_current ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                  <div className="w-px h-full bg-slate-700 mt-2"></div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-emerald-400">
                      {exp.position}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(exp)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-md font-medium text-slate-200 mb-1">{exp.company}</div>
                  
                  <div className="text-xs font-mono text-slate-400 mb-4">
                    {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                  </div>
                  
                  <p className="text-sm text-slate-300 whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
