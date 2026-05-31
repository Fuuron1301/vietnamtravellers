import { DesignPresetStatus, Prisma } from '@prisma/client';
import type { AdminSessionContext } from '@/lib/admin/auth';
import { AdminApiError } from '@/lib/admin/api';
import { prisma } from '@/lib/prisma';

export type DesignTokens = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
    scaleRatio: string;
    lineHeight: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    sectionY: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    luxury: string;
  };
  componentStyles: {
    buttons: Record<string, string>;
    cards: Record<string, string>;
    forms: Record<string, string>;
    tables: Record<string, string>;
    navigation: Record<string, string>;
    sections: Record<string, string>;
  };
  responsive: {
    desktop: Record<string, string>;
    tablet: Record<string, string>;
    mobile: Record<string, string>;
  };
};

export const defaultDesignTokens: DesignTokens = {
  colors: {
    primary: '#0b1b2b',
    secondary: '#12323f',
    accent: '#c8a96a',
    background: '#f8f5ef',
    foreground: '#0b1b2b',
    muted: '#6d746f',
    border: '#ded3bc'
  },
  typography: {
    headingFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    bodyFont: 'Manrope, Inter, Aptos, sans-serif',
    baseSize: '16px',
    scaleRatio: '1.2',
    lineHeight: '1.65'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
    sectionY: '96px'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '22px',
    pill: '999px'
  },
  shadow: {
    sm: '0 2px 8px rgba(11,27,43,0.08)',
    md: '0 12px 28px rgba(11,27,43,0.12)',
    lg: '0 24px 60px rgba(11,27,43,0.16)',
    luxury: '0 30px 90px rgba(11,27,43,0.18)'
  },
  componentStyles: {
    buttons: { background: '#0b1b2b', color: '#fffaf0', radius: '999px', padding: '12px 20px', shadow: '0 12px 28px rgba(11,27,43,0.12)' },
    cards: { background: '#fffaf0', radius: '22px', padding: '24px', shadow: '0 24px 60px rgba(11,27,43,0.16)' },
    forms: { background: '#ffffff', radius: '18px', border: '1px solid #ded3bc' },
    tables: { headerBackground: '#f8f5ef', border: '1px solid #ded3bc' },
    navigation: { linkColor: '#0b1b2b', activeColor: '#c8a96a' },
    sections: { background: '#f8f5ef', paddingY: '96px' }
  },
  responsive: {
    desktop: { sectionY: '96px', container: '1180px' },
    tablet: { sectionY: '72px', container: '760px' },
    mobile: { sectionY: '48px', container: '360px' }
  }
};

type TokenGroup = Record<string, string>;

function stringToken(source: unknown, fallback: string) {
  return typeof source === 'string' && source.trim() ? source.trim() : fallback;
}

function group(source: unknown): TokenGroup {
  return typeof source === 'object' && source !== null && !Array.isArray(source) ? source as TokenGroup : {};
}

function stringGroup(source: unknown, fallback: Record<string, string>) {
  const values = group(source);
  return Object.fromEntries(Object.entries(fallback).map(([key, value]) => [key, stringToken(values[key], value)]));
}

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `design-${Date.now()}`;
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function normalizeDesignTokens(input: unknown): DesignTokens {
  const source = group(input);
  const colors = group(source.colors);
  const typography = group(source.typography);
  const spacing = group(source.spacing);
  const radius = group(source.radius);
  const shadow = group(source.shadow);
  const componentStyles = group(source.componentStyles);
  const responsive = group(source.responsive);
  return {
    colors: {
      primary: stringToken(colors.primary, defaultDesignTokens.colors.primary),
      secondary: stringToken(colors.secondary, defaultDesignTokens.colors.secondary),
      accent: stringToken(colors.accent, defaultDesignTokens.colors.accent),
      background: stringToken(colors.background, defaultDesignTokens.colors.background),
      foreground: stringToken(colors.foreground, defaultDesignTokens.colors.foreground),
      muted: stringToken(colors.muted, defaultDesignTokens.colors.muted),
      border: stringToken(colors.border, defaultDesignTokens.colors.border)
    },
    typography: {
      headingFont: stringToken(typography.headingFont, defaultDesignTokens.typography.headingFont),
      bodyFont: stringToken(typography.bodyFont, defaultDesignTokens.typography.bodyFont),
      baseSize: stringToken(typography.baseSize, defaultDesignTokens.typography.baseSize),
      scaleRatio: stringToken(typography.scaleRatio, defaultDesignTokens.typography.scaleRatio),
      lineHeight: stringToken(typography.lineHeight, defaultDesignTokens.typography.lineHeight)
    },
    spacing: {
      xs: stringToken(spacing.xs, defaultDesignTokens.spacing.xs),
      sm: stringToken(spacing.sm, defaultDesignTokens.spacing.sm),
      md: stringToken(spacing.md, defaultDesignTokens.spacing.md),
      lg: stringToken(spacing.lg, defaultDesignTokens.spacing.lg),
      xl: stringToken(spacing.xl, defaultDesignTokens.spacing.xl),
      sectionY: stringToken(spacing.sectionY, defaultDesignTokens.spacing.sectionY)
    },
    radius: {
      sm: stringToken(radius.sm, defaultDesignTokens.radius.sm),
      md: stringToken(radius.md, defaultDesignTokens.radius.md),
      lg: stringToken(radius.lg, defaultDesignTokens.radius.lg),
      pill: stringToken(radius.pill, defaultDesignTokens.radius.pill)
    },
    shadow: {
      sm: stringToken(shadow.sm, defaultDesignTokens.shadow.sm),
      md: stringToken(shadow.md, defaultDesignTokens.shadow.md),
      lg: stringToken(shadow.lg, defaultDesignTokens.shadow.lg),
      luxury: stringToken(shadow.luxury, defaultDesignTokens.shadow.luxury)
    },
    componentStyles: {
      buttons: stringGroup(componentStyles.buttons, defaultDesignTokens.componentStyles.buttons),
      cards: stringGroup(componentStyles.cards, defaultDesignTokens.componentStyles.cards),
      forms: stringGroup(componentStyles.forms, defaultDesignTokens.componentStyles.forms),
      tables: stringGroup(componentStyles.tables, defaultDesignTokens.componentStyles.tables),
      navigation: stringGroup(componentStyles.navigation, defaultDesignTokens.componentStyles.navigation),
      sections: stringGroup(componentStyles.sections, defaultDesignTokens.componentStyles.sections)
    },
    responsive: {
      desktop: stringGroup(responsive.desktop, defaultDesignTokens.responsive.desktop),
      tablet: stringGroup(responsive.tablet, defaultDesignTokens.responsive.tablet),
      mobile: stringGroup(responsive.mobile, defaultDesignTokens.responsive.mobile)
    }
  };
}

export async function getActiveDesignPreset() {
  return prisma.designPreset.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
    include: { createdBy: { select: { id: true, displayName: true, email: true } }, updatedBy: { select: { id: true, displayName: true, email: true } } }
  });
}

export async function listDesignPresets(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page') || '1'));
  const perPage = Math.min(100, Math.max(1, Number(params.get('perPage') || '20')));
  const search = params.get('search')?.trim() || '';
  const status = params.get('status')?.trim().toUpperCase();
  const where: Prisma.DesignPresetWhereInput = {
    ...(status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? { status: status as DesignPresetStatus } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] } : {})
  };
  const [active, total, items] = await prisma.$transaction([
    prisma.designPreset.findFirst({ where: { status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' } }),
    prisma.designPreset.count({ where }),
    prisma.designPreset.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * perPage, take: perPage })
  ]);
  return { active, items, pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) } };
}

export async function createDesignPreset(input: { name: string; slug?: string; tokens: unknown; status?: DesignPresetStatus }, actor: AdminSessionContext) {
  const item = await prisma.designPreset.create({
    data: {
      name: input.name,
      slug: slugify(input.slug || input.name),
      status: input.status || 'DRAFT',
      tokens: jsonValue(normalizeDesignTokens(input.tokens)),
      createdById: actor.user.id,
      updatedById: actor.user.id
    }
  });
  if (item.status === 'ACTIVE') await activateDesignPreset(item.id, actor);
  return prisma.designPreset.findUniqueOrThrow({ where: { id: item.id } });
}

export async function updateDesignPreset(input: { id: string; name?: string; slug?: string; tokens?: unknown; status?: DesignPresetStatus }, actor: AdminSessionContext) {
  const existing = await prisma.designPreset.findUnique({ where: { id: input.id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Design preset not found.', 404);
  return prisma.designPreset.update({
    where: { id: input.id },
    data: {
      name: input.name,
      slug: input.slug ? slugify(input.slug) : undefined,
      status: input.status,
      tokens: input.tokens === undefined ? undefined : jsonValue(normalizeDesignTokens(input.tokens)),
      updatedById: actor.user.id
    }
  });
}

export async function activateDesignPreset(id: string, actor: AdminSessionContext) {
  const existing = await prisma.designPreset.findUnique({ where: { id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Design preset not found.', 404);
  return prisma.$transaction(async (tx) => {
    await tx.designPreset.updateMany({ where: { status: 'ACTIVE', NOT: { id } }, data: { status: 'DRAFT' } });
    return tx.designPreset.update({ where: { id }, data: { status: 'ACTIVE', updatedById: actor.user.id } });
  });
}

export async function archiveDesignPreset(id: string, actor: AdminSessionContext) {
  const existing = await prisma.designPreset.findUnique({ where: { id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Design preset not found.', 404);
  return prisma.designPreset.update({ where: { id }, data: { status: 'ARCHIVED', updatedById: actor.user.id } });
}
