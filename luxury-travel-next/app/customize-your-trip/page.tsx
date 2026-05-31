import { TailorMadeForm } from '@/components/tailor-made-form';
import { Section } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { createBookingTourCatalog } from '@/lib/booking-tour-matcher';
import { getContent } from '@/lib/cms';

export const metadata = { title: 'Customize Your Trip', description: 'Multi-step tailor-made luxury travel inquiry form.' };

export default async function CustomizePage() {
  const tourCatalog = createBookingTourCatalog(await getContent('tours'));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.16),transparent_30%),linear-gradient(180deg,#07121e_0px,#0b1b2b_88px,#f8f5ef_88px,#f3e8d7_100%)] pt-[112px]">
      <Section width="page" className="no-safe-top pb-[96px] pt-4 md:pt-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mx-auto max-w-[820px] text-center">
            <Eyebrow>Start planning</Eyebrow>
            <Heading level={1} className="mt-3 !text-[clamp(38px,4.7vw,60px)] text-navy">Tell us the shape of your private journey.</Heading>
            <Lead className="mx-auto mt-5 max-w-[680px]">
              Free inquiry, no payment required to submit. Share your destination wishes, travel rhythm and hotel taste, then choose a recommended tour or ask for direct consultation.
            </Lead>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1220px]">
            <TailorMadeForm compact tourCatalog={tourCatalog} />
          </div>
        </div>
      </Section>
    </main>
  );
}

