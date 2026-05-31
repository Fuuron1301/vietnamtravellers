import { Section } from '@/components/layout/container';
import { SimCardCatalog } from '@/components/sim-card-catalog';

export const metadata = { title: 'eSIM & SIM Cards — Compare Travel Data Plans', description: 'Compare and buy eSIM or physical SIM cards for Vietnam, Japan, Korea, Thailand, Singapore, Cambodia. 4G/5G high-speed data plans with instant delivery.' };

export default function SimCardPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#07121e_0px,#0b1b2b_88px,#f8f5ef_88px,#f8f5ef_100%)] pt-[112px]">
      <Section width="page" className="no-safe-top pb-[64px] pt-0 md:pt-0">
        <div className="mx-auto w-full max-w-[1360px]">
          <SimCardCatalog />
        </div>
      </Section>
    </main>
  );
}
