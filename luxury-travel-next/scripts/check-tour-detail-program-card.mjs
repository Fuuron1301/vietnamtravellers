import { readFileSync } from 'node:fs';

const detail = readFileSync('components/tour-detail-page.tsx', 'utf8');
const importantNotesPanel = detail.split('TourPanel title="Important notes"')[1]?.split('</TourPanel>')[0] || '';
const programDocumentsPanel = detail.split('TourPanel title="Program documents"')[1]?.split('</TourPanel>')[0] || '';

const checks = [
  ['program documents card exists', /TourPanel title="Program documents"/.test(detail)],
  ['program documents card has print action', /ItineraryProgramActions/.test(programDocumentsPanel)],
  ['program documents card has pdf note', /PDF is not available/.test(programDocumentsPanel) && /offline review/.test(programDocumentsPanel)],
  ['important notes does not contain program actions', !/ItineraryProgramActions/.test(importantNotesPanel)]
];

const failed = checks.filter(([, ok]) => !ok);

if (failed.length) {
  console.error('Tour detail program card check failed:');
  for (const [label] of failed) {
    console.error(`- ${label}`);
  }
  process.exit(1);
}

console.log('Tour detail program card check passed.');
