'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastPayload = {
  title?: string;
  message: string;
  tone?: 'success' | 'info' | 'error';
};

type ToastState = ToastPayload & {
  id: number;
};

export function PremiumToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const showToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      if (!detail?.message) return;
      setToast({ id: Date.now(), tone: 'info', ...detail });
    };

    window.addEventListener('hlt-toast', showToast);
    return () => window.removeEventListener('hlt-toast', showToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const success = toast.tone !== 'error';

  return (
    <div className="fixed right-4 top-[calc(var(--site-header-height)+14px)] z-[160] w-[min(calc(100vw-32px),360px)] lg:right-6" role="status" aria-live="polite">
      <div
        key={toast.id}
        className={cn(
          'flex items-start gap-3 rounded-[18px] border bg-pearl/96 p-4 text-navy shadow-[0_22px_58px_rgba(11,27,43,0.22)] backdrop-blur-xl',
          success ? 'border-gold/35' : 'border-red-300/70'
        )}
      >
        <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', success ? 'bg-gold/18 text-gold-dark' : 'bg-red-100 text-red-700')}>
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-black uppercase tracking-[0.14em] text-navy">{toast.title || 'Updated'}</span>
          <span className="mt-1 block text-[13px] font-bold leading-5 text-navy/64">{toast.message}</span>
        </span>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-navy/44 transition hover:bg-navy/5 hover:text-navy"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
