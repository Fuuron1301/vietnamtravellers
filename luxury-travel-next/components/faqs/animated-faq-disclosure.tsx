'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqItem = {
  question: string;
  answer: string;
};

export function AnimatedFaqDisclosure({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,#fffaf2_0%,#f7efe2_100%)] shadow-[0_16px_46px_rgba(11,27,43,0.065)] transition duration-500 ease-luxe',
        open ? '-translate-y-1 border-gold/40 shadow-[0_26px_70px_rgba(11,27,43,0.12)]' : 'border-navy/10 hover:-translate-y-0.5 hover:border-gold/28'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-gold/42 to-transparent transition duration-500 ease-luxe',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-[-90px] top-[-120px] h-[220px] w-[220px] rounded-full bg-gold/12 blur-3xl transition duration-700 ease-luxe',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative grid min-h-[82px] w-full cursor-pointer grid-cols-[44px_1fr_42px] items-center gap-4 px-5 py-4 text-left transition duration-300 ease-luxe active:scale-[0.992] sm:grid-cols-[52px_1fr_46px] sm:px-6"
      >
        <span
          className={cn(
            'grid h-10 w-10 place-items-center rounded-full font-serif text-[18px] leading-none tracking-[-0.06em] ring-1 transition duration-500 ease-luxe',
            open
              ? 'scale-105 bg-gold text-navy ring-gold/60 shadow-[0_12px_28px_rgba(200,169,106,0.22)]'
              : 'bg-navy/[0.045] text-gold-dark ring-navy/5'
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'min-w-0 text-[clamp(18px,1.35vw,22px)] font-extrabold leading-[1.16] tracking-[-0.045em] transition duration-500 ease-luxe',
            open ? 'translate-x-1 text-gold-dark' : 'text-navy'
          )}
        >
          {item.question}
        </span>
        <span
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full transition duration-500 ease-luxe',
            open
              ? 'rotate-180 bg-gold text-navy shadow-[0_12px_26px_rgba(200,169,106,0.2)]'
              : 'bg-navy/[0.055] text-navy/58'
          )}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </span>
      </button>
      <div
        id={panelId}
        className={cn(
          'relative grid transition-[grid-template-rows,opacity] duration-500 ease-luxe',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p
            className={cn(
              'border-t border-navy/8 px-6 pb-6 pt-5 text-[15px] font-semibold leading-8 text-navy/64 transition duration-500 ease-luxe sm:pl-[86px] sm:pr-10',
              open ? 'translate-y-0' : '-translate-y-3'
            )}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </article>
  );
}
