import Image from 'next/image';
import { CmsItem } from '@/lib/types';
import { Container } from '@/components/layout/container';
import { Eyebrow } from '@/components/ui/typography';
import type { TestimonialsContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

export function TestimonialCinema({ testimonials, content = defaultHomeSectionContent.testimonials }: { testimonials: CmsItem[]; content?: TestimonialsContent }) {
  const item = testimonials[0];
  return <section className="relative overflow-hidden bg-navy py-32 text-center text-pearl"><Image src={content.backgroundImage} alt="Luxury travel testimonial" fill className="object-cover opacity-20" /><Container className="relative"><Eyebrow>{content.eyebrow}</Eyebrow><blockquote className="mx-auto mt-12 max-w-4xl font-serif text-display-48 leading-tight tracking-widest md:text-display-64">&ldquo;{item?.excerpt || content.fallbackQuote}&rdquo;</blockquote><p className="mt-8 text-sm font-extrabold uppercase tracking-widest text-gold">{item?.title || content.fallbackAuthor}</p></Container></section>;
}


