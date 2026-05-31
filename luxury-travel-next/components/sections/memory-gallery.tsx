'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Images, X } from 'lucide-react';

import { memories } from './memory-data';

type MemoryGalleryProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  sideNote?: string;
  showViewAll?: boolean;
};

export function MemoryGallery({
  eyebrow = 'Guest memory',
  title = 'Unforgettable Memories',
  description = 'Real journey moments feel less like content and more like keepsakes: a meal, a quiet view, a face lit up by the day.',
  sideNote = 'Sample memories below use legal high-resolution travel imagery. Replace them with your own guest photos whenever you have approved real client images.',
  showViewAll = true
}: MemoryGalleryProps = {}) {
  const [activeAlbum, setActiveAlbum] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const currentAlbum = activeAlbum === null ? null : memories[activeAlbum];
  const currentPhoto = currentAlbum?.photos[activePhoto];

  const closeLightbox = useCallback(() => {
    setActiveAlbum(null);
    setActivePhoto(0);
  }, []);

  const openAlbum = useCallback((index: number) => {
    setActiveAlbum(index);
    setActivePhoto(0);
  }, []);

  const showPrevious = useCallback(() => {
    if (activeAlbum === null) return;

    setActivePhoto((photo) => {
      const total = memories[activeAlbum].photos.length;
      return total <= 1 ? photo : (photo - 1 + total) % total;
    });
  }, [activeAlbum]);

  const showNext = useCallback(() => {
    if (activeAlbum === null) return;

    setActivePhoto((photo) => {
      const total = memories[activeAlbum].photos.length;
      return total <= 1 ? photo : (photo + 1) % total;
    });
  }, [activeAlbum]);

  useEffect(() => {
    if (activeAlbum === null) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeAlbum, closeLightbox, showNext, showPrevious]);

  return (
    <section className="relative w-full overflow-hidden border-y border-navy/10 bg-ivory py-[clamp(56px,7vw,112px)] text-navy">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(200,169,106,0.14),transparent_25%),radial-gradient(circle_at_82%_10%,rgba(11,27,43,0.05),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(11,27,43,0.18)_0.8px,transparent_0.8px)] [background-size:18px_18px]" />
      <div className="relative px-[clamp(18px,4.8vw,92px)]">
        <div className="relative">
          <div className="pointer-events-none absolute right-[-0.06em] top-[-0.28em] hidden font-serif text-[clamp(92px,13vw,230px)] font-black uppercase leading-none tracking-[-0.09em] text-navy/[0.075] lg:block">
            MEMORY
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)] lg:items-end">
            <div className="max-w-[42rem]">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.26em] text-gold-dark" suppressHydrationWarning>{eyebrow}</p>
              <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(42px,5vw,82px)] font-semibold leading-[0.88] tracking-[-0.075em] text-navy" suppressHydrationWarning>
                {title}
              </h2>
              <p className="mt-5 max-w-[38rem] text-[17px] font-bold leading-[1.72] tracking-[-0.02em] text-navy/70 md:text-[20px]" suppressHydrationWarning>
                {description}
              </p>
            </div>
            <div className="relative flex flex-col items-start gap-5 lg:items-end">
              <p className="max-w-[34rem] text-left text-[15px] font-semibold leading-8 text-navy/58 lg:text-right" suppressHydrationWarning>
                {sideNote}
              </p>
              {showViewAll ? (
                <Link
                  href="/guest-memory/"
                  className="inline-flex min-h-[52px] w-fit items-center gap-3 rounded-full border border-navy/12 bg-navy px-6 text-[12px] font-extrabold uppercase tracking-[0.18em] text-ivory shadow-[0_16px_34px_rgba(11,27,43,0.16)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy"
                  suppressHydrationWarning
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="no-scrollbar relative mt-[clamp(32px,4vw,64px)] grid auto-cols-[82vw] grid-flow-col gap-[clamp(12px,1.4vw,22px)] overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-12 md:overflow-visible md:pb-0">
            {memories.map((item, index) => (
              <button
                key={item.cover}
                type="button"
                aria-label={`Open album ${item.label}`}
                onClick={() => openAlbum(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openAlbum(index);
                  }
                }}
                className={`group relative h-[clamp(360px,31vw,560px)] snap-start overflow-hidden rounded-[clamp(22px,2vw,34px)] bg-navy text-left shadow-[0_24px_70px_rgba(11,27,43,0.18)] outline-none transition duration-500 ease-luxe hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-gold/60 ${item.className}`}
              >
                <Image
                  src={item.cover}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1440px) 28vw, (min-width: 768px) 33vw, 82vw"
                  quality={90}
                  priority={index < 2}
                  className="object-cover brightness-[1.04] saturate-[1.06] transition duration-700 ease-luxe group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.04)_22%,rgba(7,21,34,0.16)_48%,rgba(7,21,34,0.72)_100%)]" />
                <span className="absolute right-4 top-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-ivory/22 bg-navy/72 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-ivory shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-sm" suppressHydrationWarning>
                  <Images className="h-4 w-4 text-gold" strokeWidth={2.1} />
                  {item.photos.length === 1 ? '1 photo' : `${item.photos.length} photos`}
                </span>
                <span className="absolute left-4 top-4 rounded-full border border-ivory/20 bg-ivory/92 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_12px_26px_rgba(0,0,0,0.16)]" suppressHydrationWarning>
                  {item.photos.length === 1 ? 'Open photo' : 'Open album'}
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-[clamp(18px,2vw,30px)] text-ivory">
                  <span className="block text-[12px] font-black uppercase tracking-[0.22em] text-gold" suppressHydrationWarning>
                    Memory {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-3 block font-serif text-[clamp(28px,2.7vw,48px)] font-semibold leading-[0.96] tracking-[-0.055em]" suppressHydrationWarning>
                    {item.label}
                  </span>
                  <span className="mt-4 block max-w-[22rem] text-[14px] font-bold leading-[1.55] text-ivory/76" suppressHydrationWarning>
                    {item.note}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentAlbum && currentPhoto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Memory album lightbox"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(5,10,17,0.94)] px-[clamp(12px,3vw,40px)] py-[clamp(12px,3vw,34px)] text-ivory"
          onClick={closeLightbox}
        >
          <div
            className="relative flex h-full w-full max-w-[1440px] flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[54px] items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gold">
                  {String(activePhoto + 1).padStart(2, '0')} / {String(currentAlbum.photos.length).padStart(2, '0')}
                </p>
                <h3 className="mt-1 font-serif text-[clamp(28px,3vw,58px)] font-semibold leading-none tracking-[-0.055em]">
                  {currentAlbum.label}
                </h3>
              </div>
              <button
                type="button"
                autoFocus
                aria-label="Close memory album"
                onClick={closeLightbox}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/16 bg-ivory/10 text-ivory shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition duration-300 ease-luxe hover:bg-ivory hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/55"
              >
                <X className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>

            <div className="relative mt-[clamp(14px,2vw,28px)] min-h-0 flex-1 overflow-hidden rounded-[clamp(18px,2vw,34px)] border border-ivory/12 bg-[rgba(248,245,239,0.04)] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                fill
                sizes="100vw"
                quality={90}
                priority
                className="object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,10,17,0.78))] p-[clamp(18px,3vw,38px)]">
                <p className="max-w-[64rem] text-[15px] font-bold leading-7 text-ivory/86 md:text-[18px]">
                  {currentPhoto.caption}
                </p>
              </div>

              {currentAlbum.photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/18 bg-navy/72 text-ivory shadow-[0_18px_42px_rgba(0,0,0,0.34)] backdrop-blur-sm transition duration-300 ease-luxe hover:bg-ivory hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/55 md:left-6 md:h-14 md:w-14"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/18 bg-navy/72 text-ivory shadow-[0_18px_42px_rgba(0,0,0,0.34)] backdrop-blur-sm transition duration-300 ease-luxe hover:bg-ivory hover:text-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/55 md:right-6 md:h-14 md:w-14"
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={2.15} />
                  </button>
                </>
              ) : null}
            </div>

            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
              {currentAlbum.photos.map((photo, index) => {
                const isActive = index === activePhoto;

                return (
                  <button
                    key={photo.src}
                    type="button"
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setActivePhoto(index)}
                    className={`relative h-[72px] w-[112px] shrink-0 overflow-hidden rounded-2xl border transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/55 md:h-[86px] md:w-[138px] ${
                      isActive
                        ? 'border-gold shadow-[0_12px_30px_rgba(200,169,106,0.28)]'
                        : 'border-ivory/14 opacity-66 hover:border-ivory/42 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="138px"
                      quality={90}
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
