import Link from 'next/link';
import { ArrowUpRight, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { AnimatedLegalSection } from '@/components/legal/animated-legal-section';
import { cn } from '@/lib/utils';

export type LegalSection = {
  title: string;
  intro?: string;
  points?: string[];
};

export type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
  companionLink: {
    label: string;
    href: string;
  };
  highlights: string[];
  variant?: 'terms' | 'privacy';
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updated,
  sections,
  companionLink,
  highlights,
  variant = 'terms'
}: LegalPageShellProps) {
  const Icon = variant === 'privacy' ? LockKeyhole : FileText;
  const sectionCount = sections.length;

  return (
    <main className="overflow-hidden bg-[oklch(0.965_0.018_82)] text-navy">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#061521_0%,#08283a_52%,#104941_100%)] pt-[106px] text-pearl md:pt-[122px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(200,169,106,0.22),transparent_31%),radial-gradient(circle_at_84%_12%,rgba(248,245,239,0.14),transparent_26%),radial-gradient(circle_at_78%_86%,rgba(65,138,122,0.22),transparent_34%),linear-gradient(180deg,rgba(6,21,33,0.03),rgba(6,21,33,0.34))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(248,245,239,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(248,245,239,0.12)_1px,transparent_1px)] [background-size:58px_58px]" />
        <div className="pointer-events-none absolute right-[-0.04em] top-[0.12em] hidden font-serif text-[clamp(104px,14vw,240px)] font-black uppercase leading-none tracking-[-0.1em] text-pearl/[0.045] lg:block">
          {variant === 'privacy' ? 'SECURE' : 'TERMS'}
        </div>

        <Container width="page" className="relative pb-[clamp(76px,9vw,136px)]">
          <nav className="mb-[clamp(42px,5vw,74px)] flex flex-wrap items-center gap-3 text-[12px] font-black uppercase tracking-[0.18em] text-pearl/[0.58]" aria-label="Breadcrumb">
            <Link href="/" className="transition duration-300 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Home</Link>
            <span className="h-px w-8 bg-gold/45" />
            <span className="text-gold">{title}</span>
          </nav>

          <div className="grid gap-[clamp(40px,6vw,98px)] lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.42fr)] lg:items-end">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.34em] text-gold">{eyebrow}</p>
              <h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(46px,6.4vw,92px)] font-semibold leading-[0.9] tracking-[-0.074em] text-pearl drop-shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
                {title}
              </h1>
              <p className="mt-8 max-w-[64rem] text-[clamp(16px,1.15vw,20px)] font-semibold leading-[1.78] text-pearl/76">
                {description}
              </p>
            </div>

            <aside className="overflow-hidden rounded-[34px] border border-pearl/14 bg-pearl/[0.07] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.19)]">
              <div className="flex items-center gap-4">
                <span className={cn('grid h-16 w-16 shrink-0 place-items-center rounded-[22px] border text-gold shadow-[inset_0_1px_0_rgba(248,245,239,0.08)]', variant === 'privacy' ? 'border-emerald-200/20 bg-emerald-200/10' : 'border-gold/24 bg-gold/[0.13]')}>
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gold">Last updated</p>
                  <p className="mt-1 text-[16px] font-bold text-pearl">{updated}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-pearl/12 pt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-pearl/48">At a glance</p>
                <div className="mt-4 grid gap-0">
                  {highlights.map((item) => (
                    <p key={item} className="flex gap-3 border-t border-pearl/10 py-4 text-[13px] font-semibold leading-6 text-pearl/[0.74] first:border-t-0 first:pt-0">
                      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="relative py-[clamp(78px,8vw,132px)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(200,169,106,0.16),transparent_26%),radial-gradient(circle_at_88%_28%,rgba(11,27,43,0.06),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Container width="page" className="relative grid gap-[clamp(38px,6vw,96px)] md:grid-cols-12 md:items-start">
          <aside className="md:col-span-5">
            <div className="sticky top-[108px] overflow-hidden rounded-[42px] border border-ivory/12 bg-[linear-gradient(155deg,#061521_0%,#0b2a36_56%,#143c39_100%)] text-ivory shadow-[0_30px_86px_rgba(11,27,43,0.2)]">
              <div className="relative p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.24),transparent_34%)]" />
                <div className="relative">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-gold">Find your answer</p>
                  <h2 className="mt-5 max-w-[13ch] font-serif text-[clamp(38px,3.4vw,56px)] font-semibold leading-[0.94] tracking-[-0.064em] text-ivory">
                    Choose the right legal lane.
                  </h2>
                  <p className="mt-5 max-w-[28rem] text-[15px] font-semibold leading-8 text-ivory/66">
                    Browse {sectionCount} policy notes, then open the clause that affects your booking or data request.
                  </p>
                </div>
              </div>

              <nav className="grid gap-0 border-t border-ivory/10 px-6 py-2" aria-label={`${title} sections`}>
                {sections.map((section, index) => (
                  <a key={section.title} href={`#section-${index + 1}`} className="group grid min-h-[62px] grid-cols-[34px_1fr_30px] items-center gap-3 border-t border-ivory/10 px-1 text-ivory/76 transition duration-300 ease-luxe first:border-t-0 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
                    <span className="font-serif text-[18px] leading-none tracking-[-0.06em] text-gold/70">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[10px] font-black uppercase leading-5 tracking-[0.16em]">{section.title}</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-ivory/14 bg-ivory/[0.03] text-ivory/50 transition duration-300 ease-luxe group-hover:border-gold/40 group-hover:bg-gold group-hover:text-navy">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </nav>

              <div className="border-t border-ivory/10 px-8 py-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold">Concierge note</p>
                <p className="mt-3 max-w-[28rem] text-[14px] font-semibold leading-7 text-ivory/62">
                  If a clause changes how you book, pay or share details, ask us before you commit.
                </p>
                <Link href="/contact/" className="group mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gold transition duration-300 ease-luxe hover:text-ivory">
                  Contact us
                  <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 ease-luxe group-hover:rotate-12" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="md:col-span-7">
            <div className="grid gap-3">
              {sections.map((section, index) => (
                <AnimatedLegalSection key={section.title} section={section} index={index} defaultOpen={index === 0} />
              ))}
            </div>

            <section className="relative mt-10 overflow-hidden rounded-[44px] border border-navy/10 bg-pearl p-[clamp(28px,5vw,66px)] shadow-[0_28px_86px_rgba(11,27,43,0.1)]">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold-dark">Related legal page</p>
                  <h2 className="mt-4 max-w-[14ch] font-serif text-[clamp(40px,4.6vw,76px)] font-semibold leading-[0.96] tracking-[-0.066em] text-navy">
                    Read the companion policy.
                  </h2>
                </div>
                <Link href={companionLink.href} className="group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-navy px-8 text-[12px] font-black uppercase tracking-[0.18em] text-ivory shadow-[0_14px_34px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
                  {companionLink.label}
                  <ArrowUpRight className="h-4 w-4 transition duration-300 ease-luxe group-hover:rotate-12" />
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}
