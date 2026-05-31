import { readFileSync } from 'node:fs';

const header = readFileSync('components/header.tsx', 'utf8');

const checks = [
  ['Tour title labels do not use truncate clipping', !/tour-route-title[\s\S]*?truncate/.test(header)],
  ['Tour title labels use generous leading', /tour-route-title/.test(header) && /leading-\[1\.3\]/.test(header)],
  ['Tour menu removes preview eyebrow labels', !/Private route preview|Now viewing/.test(header)],
  ['Tour menu removes landmark badges from route cards', !/>\s*\{item\.landmark\}\s*</.test(header)],
  ['Tour menu removes active landmark badge', !/>\s*\{activeTour\.landmark\}\s*</.test(header)],
  ['Tour menu exposes a refined itinerary meta row', /Signature stops/.test(header)],
  ['Signature stops is rendered without a framed pill', !/Signature stops[\s\S]{0,260}rounded-\[28px\]|rounded-\[28px\][\s\S]{0,260}Signature stops/.test(header)],
  ['Tour choice panel uses a near half-screen column', /grid-cols-\[minmax\(680px,0\.98fr\)_minmax\(560px,1fr\)\]/.test(header)],
  ['Tour choice tiles avoid thin blue ring styling', !/ring-navy/.test(header)],
  ['Last tour choice spans both columns for balance', /index === tourChoices\.length - 1 && 'col-span-2'/.test(header)],
  ['Tour menu uses larger desktop preview heading', /text-\[clamp\(84px,7vw,140px\)\]/.test(header)]
];

const failed = checks.filter(([, passed]) => !passed);

if (failed.length) {
  console.error('Header tour menu polish check failed:');
  for (const [message] of failed) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Header tour menu polish check passed.');
