import { Container } from '@/components/layout/container';
import { Eyebrow, Heading } from '@/components/ui/typography';
import type { JourneyFlowContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

export function JourneyFlow({ content = defaultHomeSectionContent.journeyFlow }: { content?: JourneyFlowContent } = {}) {
  const steps = content.steps;
  const assuranceItems = content.assuranceItems;
  return (
    <section id="journey-flow" className="relative scroll-mt-40 overflow-hidden bg-ivory pb-16 pt-20 text-navy md:pb-32 md:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(200,169,106,0.12),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(11,27,43,0.05),transparent_28%)]" />
      <Container width="page" className="relative">
        <div className="mx-auto max-w-[1220px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_0.62fr] lg:items-end">
            <div>
              <Eyebrow className="text-[13px]">{content.eyebrow}</Eyebrow>
              <Heading className="mt-5 max-w-4xl !text-[clamp(26px,5vw,74px)] !leading-[0.98] tracking-[-0.035em] text-navy">
                {content.heading}
              </Heading>
            </div>
            <p className="max-w-xl text-[15px] font-bold leading-7 text-navy/82 lg:text-[clamp(19px,1.65vw,26px)] lg:leading-9">
              {content.lead}
            </p>
          </div>

          <div className="overflow-hidden rounded-[42px] border border-navy/10 bg-pearl shadow-[0_38px_100px_rgba(11,27,43,0.13)]">
            <div className="bg-navy p-7 text-pearl md:p-10">
              <div>
                <p className="text-[15px] font-extrabold uppercase tracking-[0.22em] text-gold">{content.bannerEyebrow}</p>
                <p className="mt-4 max-w-4xl text-[14px] font-semibold leading-7 text-pearl/88 md:text-[17px] lg:text-[20px] lg:leading-9">
                  {content.bannerBody}
                </p>
              </div>
            </div>

            <div className="p-5 md:p-8">
              <ol className="overflow-hidden rounded-[34px] border border-navy/10 bg-ivory">
                {steps.map((step) => (
                  <li
                    key={step.num}
                    className="group grid gap-6 border-b border-navy/10 p-7 transition duration-300 ease-luxe last:border-b-0 hover:bg-pearl md:grid-cols-[150px_1fr_240px] md:items-center md:p-10"
                  >
                    <span className="font-serif text-[86px] leading-none tracking-[-0.06em] text-gold md:text-[98px]">
                      {step.num}
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold uppercase tracking-[0.18em] text-gold-dark">
                        {step.label}
                      </p>
                      <h3 className="mt-3 font-serif text-[clamp(22px,3.6vw,58px)] leading-[1.03] tracking-[-0.035em] text-navy">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-3xl text-[14px] font-semibold leading-7 text-navy/76 md:text-[17px] lg:text-[20px] lg:leading-9">
                        {step.text}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-gold/35 bg-pearl px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.16em] text-navy/76 shadow-soft">
                      {step.detail}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-navy/10 bg-champagne/35 p-6 md:p-8">
              <div className="grid overflow-hidden rounded-[32px] border border-gold/25 bg-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_48px_rgba(11,27,43,0.08)] md:grid-cols-3">
                {assuranceItems.map((item) => (
                  <div
                    key={item.title}
                    className="group flex min-h-[150px] gap-6 border-b border-gold/18 p-6 transition duration-300 ease-luxe last:border-b-0 hover:bg-ivory/80 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"
                  >
                    <span className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full bg-navy font-serif text-[24px] font-semibold leading-none tracking-[-0.04em] text-gold shadow-[0_14px_34px_rgba(11,27,43,0.16)] transition duration-300 group-hover:bg-gold group-hover:text-navy">
                      {item.num}
                    </span>
                    <div className="min-w-0 pt-1">
                      <h4 className="text-[21px] font-extrabold leading-[1.12] tracking-[-0.035em] text-navy md:text-[23px]">
                        {item.title}
                      </h4>
                      <p className="mt-3 max-w-[31ch] text-[15px] font-bold leading-6 text-navy/68 md:text-[16px]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
