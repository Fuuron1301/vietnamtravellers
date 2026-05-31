import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Compass, FileCheck2, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/container';
import type { BookingStepsContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

const stepIcons: LucideIcon[] = [Compass, FileCheck2, BadgeCheck];

export function EasyBookingSteps({ content = defaultHomeSectionContent.bookingSteps }: { content?: BookingStepsContent } = {}) {
  const steps = content.steps.map((step, index) => ({ ...step, icon: stepIcons[index % stepIcons.length] }));
  return (
    <section id="easy-booking-steps" className="relative overflow-hidden bg-[oklch(0.993_0.004_86)] py-[72px] text-navy md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,106,0.10),transparent_32%),linear-gradient(180deg,rgba(255,252,246,0.96),rgba(250,248,243,0.88))]" />
      <Container width="page" className="relative">
        <div className="mx-auto max-w-[1400px] rounded-[46px] border border-navy/10 bg-[oklch(0.998_0.003_86)] p-3 shadow-[0_34px_90px_rgba(11,27,43,0.10)] sm:p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-stretch">
            <div className="relative overflow-hidden rounded-[38px] bg-[oklch(0.998_0.003_86)] p-6 shadow-[inset_0_0_0_1px_rgba(11,27,43,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] sm:p-8 lg:p-10 xl:p-12">
              <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-gold/8 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="max-w-[54rem]">
                  <h2 className="max-w-[14ch] font-serif text-[clamp(28px,5.2vw,76px)] font-bold leading-[0.98] tracking-[-0.055em] text-navy">
                    {content.heading}
                  </h2>
                </div>
                <Link
                  href={content.ctaHref}
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-navy px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ivory shadow-[0_18px_42px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy hover:shadow-[0_24px_54px_rgba(157,122,61,0.24)]"
                >
                  {content.ctaLabel}
                  <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
                </Link>
              </div>

              <div className="relative mt-12 overflow-hidden rounded-[34px] border border-navy/10 bg-[oklch(0.997_0.004_86)] shadow-[0_24px_64px_rgba(11,27,43,0.08)]">
                <ol className="relative grid lg:grid-cols-3">
                  {steps.map(({ number, title, copy, icon: Icon }, index) => (
                    <li
                      key={number}
                      className={`group relative min-h-[300px] p-8 transition duration-300 ease-luxe hover:bg-champagne/20 sm:p-9 ${
                        index > 0 ? 'border-t border-navy/10 lg:border-l lg:border-t-0' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <span className="font-serif text-[48px] font-bold leading-none tracking-[-0.08em] text-gold-dark/90 lg:text-[68px]">
                          {number}
                        </span>
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-gold shadow-[0_14px_30px_rgba(11,27,43,0.16)] transition duration-300 group-hover:bg-gold group-hover:text-navy">
                          <Icon className="h-5 w-5" strokeWidth={1.7} />
                        </span>
                      </div>
                      <h3 className="mt-9 max-w-[12ch] font-serif text-[clamp(20px,2.5vw,42px)] font-bold leading-[1.02] tracking-[-0.045em] text-navy">
                        {title}
                      </h3>
                      <p className="mt-5 max-w-[23rem] text-[16px] font-semibold leading-[1.8] tracking-[-0.005em] text-navy/68">{copy}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="group/image relative min-h-[440px] overflow-hidden rounded-[38px] bg-navy shadow-[0_24px_66px_rgba(11,27,43,0.14)] xl:min-h-full">
              <Image
                src={content.image}
                alt={content.imageAlt}
                fill
                sizes="(min-width: 1440px) 410px, 100vw"
                quality={100}
                className="object-cover object-[52%_54%] contrast-[1.06] saturate-[1.08] transition duration-700 ease-luxe group-hover/image:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.02),rgba(11,27,43,0.14)_36%,rgba(11,27,43,0.76)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_20%_92%,rgba(200,169,106,0.22),transparent_30%)] opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="max-w-[22ch] font-serif text-[clamp(34px,3vw,44px)] font-bold leading-[1.08] tracking-[-0.03em] text-ivory [text-shadow:0_4px_24px_rgba(0,0,0,0.52)]">
                  {content.imageOverlay}
                </p>
              </div>
            </div>
          </div>
        </div>

      </Container>
    </section>
  );
}
