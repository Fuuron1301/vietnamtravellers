import { Facebook, Instagram, type LucideIcon } from 'lucide-react';

export type BrandSocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const brandContact = {
  phoneDisplay: '+84 962 819 091',
  phoneCompact: '+84962819091',
  phoneHref: 'tel:+84962819091',
  whatsappCompact: '84962819091',
  email: 'info@halongluxury.com'
} as const;

export function brandWhatsappHref(message = 'Hello, I would like to plan a private luxury trip.') {
  return `https://wa.me/${brandContact.whatsappCompact}?text=${encodeURIComponent(message)}`;
}

export const brandSocialLinks: BrandSocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/sunriverside.sanglevan',
    icon: Facebook
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/vietnam_travelers/',
    icon: Instagram
  }
];
