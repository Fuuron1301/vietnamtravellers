import type { Metadata } from 'next';
import { LegalPageShell, type LegalSection } from '@/components/legal/legal-page-shell';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).terms;
  return { title: page.metaTitle, description: page.metaDescription };
}

const sections: LegalSection[] = [
  {
    title: 'General agreement',
    intro: 'By browsing this website, requesting a proposal or confirming a journey with Ha Long Luxury Travel, you agree to use our information and services in a lawful, respectful and non-commercial way.',
    points: [
      'Website content is provided for travel planning and inspiration. Text, images, route ideas and design concepts may not be copied, republished or sold without written permission.',
      'We try to keep information accurate, but hotels, cruises, air schedules, seasonal conditions and supplier details can change. Your final written proposal controls the confirmed services.',
      'External links may appear for maps, payment partners, social channels or destination resources. Those websites operate under their own terms and security rules.'
    ]
  },
  {
    title: 'Bookings, quotations and payment',
    intro: 'A trip is reserved only after we send a written confirmation and receive the required deposit or payment according to your proposal.',
    points: [
      'Prices are quoted in the currency shown in your itinerary or invoice. Bank fees, card fees, exchange differences or payment gateway charges may be paid by the traveler unless stated otherwise.',
      'Deposit, balance due date, cancellation charge and refund condition can differ by cruise, hotel, flight, holiday period and private service. We state the exact schedule before confirmation.',
      'If a supplier changes availability before payment is received, we will offer the closest suitable alternative or update the quotation before you decide.'
    ]
  },
  {
    title: 'Cancellations, changes and unused services',
    intro: 'We understand that travel plans can change. Cancellation and amendment fees depend on supplier rules, timing and the type of service already reserved.',
    points: [
      'Requests to change dates, names, room types, cruise cabin categories, routes or guest counts should be sent in writing as early as possible.',
      'Unused hotels, meals, transfers, guide time, entrance tickets or cruise services may not be refundable once the trip has started unless the supplier approves a refund.',
      'If Ha Long Luxury Travel must change part of a journey for safety, weather, operational or supplier reasons, we will aim to protect the overall value and comfort of the trip.'
    ]
  },
  {
    title: 'Children, health and active travel',
    intro: 'Travelers are responsible for choosing a journey that matches their health, mobility, age and comfort level.',
    points: [
      'Families should tell us the ages of all children before booking so we can check bedding, cabin rules, entrance policies and safety requirements.',
      'Activities such as kayaking, cycling, hiking, boating, caving, swimming or food experiences may involve natural risk. Travelers may decline an activity if it does not feel suitable.',
      'Guests should carry appropriate travel insurance that covers medical care, emergency assistance, cancellation, lost baggage and relevant activities.'
    ]
  },
  {
    title: 'Itinerary, accommodation and transport',
    intro: 'We design journeys carefully, but exact timing can be affected by weather, traffic, tides, flight schedules, local events and supplier operations.',
    points: [
      'Check-in, check-out, early arrival, late departure, cabin assignment, room view and adjoining room requests depend on hotel or cruise availability.',
      'Photos on the website show style and category, not always the exact room, vehicle, boat, guide or dining setup confirmed for every departure.',
      'Private transfers include the route and waiting time stated in your itinerary. Extra stops, late-night changes or additional usage may require a supplement.'
    ]
  },
  {
    title: 'Travel documents and luggage',
    intro: 'Each traveler must hold valid passports, visas, permits, health documents and entry requirements for every destination on the route.',
    points: [
      'We may provide general visa or entry guidance, but final responsibility remains with the traveler and the relevant embassy, airline or border authority.',
      'Domestic flights, seaplanes, cruises and small boats may apply luggage limits. Extra baggage, oversized items or special equipment should be declared before booking.',
      'Ha Long Luxury Travel is not responsible for denied boarding, refused entry or service loss caused by missing documents, passport validity issues or undeclared baggage restrictions.'
    ]
  },
  {
    title: 'Photography, reviews and traveler content',
    intro: 'We may ask for permission to use guest comments, photos or feedback. We only use personal trip content when it is shared with clear consent.',
    points: [
      'Guests may request that private names, faces, family details or special occasion information are not used in marketing materials.',
      'Reviews, testimonials and travel photos should be accurate, respectful and owned by the person who submits them.',
      'If you want a published image or review removed, contact us and we will review the request promptly.'
    ]
  },
  {
    title: 'Responsibility, suppliers and force majeure',
    intro: 'Ha Long Luxury Travel acts as a travel designer and coordinator for services delivered by hotels, cruises, airlines, transport providers, guides and local suppliers.',
    points: [
      'We select suppliers with care, but we cannot control every operational decision made by independent providers, authorities or carriers.',
      'We are not liable for delays, losses or service interruptions caused by weather, natural events, illness, strikes, government action, transport disruption, border closures or other events beyond reasonable control.',
      'If an issue happens during travel, guests should notify our team as soon as possible so we can help while the service is still taking place.'
    ]
  }
];

export default async function TermsAndConditionsPage() {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).terms;
  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      updated={page.updated}
      sections={page.sections.length ? page.sections : sections}
      companionLink={{ label: 'Privacy Policy', href: '/privacy-security/' }}
      highlights={page.highlights}
      variant="terms"
    />
  );
}
