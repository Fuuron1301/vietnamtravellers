import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container, Section } from '@/components/layout/container';
import { travelersTeam, teamProfilePath } from '@/lib/travelers-team';

export const metadata: Metadata = {
  title: 'Our Vietnam Travelers Team',
  description: 'Meet the Vietnam Travelers team and open each profile for the full bio and story.'
};

export default function TeamArchivePage() {
  return (
    <main className="bg-ivory">
      <Section width="page">
        <Container width="page">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Vietnam Travelers</p>
              <h1 className="mt-4 max-w-[11ch] font-serif text-[clamp(42px,4.8vw,74px)] font-semibold leading-[0.95] tracking-[-0.06em] text-navy">
                Our Team
              </h1>
            </div>
            <p className="max-w-[44rem] text-[18px] font-bold leading-[1.7] tracking-[-0.02em] text-navy/68 md:text-[20px]">
              These are the travel specialists currently migrated from Vietnam Travelers. Open any profile to read the full bio and view the source story.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {travelersTeam.map((member) => (
              <Link
                key={member.slug}
                href={teamProfilePath(member)}
                className="group overflow-hidden rounded-[32px] border border-navy/10 bg-pearl shadow-[0_16px_42px_rgba(11,27,43,0.07)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_26px_64px_rgba(11,27,43,0.12)]"
              >
                <span className="relative block h-[280px] overflow-hidden bg-champagne md:h-[300px]">
                  <Image
                    src={member.image}
                    alt={member.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    quality={90}
                    className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
                  />
                </span>
                <span className="block p-6 text-center">
                  <span className="block text-[26px] font-black leading-[1.05] tracking-[-0.04em] text-navy">
                    {member.name}
                  </span>
                  <span className="mt-3 block text-[13px] font-extrabold uppercase tracking-[0.16em] text-gold-dark">
                    {member.role}
                  </span>
                  <span className="mt-6 inline-flex min-h-[48px] items-center gap-3 rounded-full bg-navy px-6 text-[12px] font-extrabold uppercase tracking-[0.18em] text-ivory transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy">
                    Open profile
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
