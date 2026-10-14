'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Experience {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  is_current: boolean;
}

export default function CVManagerPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Nuevo estado para capturar errores exactos del backend
  const [serverError, setServerError] = useState(''); 
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/experiences/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error("Error obtaining data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setServerError('');
    setCompany(exp.company);
    setPosition(exp.position);
    setStartDate(exp.start_date);
    setEndDate(exp.end_date || '');
    setIsCurrent(exp.is_current);
    setDescription(exp.description);
  };

  const cancelEdit = () => {
    setEditingExperience(null);
    setServerError('');
    setCompany('');
    setPosition('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    
    // Construcción dinámica del payload
    const payload: any = {
      company,
      position,
      start_date: startDate,
      description,
      is_current: isCurrent
    };

    // Solo adjuntamos end_date si NO es el trabajo actual y tiene un valor
    if (!isCurrent && endDate) {
      payload.end_date = endDate;
    } else if (!isCurrent && !endDate) {
      setServerError("Please enter an end date or check 'I currently work here'.");
      setIsSaving(false);
      return;
    } else {
      payload.end_date = null;
    }

    try {
      const url = editingExperience 
        ? `${API_URL}/experiences/${editingExperience.id}/` 
        : `${API_URL}/experiences/`;
      const method = editingExperience ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Éxito: Limpiamos todo
        setCompany('');
        setPosition('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        setIsCurrent(false);
        setEditingExperience(null);
        fetchExperiences(); 
      } else {
        const errorData = await response.json();
        console.error("Error from backend:", errorData);
        setServerError(JSON.stringify(errorData)); 
      }
    } catch (error) {
      setServerError("Connection error with the server. Is Docker running?");
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
        setExperiences(experiences.filter(exp => exp.id !== id));
      } else {
        alert('Could not delete experience');
      }
    } catch (error) {
      console.error('Error deleting', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            CV Manager
          </h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors text-sm border border-gray-700 px-4 py-2 rounded"
          >
            &larr; Back to Panel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h2 className="text-xl font-semibold mb-6">
              {editingExperience ? 'Edit Experience' : 'Add Experience'}
            </h2>
            
            {/* ALERT DE ERRORES */}
            {serverError && (
              <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md text-sm">
                <strong>Server error:</strong> {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-gray-700 border-0 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g.: Interagua / Veolia" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <input type="text" required value={position} onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-gray-700 border-0 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g.: Technical Analyst" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-700 border-0 rounded-md px-3 py-2 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input type="date" required={!isCurrent} disabled={isCurrent} value={isCurrent ? '' : endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-700 border-0 rounded-md px-3 py-2 text-white text-sm disabled:opacity-50 outline-none" />
                </div>
              </div>

              <div className="flex items-center mt-2">
                <input type="checkbox" id="isCurrent" checked={isCurrent} 
                  onChange={(e) => {
                    setIsCurrent(e.target.checked);
                    if (e.target.checked) setEndDate('');
                  }}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800" />
                <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-400 cursor-pointer">
                  I currently work here
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description / Achievements</label>
                <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-700 border-0 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="Detail your responsibilities..." />
              </div>

              <div className="flex gap-3">
                {editingExperience && (
                  <button type="button" onClick={cancelEdit}
                    className="flex-1 bg-gray-700 hover:bg-gray-650 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : editingExperience ? 'Update Experience' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Lista de Experiencias */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Registered History</h2>
            {loading ? (
              <p className="text-gray-400">Loading data...</p>
            ) : experiences.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
                You haven't registered any experience yet.
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-emerald-500/50 transition-colors relative group">
                    {exp.is_current && (
                      <span className="absolute top-4 right-16 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">Current</span>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => startEdit(exp)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Edit Experience"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Experience"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white">{exp.position}</h3>
                    <p className="text-emerald-400 font-medium">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    </p>
                    <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}