/** @type {import('tailwindcss').Config} */
const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px'
};

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './design-system/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '480px', md: '768px', lg: '1280px', xl: '1440px' },
    spacing,
    extend: {
      maxWidth: { page: '1440px', content: '1200px' },
      colors: {
        navy: '#0B1B2B', ivory: '#F8F5EF', gold: '#C8A96A', 'gold-dark': '#9D7A3D', pearl: '#F8F5EF', ink: '#0B1B2B', champagne: '#EFE5D1', smoke: '#A3A3A3'
      },
      fontFamily: { serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'], sans: ['Manrope', 'Inter', 'Aptos', 'sans-serif'] },
      fontSize: {
        'display-80': ['80px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-64': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-48': ['48px', { lineHeight: '1.15', letterSpacing: '-0.018em' }],
        'heading-40': ['40px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-32': ['32px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-24': ['24px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'body-18': ['18px', { lineHeight: '1.7' }],
        'body-16': ['16px', { lineHeight: '1.7' }],
        'body-14': ['14px', { lineHeight: '1.7' }]
      },
      borderRadius: { button: '12px', card: '16px', panel: '20px' },
      boxShadow: { lift: '0 18px 44px rgba(11, 27, 43, 0.12)', soft: '0 12px 32px rgba(11, 27, 43, 0.08)', glow: '0 0 32px rgba(200, 169, 106, 0.32)', floating: '0 24px 64px rgba(11, 27, 43, 0.18)', elevated: '0 8px 24px rgba(11, 27, 43, 0.12)' },
      backgroundImage: { grain: 'radial-gradient(circle at 18% 10%, rgba(200,169,106,.14), transparent 26%), linear-gradient(135deg, #F8F5EF 0%, #EFE5D1 100%)', navyfade: 'linear-gradient(180deg, rgba(11,27,43,0.08) 0%, rgba(11,27,43,0.88) 100%)' },
      transitionTimingFunction: { luxe: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    }
  },
  plugins: []
};
