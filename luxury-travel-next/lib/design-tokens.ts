export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
} as const;

export const colors = {
  navy: '#0B1B2B',
  ivory: '#F8F5EF',
  gold: '#C8A96A',
  pearl: '#F8F5EF',
  gray: {
    50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5', 300: '#D4D4D4', 400: '#A3A3A3',
    500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717'
  }
} as const;

export const typography = {
  display: { xl: '80px', lg: '64px', md: '48px', lineHeight: '1.1' },
  heading: { lg: '40px', md: '32px', sm: '24px', lineHeight: '1.2' },
  body: { lg: '18px', md: '16px', sm: '14px', lineHeight: '1.7' }
} as const;

export const grid = { desktop: 12, tablet: 8, mobile: 4, contentMax: '1200px', gap: spacing[6] } as const;

export const radius = { button: '12px', card: '16px', panel: '20px' } as const;

export const motion = {
  ease: [0.22, 1, 0.36, 1],
  microDuration: 0.2,
  uiDuration: 0.4,
  sectionDuration: 0.8,
  fadeDistance: 40,
  imageHoverScale: 1.08
} as const;
