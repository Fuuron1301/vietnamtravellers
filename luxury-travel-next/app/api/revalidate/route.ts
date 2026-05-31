import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const hubPaths = [
  '/vietnam-tours',
  '/laos-tours',
  '/cambodia-tours',
  '/thailand-tours',
  '/myanmar-tours',
  '/multi-country-tours'
];

type RevalidatePayload = {
  secret?: string;
  slug?: string;
  type?: string;
};

function normalizeSlugPath(slug: string): string | null {
  const trimmed = slug.trim().replace(/^\/+/, '');
  if (!trimmed || trimmed.includes('..') || trimmed.includes('://')) {
    return null;
  }

  return `/${trimmed}`;
}

export async function POST(request: NextRequest) {
  const payload = (await request
    .json()
    .catch(() => null)) as RevalidatePayload | null;

  if (!payload?.secret || payload.secret !== process.env.NEXT_REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/');
  revalidatePath('/sitemap.xml');

  if (payload.type === 'tour' && payload.slug) {
    const slugPath = normalizeSlugPath(payload.slug);
    if (slugPath) {
      revalidatePath(slugPath);
    }

    for (const path of hubPaths) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({
    revalidated: true,
    type: payload.type ?? 'unknown',
    slug: payload.slug ?? '',
  });
}
