'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function AccountSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile fields
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  
  // Custom profile fields
  const [country, setCountry] = useState('');
  const [originalCountry, setOriginalCountry] = useState('');
  const [city, setCity] = useState('');
  const [originalCity, setOriginalCity] = useState('');
  const [tier, setTier] = useState('free');
  const [preferredTrack, setPreferredTrack] = useState('');
  const [originalPreferredTrack, setOriginalPreferredTrack] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [originalGithubUsername, setOriginalGithubUsername] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hasProfileChanges = 
    country !== originalCountry ||
    city !== originalCity ||
    preferredTrack !== originalPreferredTrack ||
    githubUsername !== originalGithubUsername;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username || '');
        setOriginalUsername(data.username || '');
        setEmail(data.email || '');
        setOriginalEmail(data.email || '');
        setCountry(data.country || '');
        setOriginalCountry(data.country || '');
        setCity(data.city || '');
        setOriginalCity(data.city || '');
        setTier(data.tier || 'free');
        setPreferredTrack(data.preferred_track || '');
        setOriginalPreferredTrack(data.preferred_track || '');
        setGithubUsername(data.github_username || '');
        setOriginalGithubUsername(data.github_username || '');
        if (data.date_joined) {
          setDateJoined(new Date(data.date_joined).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }
      } else {
        setError(t('account.error_load'));
      }
    } catch (err) {
      console.error(err);
      setError(t('account.error_conn'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setUpdatingProfile(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          country,
          city,
          preferred_track: preferredTrack || null,
          github_username: githubUsername
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(t('account.success_profile'));
        if (data.username) {
          setUsername(data.username);
          setOriginalUsername(data.username);
        }
        if (data.email) {
          setEmail(data.email);
          setOriginalEmail(data.email);
        }
        setCountry(data.country || '');
        setOriginalCountry(data.country || '');
        setCity(data.city || '');
        setOriginalCity(data.city || '');
        setTier(data.tier || 'free');
        setPreferredTrack(data.preferred_track || '');
        setOriginalPreferredTrack(data.preferred_track || '');
        setGithubUsername(data.github_username || '');
        setOriginalGithubUsername(data.github_username || '');
      } else {
        setError(data.error || t('account.error_update_profile'));
      }
    } catch (err) {
      console.error(err);
      setError(t('account.error_conn'));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t('account.error_password_match'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('account.error_password_length'));
      return;
    }

    setUpdatingPassword(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(t('account.success_password'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || t('account.error_update_password'));
      }
    } catch (err) {
      console.error(err);
      setError(t('account.error_conn'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getTierBadge = (tierName: string) => {
    switch (tierName) {
      case 'premium':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'sponsor':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-slate-800/30 border-slate-700/50 text-slate-400';
    }
  };

  const getTierLabel = (tierName: string) => {
    switch (tierName) {
      case 'premium':
        return t('account.tier_premium');
      case 'sponsor':
        return t('account.tier_sponsor');
      default:
        return t('account.tier_free');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <span className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full"></span>
          <span className="text-slate-400 font-mono text-sm">{t('account.loading_profile')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t('account.title')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t('account.subtitle')}
        </p>
      </div>

      {/* Global Alert Messages */}
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl -z-10" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t('account.profile_info')}</span>
            </h2>

            <div className="space-y-4">
              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <span>{t('account.username')}</span>
                    <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </label>
                  <input 
                    type="text"
                    disabled
                    value={username}
                    className="w-full bg-slate-950/40 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed text-sm select-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <span>{t('account.email')}</span>
                    <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </label>
                  <input 
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-950/40 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed text-sm select-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.country')}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Ecuador, Spain"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.city')}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Guayaquil, Madrid"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* GitHub Username & Preferred Track */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.github')}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. dadejecova"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.track')}
                  </label>
                  <select 
                    value={preferredTrack}
                    onChange={(e) => setPreferredTrack(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  >
                    <option value="">{t('account.select_track')}</option>
                    <option value="frontend">{t('account.track_frontend')}</option>
                    <option value="backend">{t('account.track_backend')}</option>
                    <option value="data_engineering">{t('account.track_data')}</option>
                    <option value="fullstack">{t('account.track_fullstack')}</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-5 border-t border-slate-800/60 flex justify-end">
              <button
                type="submit"
                disabled={updatingProfile || !hasProfileChanges}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md shadow-cyan-500/10"
              >
                {updatingProfile ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>

          {/* Account Metadata / Statistics box */}
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase">{t('account.registration')}</div>
              <div className="text-white font-mono text-sm mt-1">{dateJoined || 'N/A'}</div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-mono text-slate-500 uppercase">{t('account.membership')}</div>
              <span className={`inline-block font-mono text-[10px] font-bold mt-1.5 px-3 py-1 rounded-full border tracking-wide uppercase select-none ${getTierBadge(tier)}`}>
                {getTierLabel(tier)}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password / Security Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleUpdatePassword} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -inset-px bg-gradient-to-b from-purple-500/5 to-transparent rounded-2xl -z-10" />

            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{t('account.change_password')}</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.current_password')}
                  </label>
                  <input 
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-750 focus:outline-none focus:border-purple-500/50 transition-colors text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.new_password')}
                  </label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-750 focus:outline-none focus:border-purple-500/50 transition-colors text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {t('account.confirm_password')}
                  </label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-750 focus:outline-none focus:border-purple-500/50 transition-colors text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800/60 flex justify-end">
              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm shadow-md shadow-purple-500/10"
              >
                {updatingPassword ? t('account.updating') : t('account.update_password')}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
