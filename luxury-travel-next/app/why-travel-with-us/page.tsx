import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Compass, Gem, HeartHandshake, Hotel, ShieldCheck, Sparkles, Users2, type LucideIcon } from 'lucide-react';
import { Container, Grid12, Section } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';

export const metadata: Metadata = {
  title: 'Why Travel With Us',
  description: 'Discover the private planning style, trusted hosts and calm luxury behind Ha Long Luxury journeys.'
};

const proofPoints = [
  { label: 'Private from the first note', value: 'No generic package. Your pace, occasion and comfort set the route.' },
  { label: 'Locally held', value: 'Guides, drivers and hotel partners are selected for grace under pressure.' },
  { label: 'Edited for calm', value: 'We remove rushed transfers and protect the hours that make a trip feel generous.' }
];

const craftRows: Array<{
  icon: LucideIcon;
  title: string;
  copy: string;
}> = [
  {
    icon: Compass,
    title: 'Rhythm before route',
    copy: 'We study daylight, transfer time, hotel location and rest before deciding what belongs in each day.'
  },
  {
    icon: HeartHandshake,
    title: 'A planner who reads the room',
    copy: 'A honeymoon, a family celebration and a first visit to Vietnam should never move at the same speed.'
  },
  {
    icon: ShieldCheck,
    title: 'Ground care you do not have to see',
    copy: 'Confirmations, handoffs and timing are checked before departure so the journey feels smooth on arrival.'
  }
];

const atelierNotes = [
  { icon: Hotel, title: 'Stays with mood', copy: 'Hotels, villas and cruises are chosen for atmosphere, position and how they support the day.' },
  { icon: Users2, title: 'Hosts with taste', copy: 'Guides know when to lead, when to translate and when to let the place speak.' },
  { icon: Gem, title: 'Occasion polish', copy: 'Quiet touches for anniversaries, families and once-in-a-lifetime routes.' }
];

const principles = [
  'Keep the beautiful places. Remove the exhausting parts.',
  'Place private transfers where comfort changes the day.',
  'Choose fewer highlights, then give each one the right hour.',
  'Let meals, views and pauses feel like part of the design.'
];

export default function WhyTravelWithUsPage() {
  return (
    <main className="bg-[oklch(0.965_0.018_82)] text-navy">
      <section className="relative min-h-[clamp(580px,80svh,760px)] overflow-hidden bg-navy pt-[98px] text-ivory md:pt-[112px]">
        <Image
          src="/images/collections/tailor-made-private-pool-asia-4k.jpg"
          alt="A quiet private pool villa in Asia prepared for a luxury journey"
          fill
          priority
          sizes="100vw"
          quality={94}
          className="object-cover object-[56%_50%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,27,0.92)_0%,rgba(6,20,32,0.78)_42%,rgba(6,20,32,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,106,0.24),transparent_30%),linear-gradient(180deg,rgba(6,20,32,0.04)_0%,rgba(6,20,32,0.72)_100%)]" />

        <Container width="page" className="relative flex min-h-[calc(clamp(580px,80svh,760px)-98px)] flex-col justify-center pb-[92px] md:min-h-[calc(clamp(580px,80svh,760px)-112px)]">
          <div className="max-w-[880px]">
            <Eyebrow className="text-gold">Why travel with us</Eyebrow>
            <h1 className="mt-5 max-w-[11ch] font-serif text-[clamp(46px,6.4vw,88px)] font-semibold leading-[0.9] tracking-[-0.074em] text-ivory drop-shadow-[0_18px_42px_rgba(0,0,0,0.34)]">
              Quiet luxury, beautifully held.
            </h1>
            <Lead className="mt-7 max-w-[44rem] text-[clamp(15px,1.08vw,18px)] font-semibold leading-[1.72] !text-ivory/80">
              We design private journeys that feel calm from the first conversation: elegant pacing, trusted local hosts and every handoff quietly checked before you arrive.
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/customize-your-trip/"
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full bg-gold px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.12em] text-navy shadow-[0_20px_54px_rgba(200,169,106,0.28)] ring-1 ring-gold/40 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-pearl"
              >
                <span className="whitespace-nowrap">Design your trip</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-pearl transition duration-300 ease-luxe group-hover:rotate-12">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/planning-flow/"
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full border border-pearl/28 bg-pearl/[0.075] px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.11em] text-pearl backdrop-blur-md transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy"
              >
                <span className="whitespace-nowrap">See planning flow</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-pearl/18 bg-pearl/10 transition duration-300 ease-luxe group-hover:rotate-12 group-hover:border-navy/20 group-hover:bg-navy group-hover:text-pearl">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container width="page" className="relative z-10 -mt-[82px]">
        <div className="overflow-hidden rounded-[34px] border border-gold/16 bg-[rgba(248,245,239,0.98)] shadow-[0_24px_72px_rgba(11,27,43,0.12)]">
          <div className="grid md:grid-cols-3">
          {proofPoints.map((point, index) => (
            <article
              key={point.label}
              className="relative min-h-[170px] border-b border-gold/12 p-7 text-left md:border-b-0 md:border-l md:first:border-l-0 md:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <span className="font-serif text-[28px] leading-none tracking-[-0.06em] text-gold-dark">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-gold/18" />
              </div>
              <h2 className="max-w-[12ch] font-serif text-[clamp(23px,1.8vw,30px)] font-semibold leading-[1.04] tracking-[-0.055em] text-navy">{point.label}</h2>
              <p className="mt-4 max-w-[24rem] text-[15px] font-semibold leading-7 text-navy/66">{point.value}</p>
            </article>
          ))}
          </div>
        </div>
      </Container>

      <Section className="bg-[oklch(0.965_0.018_82)] pt-[clamp(64px,6.4vw,104px)]" width="page">
        <Grid12 className="items-start gap-[clamp(36px,6vw,92px)]">
          <div className="md:col-span-5">
            <Eyebrow>Our difference</Eyebrow>
            <Heading className="mt-5 max-w-[13ch] text-navy">
              Not more itinerary. More intention.
            </Heading>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-[56rem] text-[clamp(22px,2.3vw,36px)] font-serif leading-[1.22] tracking-[-0.04em] text-navy">
              A luxury journey should never feel crowded. We edit the route until the beautiful parts have room to breathe and the practical parts feel invisible.
            </p>
            <div className="mt-10 overflow-hidden rounded-[34px] border border-navy/10 bg-pearl/80 shadow-[0_22px_72px_rgba(11,27,43,0.09)]">
              {craftRows.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="group border-t border-navy/10 p-6 transition duration-300 ease-luxe first:border-t-0 hover:bg-gold/[0.055] sm:p-7">
                  <div className="grid gap-5 sm:grid-cols-[76px_1fr] sm:items-start">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/28 bg-gold/10 text-gold-dark transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy sm:mt-1">
                      <Icon className="h-5 w-5" strokeWidth={1.65} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-serif text-[clamp(30px,3vw,48px)] font-semibold leading-[1.02] tracking-[-0.062em] text-navy">{title}</h2>
                      <p className="mt-3 max-w-[48rem] text-left text-[15px] font-semibold leading-8 text-navy/64">{copy}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Grid12>
      </Section>

      <Section className="bg-navy text-ivory" width="page">
        <div className="relative overflow-hidden rounded-[52px] border border-ivory/12 bg-[linear-gradient(135deg,#061521_0%,#08283a_54%,#113f3d_100%)] p-[clamp(28px,5vw,76px)] shadow-[0_38px_110px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute right-[-0.05em] top-[-0.16em] hidden font-serif text-[clamp(110px,14vw,240px)] font-black uppercase leading-none tracking-[-0.1em] text-pearl/[0.045] lg:block">
            EDIT
          </div>

          <Grid12 className="relative items-end gap-[clamp(32px,5vw,80px)]">
            <div className="md:col-span-7">
              <Eyebrow>How we protect the journey</Eyebrow>
              <Heading className="mt-5 max-w-[14ch] text-ivory">
                Every beautiful day needs a good editor.
              </Heading>
              <p className="mt-7 max-w-[46rem] text-[17px] font-semibold leading-8 text-ivory/68">
                We keep the route elegant by removing what creates fatigue and sharpening what deserves attention. The result is polished, warm and easy to live inside.
              </p>
            </div>

            <blockquote className="md:col-span-5 md:pl-[clamp(20px,3vw,44px)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-gold">Guest promise</p>
              <p className="mt-4 max-w-[14ch] font-serif text-[clamp(38px,3.9vw,64px)] font-semibold leading-[0.94] tracking-[-0.072em] text-ivory drop-shadow-[0_16px_34px_rgba(0,0,0,0.26)]">
                You feel the place, not the logistics.
              </p>
              <div className="mt-7 h-px w-[clamp(120px,14vw,220px)] bg-gold/42" />
            </blockquote>
          </Grid12>

          <div className="relative mt-[clamp(34px,5vw,72px)] grid gap-[clamp(36px,5vw,78px)] lg:grid-cols-[minmax(0,0.76fr)_minmax(660px,1.24fr)] lg:items-start">
            <figure className="relative min-h-[420px] overflow-hidden rounded-[38px] border border-ivory/12 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.24)] lg:min-h-[620px]">
              <Image
                src="/images/collections/multi-country-mekong-sunset-4k.jpg"
                alt="Golden Mekong sunset for a private Southeast Asia journey"
                fill
                sizes="(min-width: 1280px) 700px, 100vw"
                quality={94}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,33,0.04)_0%,rgba(6,21,33,0.18)_100%)]" />
            </figure>

            <div className="max-w-[920px]">
              <section aria-labelledby="editor-rules">
                <div className="flex flex-wrap items-center justify-between gap-8 border-b border-gold/24 pb-7">
                  <p id="editor-rules" className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold">Editor&apos;s rules</p>
                  <span className="rounded-full bg-ivory/[0.035] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-ivory/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    Four quiet edits
                  </span>
                </div>
                <div className="mt-8 grid gap-0 overflow-hidden rounded-[30px] border border-ivory/10 bg-ivory/[0.035]">
                  {principles.map((item, index) => (
                    <div key={item} className="group grid gap-5 border-t border-ivory/10 p-6 first:border-t-0 transition duration-300 ease-luxe hover:bg-ivory/[0.055] sm:grid-cols-[72px_1fr] sm:items-center">
                      <span className="font-serif text-[42px] leading-none tracking-[-0.06em] text-gold">{String(index + 1).padStart(2, '0')}</span>
                      <p className="max-w-[38rem] text-[16px] font-semibold leading-8 text-ivory/76">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="atelier-details" className="mt-12">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="max-w-[34rem]">
                    <p id="atelier-details" className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold">Atelier details</p>
                    <p className="mt-2 text-[13px] font-semibold leading-6 text-ivory/62">
                      The small choices that make the itinerary feel composed, not assembled.
                    </p>
                  </div>
                  <span className="h-px min-w-[96px] flex-1 bg-gradient-to-r from-gold/28 to-transparent" />
                  <span className="rounded-full bg-ivory/[0.035] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-ivory/76">
                    Seen before departure
                  </span>
                </div>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                  {atelierNotes.map(({ icon: Icon, title, copy }, index) => (
                    <article key={title} className="group relative min-h-[250px] rounded-[28px] border border-ivory/10 bg-ivory/[0.045] p-6 shadow-[inset_0_1px_0_rgba(248,245,239,0.06)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/32 hover:bg-ivory/[0.07]">
                      <span className="pointer-events-none absolute right-6 top-6 font-serif text-[28px] font-semibold leading-none tracking-[-0.08em] text-gold/72 transition duration-300 ease-luxe">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/24 bg-navy/36 text-gold shadow-[0_10px_28px_rgba(0,0,0,0.14)] transition duration-300 ease-luxe group-hover:border-gold/50 group-hover:bg-gold group-hover:text-navy">
                        <Icon className="h-4 w-4" strokeWidth={1.65} />
                      </span>
                      <p className="mt-7 text-[13px] font-black uppercase tracking-[0.1em] text-ivory">{title}</p>
                      <p className="mt-4 max-w-[19rem] text-[14px] font-semibold leading-8 text-ivory/66">{copy}</p>
                    </article>
                  ))}
                </div>
              </section>

              <Link
                href="/customize-your-trip/"
                className="group mt-12 inline-flex min-h-[62px] items-center gap-4 rounded-full bg-gold px-4 pl-8 text-[12px] font-extrabold uppercase tracking-[0.12em] text-navy shadow-[0_20px_54px_rgba(200,169,106,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-pearl"
              >
                <span className="whitespace-nowrap">Start a private brief</span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-pearl transition duration-300 ease-luxe group-hover:rotate-12">
                  <Sparkles className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
