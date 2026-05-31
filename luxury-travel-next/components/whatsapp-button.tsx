'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/tracking';

export function WhatsAppButton() {
  const pathname = usePathname();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+84962819091';
  const href = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hello, I would like to plan a private luxury trip.')}`;
  const isTourDetail = /^\/[a-z-]+-tours\/[^/]+\/?$/.test(pathname);
  const isConversionFlow = pathname.startsWith('/customize-your-trip') || pathname.startsWith('/payment');
  const isSimCardPage = pathname.startsWith('/sim-card');

  if (isTourDetail || isConversionFlow || isSimCardPage) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent('whatsapp_click', { location: 'floating_button' })}
      aria-label="Contact us on WhatsApp"
      className="group fixed bottom-[18px] right-[14px] z-[75] grid h-[56px] w-[56px] place-items-center rounded-full bg-[#34b442] text-white shadow-[0_18px_44px_rgba(0,0,0,0.22),0_0_0_6px_rgba(52,180,66,0.14)] ring-1 ring-white/25 transition duration-300 ease-luxe hover:-translate-x-1 hover:scale-105 hover:bg-[#42c750] hover:shadow-[0_24px_54px_rgba(0,0,0,0.28),0_0_0_9px_rgba(52,180,66,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/65 md:bottom-[24px] md:right-[22px] md:h-[78px] md:w-[78px]"
    >
      <MessageCircle className="h-6 w-6 transition duration-300 group-hover:scale-110 md:h-8 md:w-8" strokeWidth={2.05} />
    </a>
  );
}
