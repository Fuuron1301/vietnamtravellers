#!/usr/bin/env node
import fs from 'node:fs';

const file = 'components/tour-detail-page.tsx';
const source = fs.readFileSync(file, 'utf8');
const fallbackSource = fs.readFileSync('lib/fallback-data.ts', 'utf8');

const checks = [
  ['route stop derivation helper exists', /function\s+deriveRouteStops\s*\(/.test(source)],
  ['source itinerary facts reader exists', /function\s+readSourceItineraryFacts\s*\(/.test(source)],
  ['important notes reader exists', /function\s+readImportantNotes\s*\(/.test(source)],
  ['trip map uses geography coordinate helper', /const\s+destinationCoordinates\b/.test(source) && /function\s+routePoint\s*\(/.test(source)],
  ['trip map renders a BestPrice-style guide panel without copied branding', /function\s+TripRouteMap\s*\(/.test(source) && /Trip map guide/.test(source) && !/BestPriceTravel logo|BestPrice logo|bestprice watermark/i.test(source)],
  ['trip map renders SVG route line', /<svg[\s\S]*<path[\s\S]*routePath/.test(source)],
  ['trip map explains transport legend', /Flight hop/.test(source) && /Land route/.test(source) && /Cruise\/water/.test(source)],
  ['tour detail has redesigned editorial hero shell', /tour-dossier-hero/.test(source) && /Route dossier/.test(source)],
  ['trip map uses legal redrawn Vietnam atlas copy', /Legal redrawn map/.test(source) && /Vietnam route sheet/.test(source)],
  ['trip map has numbered route stop rail', /Route stop rail/.test(source) && /visibleStops\.map/.test(source)],
  ['itinerary uses native details accordion', /<details[\s\S]*<summary/.test(source)],
  ['itinerary heading follows Day number colon title pattern', /Day \{index \+ 1\}:/.test(source)],
  ['itinerary cards show factual meals and stays', /dayFacts\?\.meals/.test(source) && /dayFacts\?\.accommodation/.test(source) && /Source facts/.test(source)],
  ['itinerary section shows important notes', /Important notes/.test(source) && /importantNotes\.map/.test(source)],
  ['source attribution link is visible', /sourceUrl/.test(source) && /Public source/.test(source)],
  ['handcrafted luxury Vietnam tour has 10 detailed days', /slug:\s*'luxury-vietnam-tour-10-days'[\s\S]*sourceItineraryFacts[\s\S]*Day 10/.test(fallbackSource)],
  ['sticky tabs avoid header overlap', /top-\[112px\]/.test(source) || /top-\[116px\]/.test(source)],
  ['tour details include route stop count', /routeStops\.length/.test(source)]
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`Tour detail UI check failed: ${failed}/${checks.length}`);
  process.exit(1);
}

console.log(`Tour detail UI check passed: ${checks.length}/${checks.length}`);
