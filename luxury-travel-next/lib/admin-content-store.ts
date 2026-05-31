import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CmsItem } from '@/lib/types';

export type AdminCmsCollection = 'posts' | 'styles' | 'cruises';
export type AdminContentStore = Partial<Record<AdminCmsCollection, CmsItem[]>> & {
  media?: Array<Record<string, unknown>>;
  settings?: Record<string, unknown>;
  deleted?: Partial<Record<AdminCmsCollection, string[]>>;
  updatedAt?: string;
};

const dataDir = process.env.LOCAL_CAPTURE_DIR || path.join(process.cwd(), '.local-data');
const adminContentFile = path.join(dataDir, 'admin-content.json');

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

export function resourceToCollection(resource: string): AdminCmsCollection {
  if (resource === 'pages') return 'styles';
  if (resource === 'posts' || resource === 'styles' || resource === 'cruises') return resource;
  throw new Error(`Unsupported writable resource: ${resource}`);
}

export async function readAdminContentStore(): Promise<AdminContentStore> {
  try {
    const raw = await readFile(adminContentFile, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed as AdminContentStore : {};
  } catch {
    return {};
  }
}

export async function writeAdminContentStore(store: AdminContentStore) {
  await mkdir(dataDir, { recursive: true });
  const temp = `${adminContentFile}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify({ ...store, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
  await rename(temp, adminContentFile);
}
