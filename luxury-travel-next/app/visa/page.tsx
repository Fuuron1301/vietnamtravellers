import { Section } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { VisaApplicationForm } from '@/components/visa-form';

export const metadata = { title: 'Asia Visa Application', description: 'Vietnam visa application form — e-Visa service with fast processing.' };

export default function VisaPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.16),transparent_30%),linear-gradient(180deg,#07121e_0px,#0b1b2b_88px,#f8f5ef_88px,#f3e8d7_100%)] pt-[88px]">
      <Section width="page" className="no-safe-top pb-[96px] !pt-6 md:!pt-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mx-auto max-w-[820px] text-center">
            <Eyebrow>Visa Service</Eyebrow>
            <Heading level={1} className="mt-3 !text-[clamp(38px,4.7vw,60px)] text-navy">Vietnam Visa Application</Heading>
            <Lead className="mx-auto mt-5 max-w-[680px]">
              Fast e-Visa processing with no embassy visit required. Complete your application in minutes and receive your visa approval letter via email.
            </Lead>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1060px]">
            <VisaApplicationForm />
          </div>
        </div>
      </Section>
    </main>
  );
}
