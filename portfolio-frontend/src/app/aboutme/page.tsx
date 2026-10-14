'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/LanguageContext';

interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar: string | null;
  cv_file: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  email: string | null;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface PersonalProject {
  id: number;
  name: string;
  short_description: string;
  description: string | null;
  image: string | null;
  repository_url: string | null;
  demo_url: string | null;
  technologies: string;
}

export default function AboutMePage() {
  const { t, language } = useTranslation();
  const [data, setData] = useState<{
    profile: Profile | null;
    experiences: Experience[];
    education: Education[];
    projects: PersonalProject[];
  }>({ profile: null, experiences: [], education: [], projects: [] });
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, expRes, eduRes, projRes] = await Promise.all([
          fetch(`${API_URL}/profile/`),
          fetch(`${API_URL}/experiences/`),
          fetch(`${API_URL}/education/`),
          fetch(`${API_URL}/personal-projects/`)
        ]);

        const profileData = profileRes.ok ? await profileRes.json() : [];
        const experiences = expRes.ok ? await expRes.json() : [];
        const education = eduRes.ok ? await eduRes.json() : [];
        const projects = projRes.ok ? await projRes.json() : [];

        const profile = profileData.length > 0 ? profileData[0] : null;

        setData({ profile, experiences, education, projects });
      } catch (error) {
        console.error("Error fetching CV data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { profile, experiences, education, projects } = data;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera / Perfil */}
        <section className="mb-20 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-slate-800 shadow-xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-slate-800 bg-slate-800 flex items-center justify-center shadow-xl">
                <span className="text-4xl text-slate-500">🧑‍💻</span>
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {profile?.name || t('aboutme.default_name')}
              </h1>
              <h2 className="text-xl md:text-2xl text-cyan-400 mt-2 font-light">
                {profile?.title || t('aboutme.default_title')}
              </h2>
              
              <div className="mt-6 text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
                {profile?.bio || t('aboutme.default_bio')}
              </div>

              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                {profile?.cv_file && (
                  <a href={profile.cv_file} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full hover:bg-emerald-500/20 transition-all font-medium text-sm">
                    {t('aboutme.download_cv')}
                  </a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 transition-all font-medium text-sm">
                    {t('aboutme.github')}
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full hover:bg-blue-500/20 transition-all font-medium text-sm">
                    {t('aboutme.linkedin')}
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="px-6 py-2 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 transition-all font-medium text-sm">
                    {t('aboutme.contact')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Proyectos Personales (Portfolio) */}
        {projects.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-purple-500">_</span> {t('aboutme.featured_projects')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: PersonalProject) => (
                <div key={proj.id} className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all">
                  {proj.image && (
                    <div className="h-48 w-full overflow-hidden border-b border-slate-800">
                      <img src={proj.image} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-slate-200 group-hover:text-purple-400 transition-colors">{proj.name}</h4>
                    <p className="mt-2 text-sm text-slate-400">{proj.short_description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {proj.technologies.split(',').map((tech, idx) => (
                        <span key={idx} className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-4">
                      {proj.demo_url && (
                        <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300">
                          {t('aboutme.view_demo')} &rarr;
                        </a>
                      )}
                      {proj.repository_url && (
                        <a href={proj.repository_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-300">
                          {t('aboutme.code')} &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiencia Laboral */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-500">_</span> {t('aboutme.professional_experience')}
          </h3>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {experiences.length > 0 ? experiences.map((exp: Experience, index: number) => (
              <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icono Timeline */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0f1c] bg-slate-800 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-[#0a0f1c] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                </div>
                {/* Contenido */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                    <h4 className="font-bold text-lg text-emerald-400">{exp.position}</h4>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(exp.start_date).getFullYear()} - {exp.is_current ? t('aboutme.present') : new Date(exp.end_date!).getFullYear()}
                    </span>
                  </div>
                  <h5 className="text-sm font-medium text-slate-300 mb-3">{exp.company}</h5>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{exp.description}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 italic pl-14">{t('aboutme.no_experiences')}</p>
            )}
          </div>
        </section>

        {/* Educación */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-emerald-500">_</span> {t('aboutme.education')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.length > 0 ? education.map((edu: Education) => (
              <div key={edu.id} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:border-slate-700 transition-colors">
                <div className="text-xs font-mono text-emerald-500/80 mb-2">
                  {new Date(edu.start_date).getFullYear()} {edu.is_current ? `- ${t('aboutme.present')}` : edu.end_date ? `- ${new Date(edu.end_date).getFullYear()}` : ''}
                </div>
                <h4 className="text-lg font-bold text-slate-200">{edu.degree}</h4>
                <p className="text-slate-400 mt-1">{edu.institution}</p>
                {edu.description && <p className="text-sm text-slate-500 mt-3">{edu.description}</p>}
              </div>
            )) : (
              <p className="text-slate-500 italic">{t('aboutme.no_education')}</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
