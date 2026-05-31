'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function safeAdminNext(value: string | null) {
  if (!value || typeof window === 'undefined') return '/admin';
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith('/admin')) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Fall back to dashboard for invalid URLs.
  }
  return '/admin';
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const result = await response.json() as { ok?: boolean; error?: { message?: string } };
      if (!response.ok || !result.ok) throw new Error(result.error?.message || 'Login failed');
      window.location.href = safeAdminNext(searchParams.get('next'));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-[20px] w-[320px] border border-[#c3c4c7] bg-white p-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.13)]">
      {error ? <div className="mb-[12px] border border-[#c3c4c7] border-l-[4px] border-l-[#d63638] bg-white px-[12px] py-[10px] text-[13px] text-[#3c434a]">{error}</div> : null}
      <label className="block text-[14px] text-[#3c434a]" htmlFor="admin-login">Username or Email Address</label>
      <input id="admin-login" value={login} onChange={(event) => setLogin(event.target.value)} className="mt-[4px] min-h-[40px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] text-[18px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" autoComplete="username" />
      <label className="mt-[14px] block text-[14px] text-[#3c434a]" htmlFor="admin-password">Password</label>
      <input id="admin-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-[4px] min-h-[40px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] text-[18px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" type="password" autoComplete="current-password" />
      <div className="mt-[18px] flex items-center justify-between">
        <label className="flex items-center gap-[6px] text-[13px] text-[#50575e]"><input type="checkbox" /> Remember Me</label>
        <button type="submit" disabled={loading} className="min-h-[32px] rounded-[3px] border border-[#2271b1] bg-[#2271b1] px-[12px] text-[13px] leading-7 text-white shadow-[0_1px_0_#135e96] hover:border-[#135e96] hover:bg-[#135e96] disabled:opacity-60">{loading ? 'Logging in...' : 'Log In'}</button>
      </div>
    </form>
  );
}
