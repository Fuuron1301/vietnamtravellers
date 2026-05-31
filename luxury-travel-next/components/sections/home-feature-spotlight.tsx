import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Compass, Hotel, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/container';
import type { SpotlightContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

const iconMap: Record<string, LucideIcon> = { Compass, Hotel, ShieldCheck, BadgeCheck };

export function HomeFeatureSpotlight({ content = defaultHomeSectionContent.spotlight }: { content?: SpotlightContent } = {}) {
  const features = content.features.map((feature) => ({ ...feature, icon: iconMap[feature.iconKey] || Compass }));
  const assurances = content.assurances;
  return (
    <section id="tailor-made-assurance" className="relative scroll-mt-[128px] overflow-hidden bg-ivory py-24 text-navy md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,106,0.16),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(11,27,43,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold/24" />

      <Container width="page" className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.3em] text-gold-dark" suppressHydrationWarning>{content.eyebrow}</p>
            <h2 className="mt-6 max-w-[12ch] font-serif text-[clamp(26px,5vw,76px)] leading-[0.95] tracking-[-0.06em] text-navy" suppressHydrationWarning>
              {content.heading}
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-[15px] font-semibold leading-7 tracking-[-0.015em] text-navy/74 lg:text-[20px] lg:leading-9" suppressHydrationWarning>
              {content.lead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={content.ctaHref}
                className="inline-flex items-center gap-[12px] rounded-full bg-navy px-8 py-[18px] text-[13px] font-extrabold uppercase leading-none tracking-[0.18em] text-ivory shadow-[0_18px_42px_rgba(11,27,43,0.18)] transition hover:bg-gold hover:text-navy"
                suppressHydrationWarning
              >
                {content.ctaLabel}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
              </Link>
              <div className="flex flex-wrap gap-2">
                {assurances.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-[#efe5d1]/60 px-4 py-[12px] text-[12px] font-extrabold uppercase tracking-[0.15em] text-navy/76" suppressHydrationWarning>
                    <BadgeCheck className="h-4 w-4 text-gold-dark" strokeWidth={1.75} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:gap-8">
          <article className="relative min-h-[560px] overflow-hidden rounded-[42px] bg-navy shadow-[0_34px_100px_rgba(11,27,43,0.18)]">
            <Image
              src={content.heroImage}
              alt={content.heroImageAlt}
              fill
              sizes="3840px"
              quality={100}
              priority
              unoptimized
              className="object-cover contrast-[1.08] saturate-[1.07]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.04),rgba(11,27,43,0.12)_42%,rgba(11,27,43,0.58)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_86%,rgba(11,27,43,0.62),rgba(11,27,43,0.22)_28%,transparent_54%)]" />
            <div className="absolute left-6 right-6 top-6 flex flex-wrap items-center justify-between gap-4 sm:left-8 sm:right-8 sm:top-8">
              <span className="rounded-full bg-[#f8f5ef] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-navy shadow-[0_14px_34px_rgba(0,0,0,0.14)]" suppressHydrationWarning>
                {content.heroBadgeLeft}
              </span>
              <span className="rounded-full border border-ivory/30 bg-navy/62 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ivory backdrop-blur-sm" suppressHydrationWarning>
                {content.heroBadgeRight}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.24em] text-gold [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]" suppressHydrationWarning>{content.heroEyebrow}</p>
              <h3 className="mt-[20px] max-w-[11ch] font-serif text-[clamp(40px,4.2vw,68px)] leading-[0.94] tracking-[-0.06em] text-ivory [text-shadow:0_4px_28px_rgba(0,0,0,0.5)]" suppressHydrationWarning>
                {content.heroTitle}
              </h3>
            </div>
          </article>

          <div className="grid gap-6">
            {features.map(({ icon: Icon, eyebrow, title, copy, image, alt }, index) => (
              <article key={title} className="group grid min-h-[248px] grid-cols-[minmax(118px,40%)_minmax(0,1fr)] overflow-hidden rounded-[32px] border border-navy/10 bg-[#fffaf0] shadow-[0_18px_54px_rgba(11,27,43,0.08)] transition duration-300 ease-luxe hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(11,27,43,0.13)] sm:grid-cols-[minmax(148px,42%)_minmax(0,1fr)] lg:min-h-[260px]">
                <div className="relative h-full min-h-[248px] overflow-hidden bg-navy/10 lg:min-h-[260px]">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="3840px"
                    quality={100}
                    unoptimized
                    className="object-cover contrast-[1.08] saturate-[1.07] transition duration-700 ease-luxe group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,27,43,0.04),rgba(11,27,43,0.16))]" />
                </div>
                <div className="min-w-0 p-4 sm:p-7 lg:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-gold-dark sm:h-[56px] sm:w-[56px]">
                      <Icon className="h-[22px] w-[22px] sm:h-[28px] sm:w-[28px]" strokeWidth={1.55} />
                    </span>
                    <span className="font-serif text-[32px] leading-none tracking-[-0.055em] text-gold-dark sm:text-[44px]" suppressHydrationWarning>0{index + 1}</span>
                  </div>
                  <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold-dark sm:mt-8 sm:text-[12px]" suppressHydrationWarning>{eyebrow}</p>
                  <h3 className="mt-3 max-w-[17ch] font-serif text-[clamp(20px,2.8vw,48px)] leading-[1.08] tracking-[-0.04em] text-navy sm:mt-4 sm:text-[clamp(28px,2.8vw,48px)]" suppressHydrationWarning>
                    {title}
                  </h3>
                  <p className="mt-3 text-[14px] font-medium leading-7 text-navy/70 sm:mt-4 sm:text-[17px] sm:leading-8" suppressHydrationWarning>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
