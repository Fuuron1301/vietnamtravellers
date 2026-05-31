import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  Headphones,
  Hotel,
  MessageCircleMore,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import { AnimatedFaqDisclosure } from '@/components/faqs/animated-faq-disclosure';
import { Container, Grid12, Section } from '@/components/layout/container';
import { JsonLd } from '@/components/seo/json-ld';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { faqSchema } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).faqs;
  return { title: page.metaTitle, description: page.metaDescription };
}

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  id: string;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
  {
    id: 'planning',
    eyebrow: 'Planning',
    title: 'Before We Design The Route',
    icon: Route,
    items: [
      {
        question: 'How does a tailor-made trip begin?',
        answer:
          'It begins with a short brief: your dates, destinations, hotel mood, travel pace, budget range, special occasion notes and anything you already know you want to avoid. From there, a travel designer builds a private route instead of pushing a fixed package.',
      },
      {
        question: 'Can you help if we only have a rough idea?',
        answer:
          'Yes. Many guests start with a season, a country or a feeling rather than a full itinerary. We can suggest the right route order, number of nights, hotel bases and private experiences before you commit.',
      },
      {
        question: 'How quickly can we receive an itinerary?',
        answer:
          'For simple routes, the first proposal is usually prepared within one to two business days. Complex multi-country journeys, peak-season hotel checks or special access requests may need more time so the plan is accurate.',
      },
    ],
  },
  {
    id: 'hotels',
    eyebrow: 'Hotels and guiding',
    title: 'The Comfort Details',
    icon: Hotel,
    items: [
      {
        question: 'Do you choose hotels or can we choose them?',
        answer:
          'Both are possible. We can recommend hotels, cruises and villas that fit the route, or work with properties you already prefer. The final plan should match your comfort level, location needs and atmosphere.',
      },
      {
        question: 'Are guides and transfers private?',
        answer:
          'Most tailor-made journeys use private guides and private transfers where they improve comfort and timing. Some cruises, trains or selected experiences may be shared, and we will make that clear before confirmation.',
      },
      {
        question: 'Can you arrange special moments for anniversaries or families?',
        answer:
          'Yes. We can note room preferences, quieter tables, family-friendly timing, birthdays, anniversaries, proposal plans, dietary needs and other details that should feel thoughtful but not overproduced.',
      },
    ],
  },
  {
    id: 'booking',
    eyebrow: 'Booking',
    title: 'Deposits, Payments And Changes',
    icon: CreditCard,
    items: [
      {
        question: 'When do we pay a deposit?',
        answer:
          'After you approve the itinerary and inclusions, we issue a booking summary with payment steps. The deposit secures key services such as hotels, cruises, guides, domestic flights and private transfers.',
      },
      {
        question: 'Can the itinerary change after confirmation?',
        answer:
          'Yes, subject to supplier availability and any cancellation or change fees. We explain the impact before making changes, especially for hotels, cruises, flights and peak travel dates.',
      },
      {
        question: 'What payment methods are available?',
        answer:
          'Payment options depend on the booking flow and invoice details. Common options may include bank transfer, card payment, PayPal or local payment methods where available.',
      },
    ],
  },
  {
    id: 'travel',
    eyebrow: 'Travel days',
    title: 'Flights, Visas And On-Trip Support',
    icon: Plane,
    items: [
      {
        question: 'Do you arrange international flights?',
        answer:
          'We can advise on flight logic and arrival timing, but international ticketing depends on the request and supplier setup. Many guests book long-haul flights directly while we handle the ground route.',
      },
      {
        question: 'Can you help with visa questions?',
        answer:
          'We can share practical visa guidance and official reference points for destinations in the itinerary. Travelers remain responsible for checking current entry rules for their passport before departure.',
      },
      {
        question: 'What happens if something changes during the trip?',
        answer:
          'Your support team helps coordinate practical solutions with local partners. Weather, flight delays or supplier issues are handled with calm communication and the least disruption possible.',
      },
    ],
  },
];

const promiseCards = [
  {
    icon: MessageCircleMore,
    title: 'Ask once, clearly',
    copy: 'We collect the right context early so the first proposal is already close to your rhythm.',
  },
  {
    icon: CalendarCheck,
    title: 'Check the timing',
    copy: 'The itinerary is tested against transfer time, hotel changes, opening hours and recovery space.',
  },
  {
    icon: ShieldCheck,
    title: 'Hold the handoff',
    copy: 'Final details are organized before you travel, with support ready if the day changes.',
  },
];

const allFaqs = faqGroups.flatMap((group) => group.items);

export default async function FaqsPage() {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).faqs;
  const quickNotes = page.quickNotes.length ? page.quickNotes : [
    { label: 'Private by design', copy: 'Every route is shaped around your dates, travel mood, room style and pace.' },
    { label: 'Human checked', copy: 'Hotels, transfers, guides and special notes are reviewed before confirmation.' },
    { label: 'Supported on trip', copy: 'Your travel team stays close enough to solve issues, quietly and quickly.' },
  ];

  return (
    <main className="overflow-hidden bg-ivory text-navy">
      <section className="relative min-h-[clamp(560px,78svh,720px)] overflow-hidden bg-navy pt-[98px] text-ivory md:pt-[112px]">
        <Image
          src={page.heroImage}
          alt="Quiet private pool villa in Asia prepared for a luxury tailor-made journey"
          fill
          priority
          sizes="100vw"
          quality={94}
          className="object-cover object-[58%_50%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,27,0.94)_0%,rgba(6,24,34,0.8)_46%,rgba(9,62,58,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(200,169,106,0.28),transparent_30%),radial-gradient(circle_at_76%_20%,rgba(248,245,239,0.13),transparent_26%),linear-gradient(180deg,rgba(6,20,32,0.02)_0%,rgba(6,20,32,0.7)_100%)]" />

        <Container width="page" className="relative flex min-h-[calc(clamp(560px,78svh,720px)-98px)] flex-col justify-center pb-[86px] md:min-h-[calc(clamp(560px,78svh,720px)-112px)]">
          <div className="max-w-[940px]">
            <Eyebrow className="text-gold">{page.heroEyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-[11ch] font-serif text-[clamp(46px,6.2vw,86px)] font-semibold leading-[0.9] tracking-[-0.072em] text-pearl drop-shadow-[0_18px_42px_rgba(0,0,0,0.36)]">
              {page.heroTitle}
            </h1>
            <Lead className="mt-6 max-w-[44rem] text-[clamp(15px,1.08vw,18px)] font-semibold leading-[1.76] !text-pearl/80">
              {page.heroLead}
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={page.heroPrimaryCtaHref}
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full bg-gold px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.16em] text-navy shadow-[0_20px_54px_rgba(200,169,106,0.28)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-pearl"
              >
                {page.heroPrimaryCtaLabel}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-pearl transition duration-300 ease-luxe group-hover:rotate-12">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={page.heroSecondaryCtaHref}
                className="group inline-flex min-h-[56px] items-center gap-3 rounded-full border border-pearl/28 bg-pearl/[0.075] px-4 pl-7 text-[12px] font-extrabold uppercase tracking-[0.16em] text-pearl backdrop-blur-md transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy"
              >
                {page.heroSecondaryCtaLabel}
                <span className="grid h-9 w-9 place-items-center rounded-full border border-pearl/18 bg-pearl/10 transition duration-300 ease-luxe group-hover:rotate-12 group-hover:border-navy/20 group-hover:bg-navy group-hover:text-pearl">
                  <Headphones className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container width="page" className="relative z-10 -mt-[64px]">
        <div className="grid gap-4 md:grid-cols-3">
          {quickNotes.map((note, index) => (
            <article key={note.label} className="group relative min-h-[160px] overflow-hidden rounded-[32px] border border-navy/10 bg-[linear-gradient(180deg,#fcfaf5_0%,#f4ede0_100%)] p-7 shadow-[0_24px_68px_rgba(11,27,43,0.13)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:shadow-[0_30px_78px_rgba(11,27,43,0.15)]">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
              <div className="flex items-center gap-4">
                <p className="font-serif text-[30px] leading-none tracking-[-0.06em] text-gold-dark">{String(index + 1).padStart(2, '0')}</p>
                <span className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
              </div>
              <h2 className="mt-6 text-[14px] font-black uppercase tracking-[0.14em] text-navy">{note.label}</h2>
              <p className="mt-3 max-w-[22rem] text-[15px] font-semibold leading-7 text-navy/62">{note.copy}</p>
            </article>
          ))}
        </div>
      </Container>

      <Section className="bg-[linear-gradient(180deg,#f8f5ef_0%,#f1e6d2_100%)] py-[clamp(78px,8vw,132px)]" width="page">
        <Grid12 className="items-start gap-[clamp(38px,6vw,96px)]">
          <aside className="md:col-span-5">
            <div className="sticky top-[108px] overflow-hidden rounded-[42px] border border-ivory/12 bg-[linear-gradient(155deg,#061521_0%,#0b2a36_56%,#143c39_100%)] text-ivory shadow-[0_30px_86px_rgba(11,27,43,0.2)]">
              <div className="relative p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.24),transparent_34%)]" />
                <div className="relative">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-gold">{page.navEyebrow}</p>
                  <h2 className="mt-5 max-w-[13ch] font-serif text-[clamp(38px,3.4vw,56px)] font-semibold leading-[0.94] tracking-[-0.064em] text-ivory">
                    {page.navTitle}
                  </h2>
                  <p className="mt-5 max-w-[28rem] text-[15px] font-semibold leading-8 text-ivory/66">
                    {page.navLead}
                  </p>
                </div>
              </div>
              <nav className="grid gap-0 border-t border-ivory/10 px-6 py-2" aria-label="FAQ categories">
                {faqGroups.map((group, index) => (
                  <a key={group.id} href={`#${group.id}`} className="group grid min-h-[62px] grid-cols-[34px_1fr_30px] items-center gap-3 border-t border-ivory/10 px-1 text-ivory/76 transition duration-300 ease-luxe first:border-t-0 hover:text-ivory">
                    <span className="font-serif text-[18px] leading-none tracking-[-0.06em] text-gold/70">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.22em]">{group.eyebrow}</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-ivory/14 bg-ivory/[0.03] text-ivory/50 transition duration-300 ease-luxe group-hover:border-gold/40 group-hover:bg-gold group-hover:text-navy">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </nav>
              <div className="border-t border-ivory/10 px-8 py-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold">{page.navConciergeEyebrow}</p>
                <p className="mt-3 max-w-[28rem] text-[14px] font-semibold leading-7 text-ivory/62">
                  {page.navConciergeBody}
                </p>
              </div>
            </div>
          </aside>

          <div className="md:col-span-7">
            <div className="grid gap-10">
              {faqGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <section key={group.id} id={group.id} className="scroll-mt-28">
                    <div className="mb-5 overflow-hidden rounded-[34px] border border-navy/10 bg-[linear-gradient(180deg,#fffaf2_0%,#f5ecdc_100%)] shadow-[0_18px_56px_rgba(11,27,43,0.06)]">
                      <div className="grid gap-6 p-7 sm:grid-cols-[1fr_68px] sm:items-center sm:p-8">
                        <div>
                          <div className="flex items-center gap-4">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">{group.eyebrow}</p>
                            <span className="h-px min-w-[80px] flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                          </div>
                          <h2 className="mt-4 max-w-[16ch] font-serif text-[clamp(36px,3.6vw,62px)] font-semibold leading-[0.94] tracking-[-0.066em] text-navy">
                            {group.title}
                          </h2>
                        </div>
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/24 bg-gold/10 text-gold-dark shadow-[inset_0_1px_0_rgba(248,245,239,0.55)] sm:h-16 sm:w-16">
                          <Icon className="h-5 w-5" strokeWidth={1.65} />
                        </span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-gold/26 to-transparent" />
                    </div>
                    <div className="grid gap-3">
                      {group.items.map((item, index) => (
                        <AnimatedFaqDisclosure key={item.question} item={item} index={index} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </Grid12>
      </Section>

      <Section className="bg-navy py-[clamp(78px,8vw,126px)] text-ivory" width="page">
        <div className="grid overflow-hidden rounded-[46px] border border-ivory/12 bg-[linear-gradient(135deg,#061521_0%,#0b2f3c_58%,#17433f_100%)] shadow-[0_38px_110px_rgba(0,0,0,0.26)] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="p-[clamp(30px,5vw,72px)]">
            <Eyebrow className="text-gold">{page.promiseEyebrow}</Eyebrow>
            <Heading className="mt-5 max-w-[13ch] text-[clamp(40px,4.2vw,72px)] leading-[0.96] text-ivory">
              {page.promiseHeading}
            </Heading>
            <p className="mt-7 max-w-[42rem] text-[17px] font-semibold leading-8 text-ivory/68">
              {page.promiseLead}
            </p>
          </div>

          <div className="grid gap-4 border-t border-ivory/10 p-[clamp(26px,4vw,56px)] lg:border-l lg:border-t-0">
            {promiseCards.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="group grid gap-5 rounded-[30px] border border-ivory/10 bg-ivory/[0.045] p-6 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/30 hover:bg-ivory/[0.07] sm:grid-cols-[64px_1fr]">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/26 transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy">
                  <Icon className="h-5 w-5" strokeWidth={1.65} />
                </span>
                <div>
                  <h3 className="text-[22px] font-black leading-tight tracking-[-0.04em] text-ivory">{title}</h3>
                  <p className="mt-3 max-w-[42rem] text-[15px] font-semibold leading-7 text-ivory/64">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-[linear-gradient(180deg,#f1e6d2_0%,#f8f5ef_100%)] py-[clamp(72px,8vw,120px)]" width="page">
        <div className="grid items-center gap-8 rounded-[44px] border border-navy/10 bg-pearl p-[clamp(28px,5vw,66px)] shadow-[0_28px_86px_rgba(11,27,43,0.1)] lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold-dark">{page.finalEyebrow}</p>
            <h2 className="mt-4 max-w-[14ch] font-serif text-[clamp(40px,4.6vw,76px)] font-semibold leading-[0.96] tracking-[-0.066em] text-navy">
              {page.finalHeading}
            </h2>
            <p className="mt-6 max-w-[48rem] text-[17px] font-semibold leading-8 text-navy/62">
              {page.finalLead}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={page.finalCtaPrimaryHref} className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-navy px-8 text-[12px] font-black uppercase tracking-[0.18em] text-ivory shadow-[0_14px_34px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy">
              {page.finalCtaPrimaryLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={page.finalCtaSecondaryHref} className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-navy/12 px-8 text-[12px] font-black uppercase tracking-[0.18em] text-navy transition duration-300 ease-luxe hover:border-gold hover:bg-champagne">
              {page.finalCtaSecondaryLabel}
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      <JsonLd data={faqSchema(allFaqs)} />
    </main>
  );
}
