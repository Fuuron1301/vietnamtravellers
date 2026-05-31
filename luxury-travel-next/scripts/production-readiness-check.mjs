#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const initialEnvKeys = new Set(Object.keys(process.env));

function readEnvValue(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsAt = trimmed.indexOf('=');
    if (equalsAt <= 0) continue;
    const key = trimmed.slice(0, equalsAt).trim();
    if (initialEnvKeys.has(key)) continue;
    process.env[key] = readEnvValue(trimmed.slice(equalsAt + 1));
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const requiredEnv = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_REVALIDATION_SECRET'
];

const recommendedEnv = [
  ['MAIL_SMTP_HOST', 'SMTP_HOST'],
  ['MAIL_SMTP_USER', 'SMTP_USER'],
  ['MAIL_SMTP_PASS', 'SMTP_PASS'],
  ['MAIL_FROM_EMAIL', 'SMTP_FROM'],
  ['MAIL_TO', 'SALES_NOTIFICATION_EMAIL', 'SMTP_TO'],
  'NEXT_PUBLIC_GA4_MEASUREMENT_ID',
  'GOOGLE_SITE_VERIFICATION',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  'RECAPTCHA_SECRET_KEY'
];

const smokePaths = [
  '/',
  '/vietnam-tours/',
  '/laos-tours/',
  '/cambodia-tours/',
  '/thailand-tours/',
  '/myanmar-tours/',
  '/multi-country-tours/',
  '/cruises/',
  '/customize-your-trip/',
  '/contact/',
  '/sitemap.xml',
  '/robots.txt'
];

const apiCollections = ['tours', 'cruises', 'posts', 'countries'];

function isPresent(name) {
  const value = process.env[name];
  return Boolean(value && value.trim() && !/^(change-me|G-XXXXXXXXXX|google-search-console-token)$/i.test(value.trim()));
}

function isPresentGroup(item) {
  if (Array.isArray(item)) return item.some(isPresent);
  return isPresent(item);
}

function envLabel(item) {
  return Array.isArray(item) ? item.join(' or ') : item;
}

async function checkHttp(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, status: 'ERROR', error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const failures = [];
  const report = [];

  report.push('PRODUCTION READINESS CHECK');
  report.push(`Timestamp: ${new Date().toISOString()}`);

  report.push('\n[REQUIRED ENV]');
  for (const item of requiredEnv) {
    const ok = isPresentGroup(item);
    const label = envLabel(item);
    report.push(`${ok ? 'PASS' : 'FAIL'} ${label}`);
    if (!ok) failures.push(`Missing or placeholder env: ${label}`);
  }

  report.push('\n[RECOMMENDED ENV]');
  for (const item of recommendedEnv) {
    const ok = isPresentGroup(item);
    const label = envLabel(item);
    report.push(`${ok ? 'PASS' : 'WARN'} ${label}`);
  }

  if (process.env.ALLOW_DEMO_FALLBACK === 'true') {
    failures.push('ALLOW_DEMO_FALLBACK must be false or unset for production sign-off');
    report.push('FAIL ALLOW_DEMO_FALLBACK is enabled');
  } else {
    report.push('PASS ALLOW_DEMO_FALLBACK disabled');
  }
  if (process.env.ALLOW_STATIC_TOUR_CATALOG === 'true') {
    failures.push('ALLOW_STATIC_TOUR_CATALOG must be false or unset for production sign-off');
    report.push('FAIL ALLOW_STATIC_TOUR_CATALOG is enabled');
  } else {
    report.push('PASS ALLOW_STATIC_TOUR_CATALOG disabled');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if (siteUrl) {
    report.push('\n[FRONTEND SMOKE]');
    for (const path of smokePaths) {
      const result = await checkHttp(new URL(path, siteUrl).toString());
      report.push(`${result.ok ? 'PASS' : 'FAIL'} ${path} -> ${result.status}${result.error ? ` (${result.error})` : ''}`);
      if (!result.ok) failures.push(`Frontend smoke failed: ${path}`);
    }
  }

  const legacyWpUrl = process.env.WORDPRESS_API_URL;
  if (legacyWpUrl) {
    report.push('\n[OPTIONAL LEGACY WORDPRESS API]');
    for (const collection of apiCollections) {
      const result = await checkHttp(`${legacyWpUrl.replace(/\/$/, '')}/content/${collection}`);
      report.push(`${result.ok ? 'PASS' : 'FAIL'} /content/${collection} -> ${result.status}${result.error ? ` (${result.error})` : ''}`);
    }
  }

  report.push('\n[RESULT]');
  report.push(failures.length ? 'NOT APPROVED' : 'APPROVED FOR PRODUCTION ENVIRONMENT');
  for (const failure of failures) report.push(`- ${failure}`);

  console.log(report.join('\n'));
  process.exit(failures.length ? 1 : 0);
}

main();
