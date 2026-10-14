'use client';

import { useState, useEffect } from 'react';

interface PersonalProject {
  id: number;
  name: string;
  short_description: string;
  short_description_es?: string;
  description: string;
  description_es?: string;
  image: string | null;
  repository_url: string;
  demo_url: string;
  technologies: string;
  order: number;
}

export default function PersonalProjectsManagerPage() {
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [shortDescriptionEs, setShortDescriptionEs] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [order, setOrder] = useState('0');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<PersonalProject | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/personal-projects/?raw=true`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (proj: PersonalProject) => {
    setEditingProject(proj);
    setName(proj.name);
    setShortDescription(proj.short_description);
    setShortDescriptionEs(proj.short_description_es || '');
    setDescription(proj.description || '');
    setDescriptionEs(proj.description_es || '');
    setRepositoryUrl(proj.repository_url || '');
    setDemoUrl(proj.demo_url || '');
    setTechnologies(proj.technologies || '');
    setOrder(proj.order.toString());
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setName('');
    setShortDescription('');
    setShortDescriptionEs('');
    setDescription('');
    setDescriptionEs('');
    setRepositoryUrl('');
    setDemoUrl('');
    setTechnologies('');
    setOrder('0');
    setFormLang('en');
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem('access_token');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('short_description', shortDescription);
    formData.append('short_description_es', shortDescriptionEs);
    formData.append('description', description);
    formData.append('description_es', descriptionEs);
    formData.append('technologies', technologies);
    formData.append('order', order);
    formData.append('repository_url', repositoryUrl);
    formData.append('demo_url', demoUrl);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingProject 
        ? `${API_URL}/personal-projects/${editingProject.id}/` 
        : `${API_URL}/personal-projects/`;
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setName('');
        setShortDescription('');
        setShortDescriptionEs('');
        setDescription('');
        setDescriptionEs('');
        setRepositoryUrl('');
        setDemoUrl('');
        setTechnologies('');
        setOrder('0');
        setFormLang('en');
        setImageFile(null);
        setEditingProject(null);
        fetchProjects();
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
    if (!confirm('Are you sure you want to delete this project from the portfolio?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/personal-projects/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert('Could not delete the project');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8">
      
      {/* Formulario (Crear/Editar) */}
      <div className="xl:w-1/3">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingProject ? 'Edit Project' : 'Add Personal Project'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
              <input 
                type="text" required
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g.: E-commerce Platform"
              />
            </div>

            {/* Language Switcher */}
            <div className="flex border-b border-slate-800 mb-4 mt-4">
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  formLang === 'en'
                    ? 'border-purple-500 text-purple-400 font-bold'
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
                    ? 'border-purple-500 text-purple-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Español
              </button>
            </div>

            {formLang === 'en' ? (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Short Description (Headline)</label>
                <input 
                  type="text" required maxLength={250}
                  value={shortDescription} onChange={e => setShortDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Online B2B sales platform"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descripción Corta (Spanish)</label>
                <input 
                  type="text" maxLength={250}
                  value={shortDescriptionEs} onChange={e => setShortDescriptionEs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Plataforma de ventas B2B online"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Technologies Used</label>
              <input 
                type="text" required
                value={technologies} onChange={e => setTechnologies(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g.: React, Django, Docker, AWS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL GitHub</label>
                <input 
                  type="url" 
                  value={repositoryUrl} onChange={e => setRepositoryUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL Demo</label>
                <input 
                  type="url" 
                  value={demoUrl} onChange={e => setDemoUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="https://mydemo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Image {editingProject && <span className="text-xs text-slate-500">(Leave blank to keep)</span>}
                </label>
                <input 
                  type="file" accept="image/*"
                  onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-500/10 file:text-purple-400
                    hover:file:bg-purple-500/20 transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1" title="0 is the first to appear">Order</label>
                <input 
                  type="number" min="0" required
                  value={order} onChange={e => setOrder(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {formLang === 'en' ? (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Full Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Technical details, challenges overcome..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 mt-4">Descripción Completa (Spanish)</label>
                <textarea 
                  rows={3}
                  value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Detalles técnicos, retos superados..."
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {editingProject && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={isSaving}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista Activa */}
      <div className="xl:w-2/3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Projects Gallery</h2>
          <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        
        {loading ? (
          <div className="text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
            Your portfolio is empty. Upload your first project!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group flex flex-col relative">
                
                {/* Actions overlaid on card */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
                  <button 
                    onClick={() => startEdit(project)}
                    className="p-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-md transition-colors"
                    title="Edit Project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-red-650/80 hover:bg-red-600 text-white rounded-md transition-colors"
                    title="Delete Project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                {/* Image Screenshot */}
                <div className="h-48 w-full bg-slate-800 relative border-b border-slate-700 flex items-center justify-center overflow-hidden">
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  ) : (
                    <div className="text-4xl">🚀</div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-xs font-mono text-slate-300 rounded border border-slate-700">
                    Order: {project.order}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-purple-400 transition-colors mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {project.short_description}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.split(',').map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-md">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                      {project.demo_url ? (
                        <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-sm font-medium rounded-md transition-colors">
                          View Demo
                        </a>
                      ) : (
                        <span className="flex-1 text-center py-2 bg-slate-800 text-slate-500 text-sm font-medium rounded-md cursor-not-allowed">
                          No Demo
                        </span>
                      )}
                      
                      {project.repository_url ? (
                        <a href={project.repository_url} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-md transition-colors">
                          GitHub
                        </a>
                      ) : (
                        <span className="flex-1 text-center py-2 bg-slate-800 text-slate-500 text-sm font-medium rounded-md cursor-not-allowed">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
