import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Home,
  Map,
  Menu,
  Newspaper,
  PenLine,
  Search,
  X,
  Phone,
  ArrowUp,
  ExternalLink,
  ChevronUp,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  icon: LucideIcon;
  size?: IconSize;
}

const sizeClasses: Record<IconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function QlIcon({ icon: IconComponent, size = 'sm', className, ...props }: IconProps) {
  return (
    <IconComponent
      className={cn('shrink-0 text-current transition-colors', sizeClasses[size], className)}
      {...props}
    />
  );
}

// Named exports for ease of use
export {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Globe as Globe2,
  Home,
  Map,
  Menu,
  Newspaper,
  PenLine,
  Search,
  X,
  Phone,
  ArrowUp,
  ExternalLink,
  ChevronUp
};
