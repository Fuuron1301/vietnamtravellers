import Link from 'next/link';
import type { ButtonHTMLAttributes, ElementType, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'light' | 'dark' | 'gold';
type Size = 'sm' | 'md' | 'lg';

const buttonSizes: Record<Size, string> = {
  sm: 'min-h-[40px] px-4 text-[11px]',
  md: 'min-h-[46px] px-[20px] text-[12px]',
  lg: 'min-h-[52px] px-6 text-[12px]'
};

const buttonTones: Record<Tone, string> = {
  gold: 'border-gold/70 bg-gold text-navy shadow-[0_10px_24px_rgba(200,169,106,0.18)] hover:bg-pearl',
  dark: 'border-navy bg-navy text-pearl shadow-[0_12px_28px_rgba(11,27,43,0.16)] hover:border-gold hover:bg-gold hover:text-navy',
  light: 'border-navy/30 bg-white text-navy shadow-[0_8px_18px_rgba(11,27,43,0.07)] hover:border-gold hover:bg-gold hover:text-navy'
};

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={cn('ql-page-shell', className)}>{children}</main>;
}

export function LuxeSection({
  children,
  className = '',
  tone = 'light',
  as: Tag = 'section',
  id
}: {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
  as?: ElementType;
  id?: string;
}) {
  return <Tag id={id} className={cn('ql-section', tone === 'dark' ? 'ql-section-dark' : 'ql-section-light', className)}>{children}</Tag>;
}

export function LuxeContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('ql-container', className)}>{children}</div>;
}

export function LuxeContainerWide({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('ql-container-wide', className)}>{children}</div>;
}

export function LuxeContainerNarrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('ql-container-narrow', className)}>{children}</div>;
}

export function LuxeButton({
  children,
  tone = 'gold',
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size; variant?: 'default' | 'pill' }) {
  return (
    <button
      {...props}
      className={cn(
        'ql-button',
        buttonSizes[size],
        buttonTones[tone],
        variant === 'pill' && 'rounded-full',
        className
      )}
    >
      {children}
    </button>
  );
}

export function LuxeLinkButton({
  children,
  href,
  tone = 'gold',
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: {
  children: ReactNode;
  href: string;
  tone?: Tone;
  size?: Size;
  variant?: 'default' | 'pill';
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'ql-button',
        buttonSizes[size],
        buttonTones[tone],
        variant === 'pill' && 'rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function LuxeInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('ql-field', className)} />;
}

export function LuxeTextarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('ql-field min-h-[100px] py-2', className)} />;
}

export function LuxeSelect({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('ql-field ql-select', className)}>{children}</select>;
}

export function LuxeCard({
  children,
  className = '',
  tone = 'light',
  as: Tag = 'div'
}: {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
  as?: ElementType;
}) {
  return <Tag className={cn('ql-card', tone === 'dark' && 'ql-card-dark', className)}>{children}</Tag>;
}

export function LuxeBadge({ children, className = '', tone = 'light' }: { children: ReactNode; className?: string; tone?: Tone }) {
  return <span className={cn('ql-badge', tone === 'gold' && 'ql-badge-gold', tone === 'dark' && 'ql-badge-dark', className)}>{children}</span>;
}

export function LuxeFormPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('ql-form-panel', className)}>{children}</div>;
}

export function LuxeFloatingAction({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('ql-floating-action', className)}>{children}</div>;
}

export function LuxeTabs({
  items,
  activeTab,
  onChange,
  className = ''
}: {
  items: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('ql-tabs', className)}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'ql-tab-item',
            activeTab === item.id && 'ql-tab-item-active'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function LuxeStepper({
  steps,
  currentStep,
  className = ''
}: {
  steps: { number: number; label: string }[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn('ql-stepper', className)}>
      {steps.map((step, idx) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                'ql-step-item',
                isActive && 'ql-step-item-active',
                isDone && 'ql-step-item-done'
              )}
            >
              <span
                className={cn(
                  'ql-step-badge',
                  isActive && 'ql-step-badge-active',
                  isDone && 'ql-step-badge-done'
                )}
              >
                {isDone ? '✓' : step.number}
              </span>
              <span className="hidden sm:inline ml-2">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-[1px] flex-1 bg-navy/10',
                  isDone && 'bg-gold'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LuxeModal({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="ql-modal-backdrop" onClick={onClose} />
      <div className={cn('ql-modal-panel', className)}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-[20px] font-extrabold text-navy">{title}</h3>
            <button
              onClick={onClose}
              className="text-navy/40 hover:text-navy transition p-1 text-[20px] leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}

export function LuxeChip({
  children,
  isActive,
  onClick,
  className = ''
}: {
  children: ReactNode;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('ql-chip', isActive && 'ql-chip-active', className)}
    >
      {children}
    </button>
  );
}

export function LuxeAccordion({
  items,
  className = ''
}: {
  items: { title: string; content: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn('ql-accordion', className)}>
      {items.map((item, index) => (
        <div key={index} className="ql-accordion-item">
          <div className="ql-accordion-trigger flex justify-between items-center py-2 font-serif text-[18px] text-navy">
            <span>{item.title}</span>
          </div>
          <div className="ql-accordion-content py-2 text-[15px] leading-relaxed text-navy/70">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
