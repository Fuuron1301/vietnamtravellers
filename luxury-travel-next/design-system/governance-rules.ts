export const governanceRules = {
  roots: {
    seoSkeleton: 'Asia Pioneer Travel country hub/menu architecture',
    conversion: 'Asiatica Travel tailor-made CTA and professional booking wizard',
    visual: 'LuxTravel DMC / modern Asia Pioneer luxury imagery and icon aesthetic'
  },
  spacingPx: [4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128],
  spacingKeys: ['1', '2', '4', '6', '8', '10', '12', '16', '20', '24', '32'],
  typographyPx: [80, 64, 48, 40, 32, 24, 18, 16, 14],
  durationsMs: [200, 400, 800],
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  colors: {
    navy: '#0B1B2B',
    ivory: '#F8F5EF',
    gold: '#C8A96A',
    gray: ['#FAFAFA', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040', '#262626', '#171717']
  },
  layout: {
    desktopColumns: 12,
    tabletColumns: 8,
    mobileColumns: 4,
    contentMaxWidthPx: 1200
  }
} as const;
