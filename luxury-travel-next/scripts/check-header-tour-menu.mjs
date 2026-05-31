import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../components/header.tsx', import.meta.url), 'utf8');

const expectations = [
  ['Pexels 4K landmark images', /images\.pexels\.com\/photos\/34635615[\s\S]*?w=3840&q=100/],
  ['full 4K image loading', /unoptimized/],
  ['cinematic tour shell', /bg-navy text-pearl/],
  ['large tour image canvas', /min-h-\[500px\]/],
  ['safe viewport menu height', /h-\[calc\(100vh-104px\)\] overflow-hidden/],
  ['top horizontal destination rail', /grid-rows-\[auto_1fr\][\s\S]*aria-label="Destination quick view"[\s\S]*grid min-h-0 grid-cols/],
  ['no vertical tour stack', /grid-cols-7/],
  ['menu sits above sticky CTA', /z-\[80\]/],
  ['image copy has dark readable panel', /bg-\[rgba\(11,27,43,0\.86\)\]/],
  ['active tab avoids white wash', /selected \? 'border-gold\/70 bg-gold text-navy/],
  ['detailed destination copy', /description: 'Private routing with bay cruises/],
  ['featured journey overlay', /Cinematic preview/],
  ['landmark label', /landmark: 'Ha Long Bay'/],
  ['large responsive image sizes', /sizes="\(min-width: 1280px\) 50vw, 100vw"/]
];

const missing = expectations.filter(([, pattern]) => !pattern.test(header));

if (missing.length > 0) {
  console.error('Header tour menu is missing:');
  for (const [label] of missing) {
    console.error(`- ${label}`);
  }
  process.exit(1);
}

console.log('Header tour menu checks passed.');
