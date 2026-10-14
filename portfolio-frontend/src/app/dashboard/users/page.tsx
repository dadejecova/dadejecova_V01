'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

interface AnalyticsData {
  countries: Record<string, number>;
  tracks: Record<string, number>;
  tiers: Record<string, number>;
  registrations: { month: string; count: number }[];
}

export default function UserListManagerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.user_id || null);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        if (res.status === 403) {
          setError('You do not have permission to view this page.');
        } else {
          setError('Failed to load users.');
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/analytics/statistics/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    const confirmMsg = `Are you sure you want to ${action} user "${user.username}"?`;
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        // Refresh stats
        fetchAnalytics();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || `Error trying to ${action} user`);
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    }
  };

  const handleDelete = async (user: User) => {
    const confirmMsg = `Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== user.id));
        // Refresh stats
        fetchAnalytics();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || 'Error trying to delete user');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Custom SVG Donut Chart Renderer
  const renderDonutChart = (data: Record<string, number> | undefined, colors: string[]) => {
    if (!data) return <p className="text-slate-500 text-xs italic">No data</p>;
    const entries = Object.entries(data);
    const total = entries.reduce((acc, [_, v]) => acc + v, 0);
    if (total === 0) return <p className="text-slate-500 text-xs italic">No statistics logged yet</p>;

    let accumulatedCircumference = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16

    return (
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="12" />
            {entries.map(([key, val], idx) => {
              const percentage = val / total;
              const strokeLength = circumference * percentage;
              const strokeOffset = circumference - strokeLength + accumulatedCircumference;
              accumulatedCircumference -= strokeLength;
              return (
                <circle
                  key={key}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={colors[idx % colors.length]}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Total</span>
            <span className="text-base font-bold text-white font-mono">{total}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-xs w-full">
          {entries.map(([key, val], idx) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
              </div>
              <span className="text-slate-200 font-mono font-bold">
                {val} <span className="text-slate-500 font-normal">({Math.round((val / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom SVG Line Chart Renderer
  const renderLineChart = (data: { month: string; count: number }[] | undefined, lineColor: string, gradientId: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center border border-slate-800 bg-slate-950/20 rounded-xl">
          <p className="text-slate-500 text-xs italic">No registration history available</p>
        </div>
      );
    }
    const W = 500;
    const H = 180;
    const maxCount = Math.max(...data.map(d => d.count), 5);
    const paddingX = 45;
    const paddingY = 25;

    const chartW = W - paddingX * 2;
    const chartH = H - paddingY * 2;

    const points = data.map((d, idx) => {
      const x = paddingX + (idx / (data.length - 1 || 1)) * chartW;
      const y = paddingY + chartH - (d.count / maxCount) * chartH;
      return { x, y, label: d.month, val: d.count };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${H - paddingY} L ${points[0].x} ${H - paddingY} Z` 
      : '';

    return (
      <div className="w-full relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0"/>
            </linearGradient>
          </defs>
          
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = paddingY + chartH * r;
            const val = Math.round(maxCount * (1 - r));
            return (
              <g key={i} className="opacity-20 font-mono text-[9px] text-slate-500">
                <line x1={paddingX} y1={y} x2={W - paddingX} y2={y} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
                <text x={paddingX - 10} y={y + 3} textAnchor="end">{val}</text>
              </g>
            );
          })}
          
          {/* Area gradient under curve */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Line curve */}
          {pathD && <path d={pathD} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group/node cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3.5" fill="#0b0f19" stroke={lineColor} strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="8" fill={lineColor} className="opacity-0 hover:opacity-20 transition-opacity" />
              
              {/* Point Value Tooltip */}
              <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect x={p.x - 20} y={p.y - 28} width="40" height="18" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x={p.x} y={p.y - 16} textAnchor="middle" fill="#fff" className="font-mono text-[9px] font-bold">{p.val}</text>
              </g>
            </g>
          ))}

          {/* X Axis labels (formatted months) */}
          {points.map((p, idx) => {
            const parts = p.label.split('-');
            const labelStr = parts.length > 1 ? `${parts[1]}/${parts[0].slice(2)}` : p.label;
            return (
              <text key={idx} x={p.x} y={H - 5} textAnchor="middle" className="font-mono text-[8px] text-slate-500" fill="currentColor">
                {labelStr}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl text-center">
          {error}
        </div>
      </div>
    );
  }

  // Calculate location stats
  const totalCountries = analytics ? Object.keys(analytics.countries).length : 0;
  const premiumCount = analytics ? (analytics.tiers.premium || 0) + (analytics.tiers.sponsor || 0) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Registered Users & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your student base and observe registration demographics.
          </p>
        </div>
        
        {/* Toggle Charts Drawer button */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-900/80 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>{showAnalytics ? 'Hide Demographics' : 'Show Demographics'}</span>
        </button>
      </div>

      {/* Analytics widgets grid */}
      {showAnalytics && analytics && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary counters cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute -inset-px bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl -z-10" />
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Total Registrations</span>
                <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{users.length}</h3>
              </div>
              <span className="text-cyan-500/10 text-6xl font-bold font-mono select-none">#1</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute -inset-px bg-gradient-to-b from-purple-500/5 to-transparent rounded-2xl -z-10" />
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Sponsors & Premiums</span>
                <h3 className="text-3xl font-extrabold text-purple-400 mt-1 font-mono">{premiumCount}</h3>
              </div>
              <span className="text-purple-500/10 text-6xl font-bold font-mono select-none">⭐</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute -inset-px bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl -z-10" />
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Active Locations</span>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{totalCountries}</h3>
              </div>
              <span className="text-emerald-500/10 text-6xl font-bold font-mono select-none">🌎</span>
            </div>
          </div>

          {/* Visual Charts Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* User Registration Trend line chart */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -inset-px bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl -z-10" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Student Sign-Ups Trend (12 Months)</span>
                </h4>
                {renderLineChart(analytics.registrations, '#22d3ee', 'blueGrad')}
              </div>
            </div>

            {/* Side distributions cards */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Learning Track preferences donut chart */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -inset-px bg-gradient-to-b from-pink-500/5 to-transparent rounded-2xl -z-10" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  <span>Learning Track Distribution</span>
                </h4>
                {renderDonutChart(analytics.tracks, ['#ec4899', '#3b82f6', '#10b981', '#a855f7'])}
              </div>

              {/* Geographic Student Density list (Relative ratios) */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -inset-px bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl -z-10" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Geographic Student Density</span>
                </h4>
                {Object.keys(analytics.countries).length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No geographic location details shared yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[140px] overflow-y-auto pr-1">
                    {Object.entries(analytics.countries).map(([countryName, count], idx) => {
                      const totalStudents = Object.values(analytics.countries).reduce((a, b) => a + b, 0);
                      const ratio = (count / totalStudents) * 100;
                      return (
                        <div key={countryName} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400 capitalize">{countryName}</span>
                            <span className="text-slate-200 font-bold">{count} students</span>
                          </div>
                          {/* Relative progress fill bar */}
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${ratio}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main user registry table list */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>All Registered Users</span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/30 border border-slate-800 rounded-xl shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6 text-center">Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Date Joined</th>
                  <th className="py-4 px-6">Last Login</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500">#{user.id}</td>
                    <td className="py-4 px-6 font-semibold text-white">{user.username}</td>
                    <td className="py-4 px-6 text-slate-400">{user.email || 'No email provided'}</td>
                    <td className="py-4 px-6 text-center">
                      {user.is_staff ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Student
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400">{formatDate(user.date_joined)}</td>
                    <td className="py-4 px-6 text-slate-400">{formatDate(user.last_login)}</td>
                    <td className="py-4 px-6 text-center">
                      {user.is_staff || user.id === currentUserId ? (
                        <span className="inline-flex items-center text-slate-500" title="Protected account">
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                      ) : (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              user.is_active
                                ? 'border-amber-500/30 text-amber-500/80 hover:bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-500/80 hover:bg-emerald-500/10'
                            }`}
                            title={user.is_active ? 'Deactivate (Block)' : 'Activate (Unblock)'}
                          >
                            {user.is_active ? (
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 border border-red-500/30 text-red-500/80 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
