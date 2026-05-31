'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { imageZoom, hoverTransition } from '@/lib/motion';

export function DestinationCard({ href, title, kicker, image, className = '' }: { href: string; title: string; kicker: string; image: string; className?: string }) {
  return (
    <Link href={href} className={className}>
      <motion.article initial="rest" whileHover="hover" className="group relative h-full min-h-64 overflow-hidden rounded-card bg-navy shadow-lift">
        <motion.div variants={imageZoom} transition={{ ...hoverTransition, duration: 1.2 }} className="absolute inset-0">
          <Image src={image} alt={title} fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-navyfade" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-pearl">
          <p className="ds-eyebrow">{kicker}</p>
          <h3 className="ds-h3 mt-4">{title}</h3>
          <span className="mt-6 inline-flex translate-y-2 items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-gold opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">Explore <ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </motion.article>
    </Link>
  );
}

