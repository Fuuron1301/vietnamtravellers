'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Anchor, ArrowUpRight } from 'lucide-react';
import { CmsItem } from '@/lib/types';

export function CruiseCard({ cruise }: { cruise: CmsItem }) {
  const route = String(cruise.meta.details?.route || cruise.meta.details?.country || 'Vietnam waters');
  const price = cruise.meta.pricing?.[0]?.price || 'Price on request';
  return (
    <Link href={`/cruise/${cruise.slug}/`} className="group overflow-hidden rounded-card bg-pearl shadow-soft transition duration-200 ease-luxe hover:-translate-y-1">
      <div className="relative h-80 overflow-hidden">
        <Image src={cruise.featuredImage} alt={cruise.title} fill className="object-cover transition duration-800 ease-luxe group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/72 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-button bg-gold px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-navy"><Anchor className="h-4 w-4" /> {route}</div>
      </div>
      <div className="p-6">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">{price}</p>
        <h3 className="ds-h3 mt-4 text-navy">{cruise.title}</h3>
        <p className="mt-4 line-clamp-2 text-sm leading-7 text-navy/64">{cruise.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-gold">View cruise <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}
