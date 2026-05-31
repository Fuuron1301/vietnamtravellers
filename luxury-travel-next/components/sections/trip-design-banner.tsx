'use client';

import type { PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const bannerImage = '/images/collections/tailor-made-private-pool-asia-4k.jpg';

function updateCtaSpotlight(event: PointerEvent<HTMLAnchorElement>) {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty('--cta-x', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--cta-y', `${event.clientY - rect.top}px`);
}

export function TripDesignBanner() {
  return (
    <section id="design-trip-banner" className="relative isolate overflow-hidden bg-navy text-ivory">
      <Image
        src={bannerImage}
        alt=""
        fill
        sizes="100vw"
        quality={100}
        className="object-cover object-[54%_58%] brightness-[0.96] contrast-[1.05] saturate-[1.04]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,26,0.90)_0%,rgba(7,16,26,0.72)_42%,rgba(11,27,43,0.28)_70%,rgba(7,16,26,0.66)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgba(200,169,106,0.28),transparent_28%),radial-gradient(circle_at_16%_18%,rgba(248,245,239,0.14),transparent_24%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gold/40" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gold/30" />

      <div className="relative mx-auto flex min-h-[320px] w-full max-w-[1440px] flex-col justify-center gap-7 px-[clamp(20px,5vw,92px)] py-12 md:min-h-[178px] md:flex-row md:items-center md:justify-between md:py-8">
        <div className="max-w-[32rem]">
          <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold">Private journey design</p>
          <h2 className="mt-3 font-serif text-[clamp(38px,4vw,66px)] font-semibold leading-[0.9] tracking-[-0.06em] text-ivory [text-shadow:0_12px_36px_rgba(0,0,0,0.38)]">
            Begin with intention
          </h2>
          <p className="mt-4 max-w-[30rem] text-[15px] font-semibold leading-7 text-ivory/76 md:text-[16px]">
            Tell us what the journey should feel like. We will shape every stay, transfer and quiet pause around your way of travelling.
          </p>
        </div>

        <div className="group/button-shell w-full max-w-[570px] rounded-full border border-ivory/18 bg-ivory/94 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.34)] ring-1 ring-gold/20 backdrop-blur-sm transition duration-500 ease-luxe hover:border-gold/70 hover:bg-ivory hover:shadow-[0_30px_84px_rgba(0,0,0,0.42)] hover:ring-gold/55">
          <Link
            href="/customize-your-trip/"
            onPointerEnter={updateCtaSpotlight}
            onPointerMove={updateCtaSpotlight}
            className="group/cta relative isolate flex min-h-[64px] w-full items-center justify-between gap-5 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0B1B2B_0%,#142b42_46%,#C8A96A_100%)] px-6 text-[13px] font-black uppercase tracking-[0.18em] text-ivory shadow-[inset_0_1px_0_rgba(248,245,239,0.22),0_16px_34px_rgba(11,27,43,0.24)] transition duration-500 ease-luxe hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(248,245,239,0.35),0_24px_56px_rgba(11,27,43,0.38),0_0_34px_rgba(200,169,106,0.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 sm:px-8"
            aria-label="Craft your journey"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 ease-luxe group-hover/cta:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at var(--cta-x, 50%) var(--cta-y, 50%), rgba(248,245,239,0.34), rgba(200,169,106,0.24) 18%, transparent 42%)'
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/24 opacity-0 blur-2xl transition-opacity duration-300 ease-luxe group-hover/cta:opacity-100"
              style={{ left: 'var(--cta-x, 50%)', top: 'var(--cta-y, 50%)' }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-px w-24 -translate-x-1/2 bg-ivory/70 opacity-0 blur-[1px] transition-opacity duration-300 ease-luxe group-hover/cta:opacity-100"
              style={{ left: 'var(--cta-x, 50%)', top: 'var(--cta-y, 50%)' }}
            />
            <span className="relative z-10 transition-all duration-500 ease-luxe group-hover/cta:tracking-[0.24em] group-hover/cta:text-white">
              Craft your journey
            </span>
            <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ivory text-navy shadow-[0_10px_22px_rgba(0,0,0,0.18)] transition duration-500 ease-luxe group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-1 group-hover/cta:rotate-[18deg] group-hover/cta:bg-gold group-hover/cta:shadow-[0_14px_28px_rgba(0,0,0,0.24)]">
              <ArrowUpRight className="h-5 w-5 transition duration-500 ease-luxe group-hover/cta:scale-110" strokeWidth={2.2} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
