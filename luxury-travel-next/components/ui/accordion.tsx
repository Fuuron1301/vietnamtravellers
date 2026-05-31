import { ReactNode } from 'react';

export function Accordion({ items }: { items: Array<{ question: string; answer: string | ReactNode }> }) {
  return <div className="grid gap-4">{items.map((item) => <details key={item.question} className="rounded-card border border-navy/10 bg-pearl p-6 shadow-soft"><summary className="cursor-pointer font-serif text-2xl leading-tight tracking-widest text-navy">{item.question}</summary><div className="mt-4 text-sm leading-7 text-navy/64">{item.answer}</div></details>)}</div>;
}

