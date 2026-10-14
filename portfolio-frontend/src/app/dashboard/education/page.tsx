'use client';

import { useState, useEffect } from 'react';

interface Education {
  id: number;
  institution: string;
  degree: string;
  degree_es?: string;
  description: string;
  description_es?: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

export default function EducationManagerPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [degreeEs, setDegreeEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [startDate, setStartDate] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const res = await fetch(`${API_URL}/education/?raw=true`);
      if (res.ok) {
        const data = await res.json();
        setEducations(data);
      }
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (edu: Education) => {
    setEditingEducation(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setDegreeEs(edu.degree_es || '');
    setDescription(edu.description || '');
    setDescriptionEs(edu.description_es || '');
    setStartDate(edu.start_date);
    setEndDate(edu.end_date || '');
    setIsCurrent(edu.is_current);
  };

  const cancelEdit = () => {
    setEditingEducation(null);
    setInstitution('');
    setDegree('');
    setDegreeEs('');
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
      institution,
      degree,
      degree_es: degreeEs,
      description,
      description_es: descriptionEs,
      start_date: startDate,
      end_date: isCurrent ? null : (endDate || null),
      is_current: isCurrent
    };

    try {
      const url = editingEducation 
        ? `${API_URL}/education/${editingEducation.id}/` 
        : `${API_URL}/education/`;
      const method = editingEducation ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setInstitution('');
        setDegree('');
        setDegreeEs('');
        setDescription('');
        setDescriptionEs('');
        setStartDate('');
        setFormLang('en');
        setEndDate('');
        setIsCurrent(false);
        setEditingEducation(null);
        fetchEducation();
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
    if (!confirm('Are you sure you want to delete this educational record?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/education/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setEducations(educations.filter(e => e.id !== id));
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
            {editingEducation ? 'Edit Education' : 'Add Education'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Language Switcher */}
            <div className="flex border-b border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'en'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
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
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Español
              </button>
            </div>

            {formLang === 'en' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Institution / University</label>
                  <input 
                    type="text" required
                    value={institution} onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g.: MIT University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Degree Obtained</label>
                  <input 
                    type="text" required
                    value={degree} onChange={e => setDegree(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g.: Software Engineering"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Institución / Universidad</label>
                  <input 
                    type="text"
                    value={institution} onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ej: MIT University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Título Obtenido (Spanish)</label>
                  <input 
                    type="text"
                    value={degreeEs} onChange={e => setDegreeEs(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ej: Ingeniería de Software"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                <input 
                  type="date" 
                  required={!isCurrent}
                  disabled={isCurrent}
                  value={isCurrent ? '' : endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
                className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-slate-300 cursor-pointer">
                I currently study here
              </label>
            </div>
            
            {formLang === 'en' ? (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Details (Optional)</label>
                <textarea 
                  rows={3}
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Honors, thesis, etc..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Detalles (Opcional, Spanish)</label>
                <textarea 
                  rows={3}
                  value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Honores, tesis, etc..."
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {editingEducation && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={isSaving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingEducation ? 'Update Education' : 'Add Education'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista Activa */}
      <div className="lg:w-2/3">
        <h2 className="text-xl font-bold text-white mb-6">Your Academic Background</h2>
        
        {loading ? (
          <div className="text-slate-400">Loading education...</div>
        ) : educations.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
            You haven't registered any academic background yet.
          </div>
        ) : (
          <div className="space-y-4">
            {educations.map(edu => (
              <div key={edu.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative group flex gap-4">
                
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-3 h-3 rounded-full ${edu.is_current ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-600'}`}></div>
                  <div className="w-px h-full bg-slate-700 mt-2"></div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-indigo-400">
                      {edu.degree}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(edu)}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(edu.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-md font-medium text-slate-200 mb-1">{edu.institution}</div>
                  
                  <div className="text-xs font-mono text-slate-400 mb-4">
                    {edu.start_date} — {edu.is_current ? 'Present' : edu.end_date}
                  </div>
                  
                  {edu.description && (
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
