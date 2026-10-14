'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);

  // Text fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [bio, setBio] = useState('');
  const [bioEs, setBioEs] = useState('');
  const [formLang, setFormLang] = useState<'en' | 'es'>('en');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState('');

  // File fields (only store when user selects a new file)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Previews
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/?raw=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        const p = data[0];
        setProfileId(p.id);
        setName(p.name || '');
        setTitle(p.title || '');
        setTitleEs(p.title_es || '');
        setBio(p.bio || '');
        setBioEs(p.bio_es || '');
        setGithubUrl(p.github_url || '');
        setLinkedinUrl(p.linkedin_url || '');
        setEmail(p.email || '');
        if (p.avatar) setAvatarPreview(p.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('title', title);
    formData.append('title_es', titleEs);
    formData.append('bio', bio);
    formData.append('bio_es', bioEs);
    formData.append('github_url', githubUrl);
    formData.append('linkedin_url', linkedinUrl);
    formData.append('email', email);
    
    if (avatarFile) formData.append('avatar', avatarFile);
    if (cvFile) formData.append('cv_file', cvFile);

    try {
      const url = profileId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/profile/${profileId}/` 
        : `${process.env.NEXT_PUBLIC_API_URL}/profile/`;
        
      const method = profileId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData, // fetch sets correct boundary automatically
      });

      if (res.ok) {
        alert('Profile updated successfully!');
        fetchProfile(); // Refresh
      } else {
        alert('Error saving profile.');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">
        Manage Main Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/50 p-8 rounded-xl border border-slate-800">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🧑‍💻</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Profile Photo</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald-500/10 file:text-emerald-400
                hover:file:bg-emerald-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

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
              <label className="block text-sm font-medium text-slate-300 mb-2">Professional Title</label>
              <input 
                type="text" required
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g.: Full Stack Engineer"
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 mt-4">Biography (About Me)</label>
              <textarea 
                required rows={4}
                value={bio} onChange={e => setBio(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título Profesional (Spanish)</label>
              <input 
                type="text"
                value={titleEs} onChange={e => setTitleEs(e.target.value)}
                placeholder="Ej: Ingeniero Full Stack"
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 mt-4">Biografía (Spanish)</label>
              <textarea 
                rows={4}
                value={bioEs} onChange={e => setBioEs(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </>
        )}

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL</label>
            <input 
              type="url" 
              value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
            <input 
              type="url" 
              value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* CV Document */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">CV Document (PDF)</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={e => setCvFile(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-800 file:text-slate-300
              hover:file:bg-slate-700 transition-all cursor-pointer"
          />
          <p className="mt-2 text-xs text-slate-500">
            Upload your CV in PDF format for visitors to download.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
