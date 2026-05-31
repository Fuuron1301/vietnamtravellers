'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface SimFaqAccordionProps {
  faqs: FaqItem[];
  title: string;
}

export function SimFaqAccordion({ faqs, title }: SimFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="mt-16 hlt-card-enter">
      <h2 className="mb-10 font-[var(--font-playfair)] text-[28px] font-bold leading-tight text-navy md:text-[32px]">
        {title}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`overflow-hidden rounded-[20px] border-2 transition-all duration-300 ${
                isOpen
                  ? 'border-gold/50 bg-gradient-to-br from-[#fffdf8] to-white shadow-[0_12px_40px_rgba(200,169,106,0.18)]'
                  : 'border-navy/8 bg-white hover:border-gold/30 hover:shadow-[0_6px_24px_rgba(11,27,43,0.08)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center gap-5 px-8 py-6 text-left"
              >
                {/* Number badge */}
                <span
                  className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full font-[var(--font-playfair)] text-[15px] font-bold transition-all duration-300 ${
                    isOpen
                      ? 'bg-gradient-to-br from-gold to-gold-dark text-white shadow-[0_4px_12px_rgba(200,169,106,0.5)]'
                      : 'bg-navy/6 text-navy/40'
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Question text */}
                <span
                  className={`flex-1 text-[16px] font-semibold leading-snug transition-colors duration-200 ${
                    isOpen ? 'text-gold-dark' : 'text-navy'
                  }`}
                >
                  {faq.question}
                </span>

                {/* Chevron */}
                <span
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? 'rotate-180 bg-gold/15'
                      : 'bg-navy/5'
                  }`}
                >
                  <ChevronDown
                    className={`h-[18px] w-[18px] transition-colors duration-200 ${isOpen ? 'text-gold-dark' : 'text-navy/35'}`}
                  />
                </span>
              </button>

              {/* Answer panel */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="mx-8 mb-7 mt-1 rounded-[14px] bg-[linear-gradient(135deg,#fdf8ee_0%,#f9f4e8_100%)] px-7 py-5 ring-1 ring-gold/20">
                  <p className="text-[15px] font-medium leading-[1.9] text-navy/80">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
