#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const allowedSpacing = new Set(['0', '1', '2', '4', '6', '8', '10', '12', '16', '20', '24', '32']);
const allowedDurations = new Set(['200', '400', '800']);
const requiredComponents = ['HeroSection', 'DestinationMosaicGrid', 'TourCard', 'BookingWizard', 'StickyCTA', 'NavigationBar', 'TestimonialCarousel', 'BlogCard', 'FAQAccordion'];
const requiredRoots = ['asia-pioneer-seo', 'asiatica-conversion', 'luxtravel-visual'];
const scanDirs = ['app', 'components'];
const sourceExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const issues = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return sourceExt.has(path.extname(entry.name)) ? [full] : [];
  });
}

function add(file, message) {
  issues.push(`${path.relative(root, file)}: ${message}`);
}

function checkRegistry() {
  const registryPath = path.join(root, 'design-system', 'component-registry.ts');
  const blueprintsPath = path.join(root, 'design-system', 'page-blueprints.ts');
  const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, 'utf8') : '';
  const blueprints = fs.existsSync(blueprintsPath) ? fs.readFileSync(blueprintsPath, 'utf8') : '';
  for (const name of requiredComponents) {
    if (!registry.includes(`name: '${name}'`)) add(registryPath, `missing component contract for ${name}`);
  }
  for (const rootName of requiredRoots) {
    if (!registry.includes(rootName) && !blueprints.includes(rootName)) add(registryPath, `missing root reference ${rootName}`);
  }
  for (const page of ['Home', 'CountryHub', 'TourDetail', 'BlogIndex', 'BlogDetail', 'CustomizeTrip']) {
    if (!blueprints.includes(`page: '${page}'`)) add(blueprintsPath, `missing page blueprint for ${page}`);
  }
  if (registry) {
    const hash = crypto.createHash('sha256').update(registry.replace(/\s+/g, ' ')).digest('hex').slice(0, 16);
    console.log(`Component registry fingerprint: ${hash}`);
  }
}

function checkSourceFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const arbitrary = text.match(/\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|text|bg|duration|tracking|rounded|grid-cols|auto-rows|min-h|max-w|h|w|translate-y|scale)-\[[^\]]+\]/g) || [];
  for (const token of arbitrary) add(file, `arbitrary utility forbidden: ${token}`);

  const hexes = text.match(/#[0-9a-fA-F]{6}\b/g) || [];
  for (const hex of hexes) add(file, `inline hex color forbidden: ${hex}`);

  const spacingRegex = /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|top|right|bottom|left|inset-x|inset-y|inset)-(-?)(\d+)\b/g;
  for (const match of text.matchAll(spacingRegex)) {
    const key = match[2];
    if (!allowedSpacing.has(key)) add(file, `spacing token outside governed scale: ${match[0]}`);
  }

  const durationRegex = /\bduration-(\d+)\b/g;
  for (const match of text.matchAll(durationRegex)) {
    if (!allowedDurations.has(match[1])) add(file, `motion duration outside governed set: ${match[0]}`);
  }

  for (const token of text.match(/\btext-\[|\btext-xs\b/g) || []) add(file, `typography token outside governed scale: ${token}`);
}

checkRegistry();
for (const dir of scanDirs) {
  for (const file of walk(path.join(root, dir))) checkSourceFile(file);
}

if (issues.length) {
  console.error(`\nDesign governance failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  if (issues.length > 120) console.error(`- ...and ${issues.length - 120} more`);
  process.exit(1);
}

console.log('Design governance passed: registry, roots, blueprints, tokens and source utilities are governed.');

