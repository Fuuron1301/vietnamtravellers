import { readFileSync } from 'node:fs';

const hero = readFileSync('components/sections/hero-section.tsx', 'utf8');
const home = readFileSync('components/home/home-page.tsx', 'utf8');

const expectations = [
  ['home enables the hero planning filter', /showPlanningFilter/.test(home)],
  ['hero accepts a planning filter prop', /showPlanningFilter\s*=\s*false/.test(hero)],
  ['hero filter submits to customize trip', /action="\/customize-your-trip\/"/.test(hero) && /method="get"/.test(hero)],
  ['hero filter has destination field', /name="destination"/.test(hero) && /Destination/.test(hero)],
  ['hero filter has duration field', /name="duration"/.test(hero) && /All Duration/.test(hero)],
  ['hero filter has travel date field', /name="dates"/.test(hero) && /Start Date/.test(hero)],
  ['hero filter uses premium search CTA', /Search Now/.test(hero) && /Search/.test(hero)],
  ['hero filter uses booking option data', /bookingDestinations/.test(hero) && /bookingDurations/.test(hero)],
  ['hero filter has responsive mobile layout', /lg:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(0,0\.95fr\)_minmax\(0,0\.8fr\)_auto\]/.test(hero)]
];

const failed = expectations.filter(([, passed]) => !passed);

if (failed.length) {
  console.error('Hero planning filter check failed:');
  for (const [message] of failed) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Hero planning filter check passed.');
