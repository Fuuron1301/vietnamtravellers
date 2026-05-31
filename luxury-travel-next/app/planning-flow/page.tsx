import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, CheckCircle2, Hotel, MessageCircleMore, Route, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { Container, Grid12, Section } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';

export const metadata: Metadata = {
  title: 'Our Planning Flow',
  description: 'See how an idea becomes a polished private travel itinerary with Ha Long Luxury.'
};

const steps: Array<{
  icon: LucideIcon;
  title: string;
  copy: string;
}> = [
  {
    icon: MessageCircleMore,
    title: 'The brief',
    copy: 'Dates, mood, pace, occasion and the places you already have in mind.'
  },
  {
    icon: Route,
    title: 'The route',
    copy: 'A clean sequence of destinations, transfers and nights that respects your energy.'
  },
  {
    icon: Hotel,
    title: 'The stays',
    copy: 'Hotels, cruises and villas selected for atmosphere, position and comfort.'
  },
  {
    icon: CalendarDays,
    title: 'The day plan',
    copy: 'Guided time, meals, open hours and movement placed with a realistic rhythm.'
  },
  {
    icon: CheckCircle2,
    title: 'The handoff',
    copy: 'A final itinerary checked by humans, ready for smooth support on the ground.'
  }
];

const passes = [
  {
    label: 'Pass one',
    title: 'Find the natural line.',
    copy: 'We remove routes that look good on a map but feel tiring in real life.'
  },
  {
    label: 'Pass two',
    title: 'Tune the pace.',
    copy: 'Early starts, long drives and hotel changes are edited so the journey still feels like a holiday.'
  },
  {
    label: 'Pass three',
    title: 'Polish the details.',
    copy: 'Guides, private transfers, meal timing and special notes are checked before confirmation.'
  }
];

const finalChecks = [
  'A day-by-day itinerary written clearly.',
  'Hotels and transfers checked against the route.',
  'Local support flow for travel days.',
  'Room to refine before final confirmation.'
];

export default function PlanningFlowPage() {
  return (
    <main className="overflow-hidden bg-ivory text-navy">
      <section className="relative min-h-[clamp(580px,80svh,760px)] overflow-hidden bg-navy pt-[98px] text-ivory md:pt-[112px]">
        <Image
          src="/images/hero/vietnam-da-nang-dragon-bridge-panorama-4k.jpg"
          alt="Evening city lights in Vietnam used as inspiration for a private travel route"
          fill
          priority
          sizes="100vw"
          quality={94}
          className="object-cover object-[54%_50%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,27,0.92)_0%,rgba(6,24,36,0.76)_46%,rgba(14,62,58,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(224,174,116,0.28),transparent_30%),radial-gradient(circle_at_78%_34%,rgba(244,208,172,0.18),transparent_28%),linear-gradient(180deg,rgba(6,20,32,0.02)_0%,rgba(6,20,32,0.68)_100%)]" />

        <Container width="page" className="relative flex min-h-[calc(clamp(580px,80svh,760px)-98px)] flex-col justify-center pb-[128px] md:min-h-[calc(clamp(580px,80svh,760px)-112px)]">
          <div className="max-w-[920px]">
            <Eyebrow className="text-gold">Our planning flow</Eyebrow>
            <h1 className="mt-5 max-w-[12ch] font-serif text-[clamp(46px,6.4vw,88px)] font-semibold leading-[0.9] tracking-[-0.074em] text-pearl drop-shadow-[0_18px_42px_rgba(0,0,0,0.36)]">
              From idea to effortless itinerary.
            </h1>
            <Lead className="mt-7 max-w-[44rem] text-[clamp(15px,1.08vw,18px)] leading-[1.78] !text-pearl/80">
              You share the shape of the trip. We edit the route, test the timing and turn it into a private itinerary that feels calm before you leave home.
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/customize-your-trip/"
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full bg-pearl px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.18em] text-navy shadow-[0_20px_54px_rgba(0,0,0,0.24)] ring-1 ring-pearl/60 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold"
              >
                Start your brief
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-pearl transition duration-300 ease-luxe group-hover:rotate-12">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/why-travel-with-us/"
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full border border-pearl/28 bg-pearl/[0.075] px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.16em] text-pearl backdrop-blur-md transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy"
              >
                Why we plan this way
                <span className="grid h-9 w-9 place-items-center rounded-full border border-pearl/18 bg-pearl/10 transition duration-300 ease-luxe group-hover:rotate-12 group-hover:border-navy/20 group-hover:bg-navy group-hover:text-pearl">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container width="page" className="relative z-10 -mt-[92px]">
        <section className="overflow-hidden rounded-[42px] border border-navy/10 bg-pearl shadow-[0_34px_100px_rgba(11,27,43,0.18)]" aria-label="Planning sequence">
          <div className="grid lg:grid-cols-[0.74fr_1.26fr]">
            <div className="relative min-h-[360px] bg-navy lg:min-h-full">
              <Image
                src="/images/sections/trip-design-pathein-umbrella.jpg"
                alt="Handcrafted travel details representing tailor-made itinerary planning"
                fill
                sizes="(min-width: 1280px) 460px, 100vw"
                quality={92}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.02)_0%,rgba(11,27,43,0.74)_100%)]" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[30px] border border-ivory/28 bg-ivory/90 p-6 text-navy shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-md">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold">Planning atelier</p>
                <p className="mt-3 text-[17px] font-semibold leading-8 text-navy/68">
                  A private route board shaped by hand, not a checkout form.
                </p>
              </div>
            </div>

            <div className="p-[clamp(26px,4.5vw,60px)]">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Five considered moves</p>
                  <h2 className="mt-4 max-w-[13ch] font-serif text-[clamp(38px,4.5vw,68px)] font-semibold leading-[0.98] tracking-[-0.065em] text-navy">
                    The route gets quieter at every pass.
                  </h2>
                </div>
                <Link
                  href="/customize-your-trip/"
                  className="inline-flex min-h-[56px] items-center gap-3 rounded-full bg-navy px-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ivory shadow-[0_14px_36px_rgba(11,27,43,0.16)] transition duration-300 ease-luxe hover:bg-gold hover:text-navy"
                >
                  Send brief
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-4">
                {steps.map(({ icon: Icon, title, copy }, index) => (
                  <article
                    key={title}
                    className="grid gap-5 rounded-[30px] border border-navy/10 bg-[#fffaf0]/92 p-6 shadow-[0_18px_52px_rgba(11,27,43,0.07)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/34 hover:shadow-[0_24px_70px_rgba(11,27,43,0.1)] sm:grid-cols-[104px_1fr] sm:p-7"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <span className="font-serif text-[30px] leading-none text-gold-dark">{String(index + 1).padStart(2, '0')}</span>
                      <span className="ml-auto grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-dark sm:ml-0 sm:mt-4">
                        <Icon className="h-5 w-5" strokeWidth={1.65} />
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[clamp(23px,2vw,32px)] font-black leading-[1.04] tracking-[-0.055em] text-navy">{title}</h3>
                      <p className="mt-2 max-w-[48rem] text-[15px] font-semibold leading-7 text-navy/62">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Container>

      <Section className="bg-[linear-gradient(180deg,#f3ead8_0%,#f8f5ef_100%)] py-[clamp(72px,8vw,128px)]" width="page">
        <Grid12 className="items-start gap-[clamp(42px,6vw,96px)]">
          <div className="md:col-span-5">
            <Eyebrow>How we refine</Eyebrow>
            <Heading className="mt-5 max-w-[13ch] text-navy">
              Three passes before the plan feels finished.
            </Heading>
            <p className="mt-7 max-w-[35rem] text-[18px] font-semibold leading-[1.85] tracking-[-0.02em] text-navy/64">
              This is where a travel idea becomes a journey. Not by adding more, but by choosing what deserves to stay.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-[40px] border border-navy/10 bg-pearl shadow-[0_24px_78px_rgba(11,27,43,0.1)]">
              {passes.map((item, index) => (
                <article key={item.title} className="grid gap-6 border-t border-navy/10 p-8 first:border-t-0 md:grid-cols-[150px_1fr] md:p-10">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-gold-dark">{item.label}</p>
                    <p className="mt-5 font-serif text-[40px] leading-none text-gold-dark">{String(index + 1).padStart(2, '0')}</p>
                  </div>
                  <div>
                    <h2 className="font-serif text-[clamp(30px,2.7vw,46px)] font-semibold leading-[1.04] tracking-[-0.055em] text-navy">{item.title}</h2>
                    <p className="mt-4 max-w-[48rem] text-[16px] font-semibold leading-8 text-navy/64">{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Grid12>
      </Section>

      <Section className="bg-[linear-gradient(180deg,#f8f5ef_0%,#f3ead8_100%)] text-ivory" width="page">
        <div className="grid overflow-hidden rounded-[46px] border border-navy/10 bg-[oklch(0.175_0.038_245)] shadow-[0_38px_110px_rgba(0,0,0,0.22)] lg:grid-cols-[1.03fr_0.97fr]">
          <div className="p-[clamp(30px,5vw,76px)]">
            <Eyebrow>Final handoff</Eyebrow>
            <Heading className="mt-5 max-w-[14ch] text-[clamp(38px,4vw,66px)] leading-[0.98] text-ivory">
              Clear enough to trust. Flexible enough to refine.
            </Heading>
            <p className="mt-7 max-w-[44rem] text-[17px] font-semibold leading-8 text-ivory/68">
              Before confirmation, you see the whole rhythm of the trip: where you stay, how you move, what is guided and where the breathing room sits.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {finalChecks.map((item) => (
                <div key={item} className="group flex min-h-[92px] items-start gap-5 rounded-[28px] border border-ivory/10 bg-ivory/[0.045] p-6 shadow-[inset_0_1px_0_rgba(248,245,239,0.06)] transition duration-300 ease-luxe hover:border-gold/35 hover:bg-ivory/[0.07]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/28 transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy">
                    <ShieldCheck className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </span>
                  <p className="text-[14px] font-bold leading-7 text-ivory/78">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[460px] bg-[oklch(0.91_0.035_82)] p-6 text-navy lg:min-h-full">
            <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_76%_12%,rgba(200,169,106,0.32),transparent_32%),radial-gradient(circle_at_18%_86%,rgba(11,27,43,0.12),transparent_28%)]" />
            <div className="relative flex h-full flex-col justify-between rounded-[34px] border border-navy/10 bg-pearl/86 p-[clamp(30px,4vw,54px)] shadow-[0_22px_70px_rgba(11,27,43,0.12)]">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Need inspiration first?</p>
                <p className="mt-6 max-w-[13ch] font-serif text-[clamp(40px,4vw,64px)] font-semibold leading-[0.98] tracking-[-0.065em] text-navy">
                  Read the travel journal.
                </p>
                <p className="mt-6 max-w-[28rem] text-[16px] font-semibold leading-8 text-navy/62">
                  Browse route ideas, seasonal timing and destination notes before we shape a private journey around you.
                </p>
              </div>
              <Link
                href="/travel-journal/"
                className="mt-12 inline-flex min-h-[58px] w-fit items-center gap-3 rounded-full bg-navy px-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ivory shadow-[0_14px_34px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy"
              >
                Open the journal
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
