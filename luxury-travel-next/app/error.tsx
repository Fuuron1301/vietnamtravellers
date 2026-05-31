'use client';

import { CTAButton } from '@/components/ui/cta-button';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-ivory px-6 pt-32 text-center text-navy">
      <p className="ds-eyebrow">Temporary interruption</p>
      <h1 className="ds-h1 mx-auto mt-4 max-w-4xl">We could not load this travel page.</h1>
      <p className="ds-body mx-auto mt-6 max-w-2xl">
        Please try again. If the issue continues, our team can still help shape your private journey.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={reset} className="inline-flex min-h-12 items-center justify-center rounded-button bg-gold px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-navy transition hover:-translate-y-1">Try again</button>
        <CTAButton href="/customize-your-trip/" variant="dark">Plan with a specialist</CTAButton>
      </div>
    </main>
  );
}
