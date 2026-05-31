#!/usr/bin/env node
import fs from 'node:fs';

const file = 'app/blog/[slug]/page.tsx';
const source = fs.readFileSync(file, 'utf8');

const checks = [
  ['blog detail has redesigned hero marker', /blog-detail-hero/.test(source)],
  ['hero uses article dossier label', /Article dossier/.test(source)],
  ['hero has reading compass panel', /Reading compass/.test(source)],
  ['hero image is framed as an editorial plate', /hero-image-plate/.test(source)],
  ['hero keeps accessible breadcrumb navigation', /aria-label="Article breadcrumb"/.test(source)]
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`Blog detail UI check failed: ${failed}/${checks.length}`);
  process.exit(1);
}

console.log(`Blog detail UI check passed: ${checks.length}/${checks.length}`);
