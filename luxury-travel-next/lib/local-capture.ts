import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

type JsonRecord = Record<string, unknown>;

type LeadRecord = {
  id: string;
  status: 'WARM';
  destination: string;
  budget: string;
  email: string;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
};

type BookingRecord = {
  id: string;
  bookingId: string;
  status: 'PENDING';
  method: string;
  amount: number;
  currency: string;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
};

const dataDir = process.env.LOCAL_CAPTURE_DIR || path.join(process.cwd(), '.local-data');

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function payloadContact(payload: unknown) {
  if (!isRecord(payload)) return {};
  return isRecord(payload.contact) ? payload.contact : {};
}

function leadDestination(payload: unknown) {
  if (!isRecord(payload)) return 'Unspecified';
  if (Array.isArray(payload.destinations) && payload.destinations.length) {
    return payload.destinations.map((item) => String(item)).join(', ');
  }
  return stringValue(payload.destination, 'Unspecified');
}

async function readCollection<T>(fileName: string): Promise<T[]> {
  try {
    const raw = await readFile(path.join(dataDir, fileName), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeCollection<T>(fileName: string, records: T[]) {
  await mkdir(dataDir, { recursive: true });
  const target = path.join(dataDir, fileName);
  const temp = `${target}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  await rename(temp, target);
}

export async function storeLocalLead(payload: unknown) {
  const now = new Date().toISOString();
  const contact = payloadContact(payload);
  const record: LeadRecord = {
    id: `lead_${now.slice(0, 10).replace(/-/g, '')}_${randomUUID().slice(0, 8)}`,
    status: 'WARM',
    destination: leadDestination(payload),
    budget: isRecord(payload) ? stringValue(payload.budget, 'Unspecified') : 'Unspecified',
    email: stringValue(contact.email, 'unknown@example.local'),
    payload,
    createdAt: now,
    updatedAt: now
  };
  const records = await readCollection<LeadRecord>('leads.json');
  records.unshift(record);
  await writeCollection('leads.json', records);
  return { id: record.id, status: record.status, source: 'local-file' };
}

export async function storeLocalBooking(payload: unknown) {
  const now = new Date().toISOString();
  const body = isRecord(payload) ? payload : {};
  const bookingId = stringValue(body.bookingId, `HLT-${now.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`);
  const record: BookingRecord = {
    id: `booking_${bookingId}`,
    bookingId,
    status: 'PENDING',
    method: stringValue(body.method, 'pending'),
    amount: numberValue(body.amount),
    currency: stringValue(body.currency, 'USD'),
    payload,
    createdAt: now,
    updatedAt: now
  };
  const records = await readCollection<BookingRecord>('bookings.json');
  records.unshift(record);
  await writeCollection('bookings.json', records);
  return { id: record.id, bookingId: record.bookingId, status: 'Pending', source: 'local-file' };
}
