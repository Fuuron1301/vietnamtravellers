export const visualQaCheckpoints = [
  {
    page: 'Homepage',
    path: '/',
    viewports: ['mobile-390', 'desktop-1440'],
    checks: ['cinematic hero stable', 'destination mosaic aligned', 'sticky CTA visible after delay', 'card hover behavior consistent']
  },
  {
    page: 'Country hub',
    path: '/vietnam-tours/',
    viewports: ['mobile-390', 'desktop-1440'],
    checks: ['hub narrative visible above fold', 'featured tours linked', 'related guides and neighboring hubs present', 'FAQ schema section stable']
  },
  {
    page: 'Tour detail',
    path: '/vietnam-tours/luxury-vietnam-tour-10-days/',
    viewports: ['mobile-390', 'desktop-1440'],
    checks: ['breadcrumb hierarchy visible', 'gallery has no layout shift', 'sticky booking form aligned', 'related links present']
  },
  {
    page: 'Booking form',
    path: '/customize-your-trip/',
    viewports: ['mobile-390', 'desktop-1440'],
    checks: ['duration step present', 'progress bar stable', 'trust promises visible before submit', 'touch targets comfortable']
  }
] as const;
