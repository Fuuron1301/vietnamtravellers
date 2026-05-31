import { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Width = 'content' | 'page' | 'full';

export function Container({ children, width = 'content', className = '' }: { children: ReactNode; width?: Width; className?: string }) {
  return <div className={cn(width === 'page' ? 'ds-page' : width === 'full' ? 'w-full' : 'ds-container', className)}>{children}</div>;
}

export function Section({ children, className = '', width = 'content', as: Tag = 'section', id }: { children: ReactNode; className?: string; width?: Width; as?: ElementType; id?: string }) {
  return <Tag id={id} className={cn('ds-section', className)}><Container width={width}>{children}</Container></Tag>;
}

export function Grid12({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-12', className)}>{children}</div>;
}

export function SplitLayout({ left, right, className = '' }: { left: ReactNode; right: ReactNode; className?: string }) {
  return <Grid12 className={className}><div className="md:col-span-5">{left}</div><div className="md:col-span-7">{right}</div></Grid12>;
}

