import Image from 'next/image';
import { Container } from '@/components/layout/container';
import type { TrustedByContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

export function TrustedByStrip({ content = defaultHomeSectionContent.trustedBy }: { content?: TrustedByContent } = {}) {
  const trustLogos = content.logos;
  const pressMarks = content.pressMarks;

  return (
    <section
      id="trusted-by"
      className="relative overflow-hidden bg-ivory py-20 text-navy md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(200,169,106,0.14),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(11,27,43,0.06),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-navy/8" />

      <Container width="page" className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)] lg:items-center xl:gap-20">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold-dark">{content.eyebrow}</p>
            <h2 className="mt-4 max-w-[15ch] font-serif text-[clamp(26px,4.9vw,76px)] font-semibold leading-[0.95] tracking-[-0.06em] text-navy">
              {content.heading}
            </h2>
            <p className="mt-6 max-w-[34rem] text-[14px] font-semibold leading-7 tracking-[-0.02em] text-navy/72 md:text-[18px] md:leading-8 lg:text-[20px]">
              {content.lead}
            </p>
            <span className="mt-8 block h-px w-24 bg-gold" />
          </div>

          <div>
            <div className="mx-auto flex max-w-[900px] items-center gap-5">
              <span className="h-px flex-1 bg-navy/12" />
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">
                {content.partnersLabel}
              </span>
              <span className="h-px flex-1 bg-navy/12" />
            </div>

            <div className="mt-10 grid grid-cols-2 items-center gap-x-10 gap-y-12 sm:gap-x-14 md:grid-cols-4 lg:gap-x-16 xl:gap-x-20">
              {trustLogos.map((logo) => (
                <figure key={logo.name} className="group flex min-h-[120px] items-center justify-center px-2 md:min-h-[146px]">
                  <Image
                    src={logo.src}
                    alt={`${logo.name} trusted logo`}
                    width={logo.width}
                    height={logo.height}
                    quality={100}
                    unoptimized
                    className={`${logo.className} object-contain drop-shadow-[0_14px_24px_rgba(11,27,43,0.07)] transition duration-300 ease-luxe group-hover:-translate-y-1 group-hover:scale-[1.035]`}
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-5 border-t border-navy/10 pt-8 md:mt-16 md:grid-cols-[170px_minmax(0,1fr)] md:items-center">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">{content.pressLabel}</p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-[13px] font-black uppercase tracking-[0.1em] text-navy/48 md:justify-end md:gap-x-12 xl:gap-x-14">
            {pressMarks.map((mark) => (
              <span key={mark}>{mark}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
