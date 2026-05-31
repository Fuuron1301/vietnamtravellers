'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Facebook, Link2, Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BlogTocItem = {
  id: string;
  heading: string;
  summary: string;
  index: number;
  children?: Array<{
    id: string;
    heading: string;
    summary: string;
    index: number;
  }>;
};

type BlogRailProps = {
  items: BlogTocItem[];
  title: string;
};

type ShareAction = 'facebook' | 'whatsapp' | 'mail' | 'copy';

const shareActions: Array<{
  action: ShareAction;
  label: string;
  icon: typeof Facebook;
}> = [
  { action: 'facebook', label: 'Share on Facebook', icon: Facebook },
  { action: 'whatsapp', label: 'Share on WhatsApp', icon: MessageCircle },
  { action: 'mail', label: 'Share by email', icon: Mail },
  { action: 'copy', label: 'Copy link', icon: Link2 }
];

function getShareUrl(action: ShareAction, pageUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  switch (action) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    case 'mail':
      return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
    default:
      return pageUrl;
  }
}

export function BlogRail({ items, title }: BlogRailProps) {
  const flatItems = useMemo(() => items.flatMap((item) => [item, ...(item.children ?? [])]), [items]);
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [copied, setCopied] = useState(false);
  const activeChapter = items.find((item) => item.id === activeId || item.children?.some((child) => child.id === activeId)) ?? items[0];
  const activeIndex = activeChapter?.index ?? 0;
  const nextChapter = items[activeIndex + 1];
  const progress = items.length ? Math.round(((activeIndex + 1) / items.length) * 100) : 0;

  useEffect(() => {
    if (!flatItems.length) return;

    let frame = 0;
    const updateActive = () => {
      const threshold = Math.max(112, window.innerHeight * 0.26);
      let current = flatItems[0]?.id ?? '';

      for (const item of flatItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top - threshold <= 0) current = item.id;
        else break;
      }

      setActiveId((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('hashchange', onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('hashchange', onScroll);
    };
  }, [flatItems]);

  const handleShare = async (action: ShareAction) => {
    const url = window.location.href;
    if (!url) return;

    if (action === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {
        setCopied(false);
      }
      return;
    }

    window.open(getShareUrl(action, url, title), '_blank', 'noopener,noreferrer');
  };

  return (
    <aside className="lg:sticky lg:top-[126px] lg:self-start">
      <div className="hidden lg:block">
        <section className="rounded-[34px] border border-navy/10 bg-[linear-gradient(180deg,#fffaf3_0%,#f2e8d8_100%)] p-[20px] shadow-[0_20px_54px_rgba(11,27,43,0.09)]">
          <div className="border-b border-navy/10 pb-[20px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-gold-dark">Reading map</p>
                <p className="mt-2 max-w-[20ch] text-[13px] font-extrabold leading-6 tracking-[-0.02em] text-navy/76">
                  Follow the guide from chapter to detail.
                </p>
              </div>
              <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-navy text-[11px] font-black text-gold shadow-[0_12px_24px_rgba(11,27,43,0.18)]">
                {String(activeIndex + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
              </span>
            </div>
            <div className="mt-[18px] h-[6px] overflow-hidden rounded-full bg-navy/8">
              <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-luxe" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <nav aria-label="Article table of contents" className="mt-[20px]">
            <ol className="grid gap-[10px]">
              {items.map((item) => {
                const isActiveBranch = item.id === activeId || Boolean(item.children?.some((child) => child.id === activeId));
                const isCompleted = item.index < activeIndex;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActiveBranch ? 'true' : undefined}
                      className={cn(
                        'group grid grid-cols-[42px_minmax(0,1fr)] gap-[12px] rounded-[24px] px-[12px] py-[14px] transition duration-300 ease-luxe',
                        isActiveBranch
                          ? 'bg-navy text-ivory shadow-[0_18px_36px_rgba(11,27,43,0.2)] ring-1 ring-gold/25'
                          : isCompleted
                            ? 'bg-[#fffaf1] text-navy ring-1 ring-gold/16'
                            : 'text-navy/62 hover:bg-[#fffaf1] hover:text-navy'
                      )}
                    >
                      <span className="relative flex justify-center">
                        <span
                          className={cn(
                            'grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border text-[10px] font-black transition duration-300 ease-luxe',
                            isActiveBranch
                              ? 'border-gold bg-gold text-navy'
                              : isCompleted
                                ? 'border-gold/35 bg-gold/15 text-gold-dark'
                                : 'border-navy/10 bg-[#fffdf8] text-navy/46 group-hover:border-gold/35 group-hover:text-gold-dark'
                          )}
                        >
                          {String(item.index + 1).padStart(2, '0')}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          {isActiveBranch ? <span className="rounded-full bg-ivory/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-gold">Now</span> : null}
                          {isCompleted && !isActiveBranch ? <span className="rounded-full bg-gold/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-gold-dark">Read</span> : null}
                        </span>
                        <span className="mt-1 block break-words text-[13px] font-black leading-[1.36] tracking-[-0.025em]">{item.heading}</span>
                        <span className={cn('mt-1 block text-[11px] font-semibold leading-[1.5]', isActiveBranch ? 'text-ivory/64' : 'text-navy/44')}>
                          {item.summary}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          {activeChapter?.children?.length ? (
            <section className="mt-[18px] rounded-[26px] border border-gold/22 bg-[#fffaf1] p-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="flex items-center gap-[10px]">
                <span className="h-px w-[32px] bg-gold/45" />
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-dark">Inside chapter {String(activeIndex + 1).padStart(2, '0')}</p>
              </div>
              <ol className="mt-[12px] grid gap-1">
                {activeChapter.children.map((child) => {
                  const isChildActive = child.id === activeId;
                  return (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        aria-current={isChildActive ? 'true' : undefined}
                        className={cn(
                          'grid grid-cols-[30px_minmax(0,1fr)] gap-[10px] rounded-[18px] px-[10px] py-[10px] transition duration-300 ease-luxe',
                          isChildActive ? 'bg-navy text-ivory shadow-[0_10px_22px_rgba(11,27,43,0.16)]' : 'text-navy/62 hover:bg-ivory hover:text-navy'
                        )}
                      >
                        <span className={cn('grid h-[24px] w-[24px] place-items-center rounded-full text-[9px] font-black', isChildActive ? 'bg-gold text-navy' : 'bg-gold/14 text-gold-dark')}>
                          {String(child.index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 break-words text-[12px] font-extrabold leading-[1.42] tracking-[-0.02em]">{child.heading}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {nextChapter ? (
            <a href={`#${nextChapter.id}`} className="mt-[18px] flex items-center justify-between gap-[12px] rounded-[24px] border border-navy/10 bg-[#fffdf8] px-4 py-[14px] text-navy transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/35 hover:text-gold-dark">
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-gold-dark">Next chapter</span>
                <span className="mt-1 block text-[13px] font-black leading-[1.35] tracking-[-0.02em]">{nextChapter.heading}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </a>
          ) : null}

          <div className="mt-[18px] border-t border-navy/10 pt-[18px]">
            <div className="flex items-center justify-between gap-[12px]">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark">Share</p>
              {copied ? (
                <p aria-live="polite" className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-navy/46">
                  Copied
                </p>
              ) : null}
            </div>
            <div className="mt-[12px] grid grid-cols-4 gap-2">
              {shareActions.map(({ action, label, icon: Icon }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => void handleShare(action)}
                  className="grid aspect-square min-h-[42px] place-items-center rounded-full border border-navy/10 bg-[#fffaf1] text-navy/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/45 hover:bg-ivory hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-[20px] lg:hidden">
        <details className="rounded-[28px] border border-navy/10 bg-[#fffaf3] px-4 py-4 shadow-[0_14px_34px_rgba(11,27,43,0.08)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-dark">
            <span>Reading map</span>
            <span className="grid h-[36px] w-[36px] place-items-center rounded-full bg-navy text-[11px] font-black text-gold">{activeIndex + 1}/{items.length}</span>
          </summary>
          <div className="mt-[16px] h-[6px] overflow-hidden rounded-full bg-navy/8">
            <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-luxe" style={{ width: `${progress}%` }} />
          </div>
          <ol className="mt-[18px] grid gap-2">
            {items.map((item) => {
              const isActiveBranch = item.id === activeId || Boolean(item.children?.some((child) => child.id === activeId));
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActiveBranch ? 'true' : undefined}
                    className={cn(
                      'grid grid-cols-[34px_minmax(0,1fr)] gap-[12px] rounded-[18px] px-[12px] py-[12px] text-[14px] font-bold leading-[1.45] tracking-[-0.02em] transition duration-200 ease-luxe',
                      isActiveBranch ? 'bg-navy text-ivory shadow-[0_10px_24px_rgba(11,27,43,0.16)]' : 'border border-navy/10 bg-[#fffaf1] text-navy/74'
                    )}
                  >
                    <span className={cn('grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border text-[10px] font-black transition duration-200 ease-luxe', isActiveBranch ? 'border-gold bg-gold text-navy' : 'border-navy/10 bg-ivory text-navy/54')}>
                      {String(item.index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words">{item.heading}</span>
                      <span className={cn('mt-1 block text-[11px] font-medium leading-5', isActiveBranch ? 'text-ivory/68' : 'text-navy/52')}>
                        {item.summary}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </details>
      </div>
    </aside>
  );
}
