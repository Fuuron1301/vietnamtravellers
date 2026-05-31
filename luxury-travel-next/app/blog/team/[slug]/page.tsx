import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { TeamStoriesCarousel } from '@/components/blog/team-stories-carousel';
import { HeroSection } from '@/components/sections/hero-section';
import { Container, Section } from '@/components/layout/container';
import { CTAButton } from '@/components/ui/cta-button';
import { Eyebrow, Heading } from '@/components/ui/typography';
import { findTravelersTeamMember, travelersTeam, travelersTeamSourceUrl } from '@/lib/travelers-team';

export const revalidate = 300;

export function generateStaticParams() {
  return travelersTeam.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = findTravelersTeamMember(slug);
  if (!member) return {};

  return {
    title: `${member.name} | Vietnam Travelers Team`,
    description: `${member.role}. ${member.bio}`,
    openGraph: {
      title: `${member.name} | Vietnam Travelers Team`,
      description: `${member.role}. ${member.bio}`,
      images: [member.image]
    }
  };
}

export default async function TeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = findTravelersTeamMember(slug);
  if (!member) notFound();

  const otherMembers = travelersTeam.filter((item) => item.slug !== member.slug);

  return (
    <main className="bg-ivory">
      <HeroSection
        eyebrow="Team profile"
        title={member.name}
        subtitle={`${member.role}. ${member.bio}`}
        image={member.image}
        primaryCta={{ href: '/customize-your-trip/', label: 'Plan with us' }}
        secondaryCta={{ href: '/contact/', label: 'Contact the team' }}
      />

      <Section>
        <Container className="max-w-5xl">
          <article className="overflow-hidden rounded-[36px] bg-pearl shadow-[0_22px_70px_rgba(11,27,43,0.09)]">
            <div className="grid gap-0 lg:grid-cols-[0.82fr_1fr]">
              <div className="relative min-h-[360px] bg-champagne">
                <Image
                  src={member.image}
                  alt={member.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  quality={90}
                  className="object-cover"
                />
              </div>
              <div className="p-7 md:p-10 lg:p-12">
                <Eyebrow>Vietnam Travelers profile</Eyebrow>
                <Heading level={2} className="mt-5 text-navy">
                  {member.name}
                </Heading>
                <p className="mt-3 text-[14px] font-extrabold uppercase tracking-[0.18em] text-gold-dark">
                  {member.role}
                </p>
                <p className="mt-7 text-[19px] font-semibold leading-[1.85] tracking-[-0.02em] text-navy/70">
                  {member.bio}
                </p>
                {member.socials.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {member.socials.map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[46px] items-center rounded-full border border-navy/10 bg-champagne px-5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-navy transition duration-300 ease-luxe hover:border-gold hover:bg-gold"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex flex-wrap gap-4">
                  <CTAButton href="/customize-your-trip/">Tailor-made inquiry</CTAButton>
                  <a
                    href={travelersTeamSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-button border border-navy/10 px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-navy transition hover:border-gold hover:text-gold"
                  >
                    Source profile
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </Section>

      <TeamStoriesCarousel members={otherMembers} />
    </main>
  );
}
