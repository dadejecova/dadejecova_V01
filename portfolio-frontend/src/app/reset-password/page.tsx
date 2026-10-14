'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !uid) {
      setMessage({ type: 'error', text: 'Invalid or missing password reset token.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/password-reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          uid,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Your password has been successfully updated! Redirecting to login...',
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to reset password. Link may be expired or invalid.',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Failed to connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !uid) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="text-rose-400 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h3>
        <p className="text-slate-400 text-sm mb-6">
          This password reset link is missing critical parameters or has expired.
        </p>
        <Link href="/forgot-password" className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all text-sm font-medium">
          Request a New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl -z-10" />

      {message && (
        <div
          className={`p-4 rounded-xl text-sm border mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="pass" className="block text-sm font-medium text-slate-300 mb-2">
            New Password
          </label>
          <input
            id="pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
          />
        </div>

        <div>
          <label htmlFor="confirmPass" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm New Password
          </label>
          <input
            id="confirmPass"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-cyan-500/10"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving password...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider hover:text-cyan-400 transition-colors font-mono">
            ~/dadejecova<span className="text-cyan-500">_</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white mt-6 tracking-tight">Create New Password</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Please enter and confirm your new secure account password below.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl flex items-center justify-center min-h-[300px]">
            <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
