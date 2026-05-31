import type { Metadata } from 'next';
import { LegalPageShell, type LegalSection } from '@/components/legal/legal-page-shell';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).privacy;
  return { title: page.metaTitle, description: page.metaDescription };
}

const sections: LegalSection[] = [
  {
    title: 'Information we collect',
    intro: 'We collect only the information needed to plan, confirm and support your journey, together with basic website analytics that help us improve the experience.',
    points: [
      'Contact details such as your name, phone number, email address and preferred language when you request a quote or send an inquiry.',
      'Trip details such as destination, dates, number of travelers, hotel preferences, budget range, flight notes and special requests.',
      'Technical information from your browser, device and usage patterns to help us keep the website secure and useful.'
    ]
  },
  {
    title: 'How we use your data',
    intro: 'We use personal data to answer inquiries, prepare proposals, confirm reservations, send travel documents and support the trip before, during and after travel.',
    points: [
      'To respond to messages, build itinerary options and communicate any booking updates.',
      'To arrange services with suppliers such as hotels, cruises, transport providers, local guides and ticketing partners.',
      'To improve website content, measure interest in routes and make our consultation process clearer and faster.'
    ]
  },
  {
    title: 'Sharing with trusted partners',
    intro: 'We share information only when needed to deliver the services you requested or when the law requires it.',
    points: [
      'Relevant booking details may be shared with suppliers who need them to confirm or operate your trip.',
      'Payment partners, email providers, analytics tools and customer support platforms may process limited data on our behalf.',
      'We do not sell your personal information as a business model.'
    ]
  },
  {
    title: 'Payment and security',
    intro: 'We use reasonable technical and organizational measures to reduce unauthorized access, loss or misuse of data.',
    points: [
      'Payment information is processed through the payment methods and gateways listed at checkout or in your invoice flow.',
      'We encourage travelers to use secure devices, strong passwords and trusted networks when sending sensitive information.',
      'No online system is perfectly secure, but we work to keep our tools, forms and internal processes well maintained and access-controlled.'
    ]
  },
  {
    title: 'Cookies, browsing and analytics',
    intro: 'Like most travel websites, we may use cookies or similar tools to remember preferences, measure traffic and understand which content is useful.',
    points: [
      'Cookies may help the site remember language choice, form progress or browsing preferences.',
      'Analytics help us understand route interest, page performance and device behavior so we can improve the experience.',
      'You can usually control cookies through your browser settings, although some features may work less smoothly if they are disabled.'
    ]
  },
  {
    title: 'Retention and access',
    intro: 'We keep information only for as long as needed for business, legal, accounting or service support purposes.',
    points: [
      'You can ask for access, correction or deletion of information where applicable and lawful.',
      'If you want us to stop using your data for marketing emails, you can unsubscribe or contact our team directly.',
      'Some records may need to be retained for tax, dispute resolution or supplier administration requirements.'
    ]
  },
  {
    title: 'Third-party websites and legal updates',
    intro: 'External links, map embeds and supplier pages are controlled by their own privacy rules and terms.',
    points: [
      'Please review the privacy practices of any third-party service you interact with through links on our site.',
      'We may update this policy when our services, suppliers or legal duties change.',
      'The most recent version on this page always replaces older drafts.'
    ]
  }
];

export default async function PrivacySecurityPage() {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).privacy;
  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      updated={page.updated}
      sections={page.sections.length ? page.sections : sections}
      companionLink={{ label: 'Terms & Conditions', href: '/terms-and-conditions/' }}
      highlights={page.highlights}
      variant="privacy"
    />
  );
}
