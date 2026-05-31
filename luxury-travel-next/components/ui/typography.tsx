import { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('ds-eyebrow', className)} suppressHydrationWarning>{children}</p>;
}

export function Heading({ children, level = 2, className = '', as }: { children: ReactNode; level?: 1 | 2 | 3; className?: string; as?: ElementType }) {
  const Tag = as || (`h${level}` as ElementType);
  const size = level === 1 ? 'ds-h1' : level === 2 ? 'ds-h2' : 'ds-h3';
  return <Tag className={cn(size, className)} suppressHydrationWarning>{children}</Tag>;
}

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('ds-body text-lg', className)} suppressHydrationWarning>{children}</p>;
}

export function BodyText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('ds-body', className)} suppressHydrationWarning>{children}</p>;
}

