import { readFileSync } from 'node:fs';

const section = readFileSync('components/sections/featured-tours.tsx', 'utf8');
const card = readFileSync('components/ui/tour-card.tsx', 'utf8');

const checks = [
  ['FeaturedTours exposes a previous tour control', /aria-label="Previous tour"/.test(section)],
  ['FeaturedTours exposes a next tour control', /aria-label="Next tour"/.test(section)],
  ['FeaturedTours scrolls the tour rail programmatically', /scrollBy\(/.test(section)],
  ['Tour cards render a guest review quote', /review\.quote/.test(card)],
  ['Tour cards render a review author', /review\.author/.test(card)],
  ['Tour cards render a visible journey CTA', /View journey/.test(card) && !/opacity-0/.test(card)]
];

const failed = checks.filter(([, passed]) => !passed);

if (failed.length) {
  console.error('Featured tours UI check failed:');
  for (const [message] of failed) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Featured tours UI check passed.');
