import Image from 'next/image';
import { BadgeCheck, Gem, HeartHandshake, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Eyebrow, Heading, BodyText } from '@/components/ui/typography';
import type { WhyChooseUsContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

const itemIcons: LucideIcon[] = [Gem, ShieldCheck, HeartHandshake, BadgeCheck];

export function WhyChooseUs({ content = defaultHomeSectionContent.whyChooseUs }: { content?: WhyChooseUsContent } = {}) {
  const backgroundImage = content.backgroundImage;
  const items = content.items.map((item, index) => [itemIcons[index % itemIcons.length], item.title, item.body] as [LucideIcon, string, string]);
  return (
    <section id="why-choose-us" className="relative overflow-hidden bg-pearl py-24 text-navy md:py-32">
      <Image
        src={backgroundImage}
        alt=""
        fill
        sizes="100vw"
        quality={96}
        className="scale-[1.04] object-cover object-[62%_50%] opacity-25"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,245,239,0.98)_0%,rgba(248,245,239,0.95)_34%,rgba(248,245,239,0.84)_62%,rgba(248,245,239,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_20%,rgba(200,169,106,0.18),transparent_24%),radial-gradient(circle_at_80%_78%,rgba(11,27,43,0.09),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-navy/8" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-navy/8" />

      <Container className="relative">
        <Eyebrow>{content.eyebrow}</Eyebrow>
        <Heading className="mt-4 max-w-3xl text-navy">{content.heading}</Heading>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {items.map(([Icon, title, text]) => (
            <div key={title} className="rounded-card border border-navy/10 bg-ivory p-6">
              <Icon className="h-8 w-8 stroke-[1.4] text-gold" />
              <h3 className="ds-h3 mt-6 text-navy">{title}</h3>
              <BodyText className="mt-4 text-sm">{text}</BodyText>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

