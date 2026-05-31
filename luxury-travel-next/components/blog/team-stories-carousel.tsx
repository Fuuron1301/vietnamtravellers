'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, type WheelEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { teamProfilePath, type TravelersTeamMember } from '@/lib/travelers-team';

export function TeamStoriesCarousel({ members }: { members: TravelersTeamMember[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (members.length === 0) return null;

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth * 0.72, 560),
      behavior: 'smooth'
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const atStart = scroller.scrollLeft <= 0;
    const atEnd = Math.ceil(scroller.scrollLeft + scroller.clientWidth) >= scroller.scrollWidth;
    const movingForward = event.deltaY > 0;
    const canMove = movingForward ? !atEnd : !atStart;

    if (!canMove) return;

    event.preventDefault();
    scroller.scrollLeft += event.deltaY;
  };

  return (
    <Section className="pt-0" width="full">
      <Container width="full" className="px-3 sm:px-5 lg:px-7 xl:px-10">
        <div className="relative isolate overflow-hidden rounded-[34px] bg-navy text-ivory shadow-[0_34px_96px_rgba(11,27,43,0.16)] ring-1 ring-navy/10 md:rounded-[44px]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(248,245,239,0.46),rgba(200,169,106,0.62),transparent)] md:inset-x-14" />
          <div className="relative px-6 py-9 md:px-10 md:py-12 lg:px-14 xl:px-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(200,169,106,0.18),transparent_24%),radial-gradient(circle_at_88%_16%,rgba(248,245,239,0.09),transparent_22%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,rgba(248,245,239,0.18),rgba(200,169,106,0.34),rgba(248,245,239,0.08))] md:inset-x-14" />
            <div className="relative grid gap-8 xl:grid-cols-[minmax(0,820px)_minmax(320px,430px)] xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-gold">
                  More team stories
                </p>
                <h2 className="mt-5 max-w-[12.5ch] font-serif text-[clamp(48px,4.8vw,84px)] font-semibold leading-[0.92] tracking-[-0.065em] text-ivory">
                  Meet the rest of the team.
                </h2>
                <p className="mt-5 max-w-[62rem] text-[16px] font-semibold leading-[1.72] tracking-[-0.014em] text-ivory/72">
                  Browse the people behind the routes, hotel choices and local moments that make every private journey feel personal.
                </p>
              </div>

              <div className="rounded-[30px] border border-ivory/14 bg-ivory/[0.055] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(248,245,239,0.08)] backdrop-blur-sm xl:justify-self-end">
                <div className="flex items-center justify-between gap-8 border-b border-ivory/10 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Team rail</p>
                    <p className="mt-1 text-[13px] font-semibold tracking-[-0.01em] text-ivory/58">
                      {String(members.length).padStart(2, '0')} profiles
                    </p>
                  </div>
                  <span aria-hidden="true" className="font-serif text-[42px] font-semibold leading-none tracking-[-0.08em] text-ivory/22">
                    {String(members.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href="/contact/"
                    className="group inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-gold px-5 pl-6 text-[11px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_14px_34px_rgba(200,169,106,0.22),inset_0_1px_0_rgba(248,245,239,0.38)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none"
                  >
                    Contact us
                    <ArrowUpRight className="h-4 w-4 transition duration-300 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    className="grid h-[50px] w-[50px] place-items-center rounded-full border border-ivory/18 bg-navy/48 text-ivory transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 active:translate-y-0 active:bg-ivory active:text-navy motion-reduce:transition-none"
                    aria-label="Previous team stories"
                  >
                    <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.35} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    className="grid h-[50px] w-[50px] place-items-center rounded-full border border-ivory/18 bg-navy/48 text-ivory transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 active:translate-y-0 active:bg-ivory active:text-navy motion-reduce:transition-none"
                    aria-label="Next team stories"
                  >
                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.35} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-[linear-gradient(180deg,#F9F6EE_0%,#EFE5D1_100%)]">
            <div
              ref={scrollerRef}
              onWheel={handleWheel}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-10 pt-7 [scrollbar-color:#C8A96A_#EFE5D1] [scrollbar-width:thin] motion-reduce:scroll-auto sm:px-6 md:gap-6 md:px-8 md:pb-12 md:pt-8 lg:px-10 xl:px-12"
            >
              {members.map((item, index) => (
                <Link
                  key={item.slug}
                  href={teamProfilePath(item)}
                  aria-label={`Read ${item.name}'s team story`}
                  className="group relative flex min-h-[440px] min-w-[276px] snap-start select-none flex-col overflow-hidden rounded-[30px] border border-[#e4d8c2] bg-[#fbf8f1] text-navy shadow-[0_16px_38px_rgba(11,27,43,0.065)] ring-1 ring-white/80 transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/60 hover:bg-[#fffaf0] hover:shadow-[0_24px_56px_rgba(11,27,43,0.11)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/50 focus-visible:ring-offset-4 focus-visible:ring-offset-champagne active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none sm:min-h-[456px] sm:min-w-[296px] lg:min-h-[474px] lg:min-w-[318px] xl:min-w-[336px]"
                >
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-7 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.58),transparent)] opacity-0 transition duration-300 ease-luxe group-hover:opacity-100" />
                  <span className="block p-3 pb-2">
                    <span className="relative block aspect-[4/3.28] overflow-hidden rounded-[24px] bg-champagne shadow-[0_14px_32px_rgba(11,27,43,0.09)] ring-1 ring-navy/8 transition duration-300 ease-luxe group-hover:ring-gold/40">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        sizes="(min-width: 1440px) 336px, (min-width: 1280px) 318px, (min-width: 640px) 296px, 276px"
                        quality={90}
                        className="object-cover object-center transition duration-700 ease-luxe group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[72px] bg-[linear-gradient(180deg,rgba(248,245,239,0.16),transparent)]" />
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,transparent,rgba(11,27,43,0.20))]" />
                      <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ivory/96 text-[10px] font-extrabold tracking-[0.1em] text-navy shadow-[0_10px_20px_rgba(0,0,0,0.16)] ring-1 ring-gold/40 backdrop-blur-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col px-6 pb-6 pt-3">
                    <span aria-hidden="true" className="mb-4 h-px w-12 bg-gold/55" />
                    <span className="block font-serif text-[clamp(24px,1.9vw,30px)] font-semibold leading-[0.98] tracking-[-0.058em] text-navy">
                      {item.name}
                    </span>
                    <span className="mt-2 block min-h-[30px] text-[10px] font-extrabold uppercase leading-[1.45] tracking-[0.22em] text-gold-dark/90">
                      {item.role}
                    </span>
                    <span className="mt-auto inline-flex min-h-[42px] w-fit items-center gap-2 rounded-full bg-navy px-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ivory shadow-[0_10px_22px_rgba(11,27,43,0.14),inset_0_1px_0_rgba(248,245,239,0.08)] transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy group-hover:shadow-[0_14px_28px_rgba(200,169,106,0.18)]">
                      Read story
                      <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
