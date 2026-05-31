'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeUp, luxeTransition } from '@/lib/motion';

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-90px' }}
      transition={{ ...luxeTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

