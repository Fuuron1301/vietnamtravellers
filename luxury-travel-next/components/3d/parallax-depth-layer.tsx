'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

export function ParallaxDepthLayer({ children, speed = 0.18, className = '' }: { children?: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [64 * speed, -64 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.82, 1, 1, 0.82]);
  return <motion.div ref={ref} style={{ y, opacity }} className={className}>{children}</motion.div>;
}

