import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Images, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { MemoryGallery } from '@/components/sections/memory-gallery';
import { memories, memoryPhotoTotal } from '@/components/sections/memory-data';

export const metadata: Metadata = {
  title: 'Guest Memory Gallery',
  description: 'Browse curated guest memory albums and sample travel imagery for private Southeast Asia journeys.'
};

const featuredMemory = memories[0];

const archiveNotes = [
  'Group approved client images by trip mood, not only by destination.',
  'Use each album as a story cue for sales follow-up and tailor-made route ideas.',
  'Keep sample imagery until real guest photos are legally approved for public use.'
];

function MemoryHero() {
  return (
    <section className="relative overflow-hidden bg-navy pb-12 pt-[104px] text-ivory md:pb-16 md:pt-[112px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(200,169,106,0.28),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(248,245,239,0.12),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(248,245,239,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(248,245,239,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <Container width="page" className="relative">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="flex min-h-[500px] flex-col justify-between rounded-[38px] border border-ivory/10 bg-ivory/[0.055] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.2)] md:p-8 xl:p-10">
            <div>
              <Link href="/" className="inline-flex w-fit items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-ivory/70 transition duration-300 ease-luxe hover:text-gold">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-ivory/16 bg-ivory/8">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                Home
              </Link>
              <p className="mt-8 text-[12px] font-black uppercase tracking-[0.32em] text-gold">Guest memory archive</p>
              <h1 className="mt-4 max-w-[10ch] font-serif text-[clamp(42px,5vw,74px)] font-semibold leading-[0.94] tracking-[-0.07em] text-ivory">
                Memory albums, opened wider.
              </h1>
              <p className="mt-5 max-w-[42rem] text-[16px] font-bold leading-[1.72] tracking-[-0.02em] text-ivory/72 md:text-[18px]">
                A calmer viewmore page for the homepage memories: every album, every sample photo, and a clear route back to a tailor-made journey.
              </p>
            </div>

            <div className="mt-8 grid w-full max-w-[520px] gap-3 sm:grid-cols-2">
              <Link
                href="#memory-albums"
                className="group relative min-h-[76px] overflow-hidden rounded-[24px] border border-gold/45 bg-[linear-gradient(135deg,rgba(200,169,106,0.98),rgba(232,209,160,0.92))] p-4 text-navy shadow-[0_16px_30px_rgba(200,169,106,0.14)] transition duration-300 ease-luxe hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(200,169,106,0.18)]"
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-ivory/16 transition duration-300 ease-luxe group-hover:scale-125" />
                <span className="relative flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.22em]">Browse albums</span>
                    <span className="mt-2 block text-[13px] font-extrabold leading-5 tracking-[-0.02em] text-navy/62">View all albums</span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-ivory transition duration-300 ease-luxe group-hover:bg-ivory group-hover:text-navy">
                    <Images className="h-[15px] w-[15px]" />
                  </span>
                </span>
              </Link>
              <Link
                href="/customize-your-trip/"
                className="group relative min-h-[76px] overflow-hidden rounded-[24px] border border-ivory/18 bg-ivory/[0.045] p-4 text-ivory transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/60 hover:bg-ivory/[0.075] hover:shadow-[0_18px_42px_rgba(0,0,0,0.16)]"
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border border-ivory/10 transition duration-300 ease-luxe group-hover:border-gold/40" />
                <span className="relative flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.22em]">Create yours</span>
                    <span className="mt-2 block text-[13px] font-extrabold leading-5 tracking-[-0.02em] text-ivory/58">Start your brief</span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ivory/18 bg-ivory/8 text-ivory transition duration-300 ease-luxe group-hover:border-gold group-hover:bg-gold group-hover:text-navy">
                    <ArrowUpRight className="h-[15px] w-[15px]" />
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[500px] overflow-hidden rounded-[38px] bg-champagne shadow-[0_30px_96px_rgba(0,0,0,0.3)] ring-1 ring-ivory/12">
            <Image
              src={featuredMemory.cover}
              alt={featuredMemory.alt}
              fill
              priority
              sizes="(min-width: 1280px) 58vw, 100vw"
              quality={96}
              className="object-cover brightness-[0.95] contrast-[1.06] saturate-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02)_0%,rgba(7,21,34,0.18)_48%,rgba(7,21,34,0.78)_100%)]" />
            <div className="absolute left-6 top-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-ivory/18 bg-ivory/92 px-5 text-[12px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
              <Sparkles className="h-4 w-4 text-gold-dark" />
              Featured memory
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
              <p className="text-[12px] font-black uppercase tracking-[0.26em] text-gold">{String(memories.length).padStart(2, '0')} albums / {String(memoryPhotoTotal).padStart(2, '0')} photos</p>
              <h2 className="mt-3 max-w-[12ch] font-serif text-[clamp(32px,3.5vw,54px)] font-semibold leading-[0.96] tracking-[-0.06em] text-ivory">
                {featuredMemory.label}
              </h2>
              <p className="mt-4 max-w-[32rem] text-[15px] font-bold leading-[1.65] text-ivory/76 md:text-[17px]">
                {featuredMemory.note}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-ivory md:grid-cols-3">
          {archiveNotes.map((note, index) => (
            <div key={note} className="min-h-[118px] rounded-[26px] border border-ivory/12 bg-ivory/[0.075] p-5 shadow-[0_16px_46px_rgba(0,0,0,0.14)] md:p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gold">Archive note {String(index + 1).padStart(2, '0')}</p>
              <p className="mt-4 text-[14px] font-bold leading-7 text-ivory/76">{note}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function MemoryCta() {
  return (
    <section className="relative overflow-hidden bg-ivory py-20 text-navy md:py-28">
      <Container width="page">
        <div className="grid overflow-hidden rounded-[46px] border border-navy/10 bg-[linear-gradient(135deg,#0b1b2b_0%,#17324a_100%)] text-ivory shadow-[0_30px_86px_rgba(11,27,43,0.18)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="p-8 md:p-12 xl:p-14">
            <p className="text-[13px] font-black uppercase tracking-[0.32em] text-gold">Turn memories into route design</p>
            <h2 className="mt-5 max-w-[11ch] font-serif text-[clamp(36px,4vw,62px)] font-semibold leading-[0.94] tracking-[-0.06em] text-ivory">
              Make the next album yours.
            </h2>
          </div>
          <div className="flex flex-col justify-center gap-7 border-t border-ivory/10 p-8 md:p-12 lg:border-l lg:border-t-0 xl:p-14">
            <p className="max-w-[48rem] text-[18px] font-bold leading-[1.76] tracking-[-0.02em] text-ivory/72 md:text-[21px]">
              Choose a memory mood from the archive, then send a note to the travel design team. We will shape dates, hotels, transfers and private moments around it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/customize-your-trip/" className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full bg-gold px-8 text-[12px] font-black uppercase tracking-[0.22em] text-navy transition duration-300 ease-luxe hover:bg-ivory">
                Customize your trip
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/contact/" className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full border border-ivory/16 px-8 text-[12px] font-black uppercase tracking-[0.22em] text-ivory transition duration-300 ease-luxe hover:border-gold hover:text-gold">
                Talk to a designer
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function GuestMemoryPage() {
  return (
    <main className="bg-ivory text-navy">
      <MemoryHero />
      <div id="memory-albums">
        <MemoryGallery
          eyebrow="Guest memory viewmore"
          title="Browse Every Album"
          description="Open each sample album to inspect the guest-memory flow before replacing these legal travel images with approved client photography."
          sideNote="The homepage stays cinematic, while this page gives visitors a dedicated place to view every memory set and continue into a custom trip request."
          showViewAll={false}
        />
      </div>
      <MemoryCta />
    </main>
  );
}
