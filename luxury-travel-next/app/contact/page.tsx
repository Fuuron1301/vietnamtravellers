import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react';
import { HeroSection } from '@/components/sections/hero-section';
import { Container } from '@/components/layout/container';
import { Eyebrow, Heading } from '@/components/ui/typography';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).contact;
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function ContactPage() {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).contact;
  const phoneNumber = page.phoneNumber;
  const compactPhoneNumber = page.compactPhoneNumber;
  const emailAddress = page.emailAddress;
  const officeAddress = page.officeAddress;
  const whatsappHref = `https://wa.me/${compactPhoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hello Ha Long Luxury Travel, I would like to plan a private Asia journey.')}`;
  const emailHref = `mailto:${emailAddress}?subject=${encodeURIComponent('Private journey consultation')}`;
  const mapHref = page.mapHref;
  const responseSteps = page.responseSteps;
  const planningDetails = page.planningDetails;
  const contactMethods: Array<{ title: string; value: string; copy: string; href: string; action: string; Icon: LucideIcon; external?: boolean }> = [
    { title: 'WhatsApp / Viber', value: phoneNumber, copy: 'Best for quick questions, live trip support and sending photos or inspiration.', href: whatsappHref, action: 'Message now', Icon: MessageCircle, external: true },
    { title: 'Email our team', value: emailAddress, copy: 'Send dates, guest count, budget level and must-see places for a clearer proposal.', href: emailHref, action: 'Send email', Icon: Mail },
    { title: 'Hanoi office', value: officeAddress, copy: 'Private appointment available by request for guests and partners in Hanoi.', href: mapHref, action: 'Open map', Icon: MapPin, external: true }
  ];
  return (
    <main className="bg-ivory">
      <HeroSection
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        subtitle={page.heroSubtitle}
        image={page.heroImage}
        primaryCta={{ href: page.heroCtaHref, label: page.heroCtaLabel }}
      />
      <section className="relative overflow-hidden bg-ivory py-20 text-navy md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(200,169,106,0.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(11,27,43,0.08),transparent_26%)]" />
        <Container width="page" className="relative">
          <div className="grid gap-10 lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)] lg:items-start xl:gap-14">
            <aside className="rounded-[42px] bg-[linear-gradient(145deg,rgba(11,27,43,0.98),rgba(16,38,56,0.96),rgba(13,34,52,0.98))] p-8 text-pearl shadow-[0_30px_90px_rgba(11,27,43,0.18)] md:p-10 xl:p-12">
              <Eyebrow className="!text-[14px] !font-black !tracking-[0.3em] text-gold">{page.consultEyebrow}</Eyebrow>
              <Heading className="mt-4 max-w-[10ch] text-pearl">{page.consultHeading}</Heading>
              <p className="mt-6 max-w-xl text-[17px] font-semibold leading-8 text-pearl/74">
                {page.consultLead}
              </p>

              <div className="mt-8 border-t border-pearl/12">
                <a
                  href={`tel:${compactPhoneNumber}`}
                  className="group grid gap-3 py-4 transition duration-300 ease-luxe sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-pearl/10 bg-pearl/[0.05]">
                    <Phone className="h-[18px] w-[18px] text-gold transition group-hover:scale-110" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-black uppercase tracking-[0.26em] text-gold/90">Direct line</span>
                    <span className="mt-1 block text-[16px] font-bold leading-7 text-pearl">{phoneNumber}</span>
                  </span>
                </a>
                <a
                  href={emailHref}
                  className="group grid gap-3 border-t border-pearl/10 py-4 transition duration-300 ease-luxe sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-pearl/10 bg-pearl/[0.05]">
                    <Mail className="h-[18px] w-[18px] text-gold transition group-hover:scale-110" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-black uppercase tracking-[0.26em] text-gold/90">Email</span>
                    <span className="mt-1 block text-[16px] font-bold leading-7 text-pearl">{emailAddress}</span>
                  </span>
                </a>
                <div className="grid gap-3 border-t border-pearl/10 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-pearl/10 bg-pearl/[0.05]">
                    <Clock className="h-[18px] w-[18px] text-gold" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-black uppercase tracking-[0.26em] text-gold/90">Opening hours</span>
                    <span className="mt-1 block text-[16px] font-bold leading-7 text-pearl">Open daily, 8:00 AM to 10:00 PM ICT</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[50px] items-center gap-3 rounded-[16px] bg-gold px-6 text-[12px] font-black uppercase tracking-[0.22em] text-navy shadow-[0_16px_34px_rgba(200,169,106,0.22)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-[#e2c57f]"
                >
                  WhatsApp now <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link
                  href="/customize-your-trip/"
                  className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.24em] text-pearl/72 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:text-gold"
                >
                  Tailor-made form <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10">
                <p className="text-[13px] font-black uppercase tracking-[0.3em] text-gold">{page.planningDetailsHeading}</p>
                <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {planningDetails.map((detail) => (
                    <p key={detail} className="flex items-start gap-3 text-[13px] font-semibold leading-6 text-pearl/82">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{detail}</span>
                    </p>
                  ))}
                </div>
              </div>
            </aside>

            <article className="rounded-[42px] border border-navy/10 bg-[linear-gradient(180deg,rgba(248,245,239,0.98),rgba(243,236,223,0.96))] p-8 shadow-[0_18px_48px_rgba(11,27,43,0.08)] md:p-10 xl:p-12">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[14px] font-black uppercase tracking-[0.3em] text-gold-dark">{page.responseEyebrow}</p>
                  <h2 className="mt-3 max-w-[14ch] font-serif text-[clamp(38px,3.4vw,58px)] font-semibold leading-[0.96] tracking-[-0.06em] text-navy">
                    {page.responseHeading}
                  </h2>
                </div>
                <p className="max-w-[20rem] text-[15px] font-bold leading-7 text-navy/60">
                  Every inquiry is checked by a consultant before we reply with a clear, no-obligation recommendation.
                </p>
              </div>

              <div className="relative mt-10">
                <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-gold/0 via-gold/45 to-gold/0 lg:block" />
                <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
                  {responseSteps.map((step) => (
                    <div key={step.step} className="relative">
                      <div className="inline-flex items-center gap-3">
                        <span className="text-[13px] font-black uppercase tracking-[0.34em] text-gold-dark">{step.step}</span>
                        <span className="h-px w-12 bg-gold/40 lg:hidden" />
                      </div>
                      <h3 className="mt-4 text-[19px] font-black leading-6 tracking-[-0.04em] text-navy">{step.title}</h3>
                      <p className="mt-3 max-w-[22ch] text-[15px] font-medium leading-7 text-navy/64">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 border-y border-navy/10">
                {contactMethods.map(({ title, value, copy, href, action, Icon, external }, index) => (
                  <a
                    key={title}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    className={`group grid gap-4 py-6 transition duration-300 ease-luxe sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${index === 0 ? '' : 'border-t border-navy/8'}`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-champagne text-gold-dark">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[18px] font-black leading-6 tracking-[-0.04em] text-navy">{title}</p>
                        <p className="mt-1 text-[14px] font-extrabold leading-6 text-gold-dark">{value}</p>
                        <p className="mt-2 max-w-2xl text-[14px] font-medium leading-6 text-navy/60">{copy}</p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-navy/58 transition group-hover:text-gold-dark sm:inline-flex sm:justify-self-end">
                      {action} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[24px] border border-gold/18 bg-champagne/55 px-5 py-4 text-[14px] font-bold leading-7 text-navy/72">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gold-dark" />
                Your contact details are used only for trip planning, quotation and booking follow-up.
              </div>
            </article>
          </div>
        </Container>
      </section>
    </main>
  );
}
