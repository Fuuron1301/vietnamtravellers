'use client';

import { usePathname } from 'next/navigation';
import { TripDesignBanner } from '@/components/sections/trip-design-banner';
import { VietnamTripIntroCard } from '@/components/sections/vietnam-trip-intro-card';

export function HomeAfterContent() {
  const pathname = usePathname();

  if (pathname !== '/') {
    return null;
  }

  return (
    <>
      <VietnamTripIntroCard />
      <TripDesignBanner />
    </>
  );
}
