import { unstable_noStore as noStore } from 'next/cache';
import { defaultDesignTokens, normalizeDesignTokens, type DesignTokens } from '@/lib/admin/design-service';
import { prisma } from '@/lib/prisma';

export type DesignCssVariables = Record<string, string>;

function isTestDesignPresetName(name?: string, slug?: string) {
  const haystack = `${name || ''} ${slug || ''}`.toLowerCase();
  return haystack.includes('smoke') || haystack.includes('seed') || haystack.includes('test');
}

export async function getActiveDesignTokens(): Promise<DesignTokens> {
  noStore();
  if (!process.env.DATABASE_URL) return defaultDesignTokens;
  try {
    const preset = await prisma.designPreset.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { name: true, slug: true, tokens: true }
    });
    if (!preset || isTestDesignPresetName(preset.name, preset.slug)) return defaultDesignTokens;
    return normalizeDesignTokens(preset?.tokens || defaultDesignTokens);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn(`[design-runtime] active design read failed: ${error instanceof Error ? error.message : String(error)}`);
    return defaultDesignTokens;
  }
}

export function convertDesignTokensToCssVariables(tokens: DesignTokens): DesignCssVariables {
  return {
    '--cms-color-primary': tokens.colors.primary,
    '--cms-color-secondary': tokens.colors.secondary,
    '--cms-color-accent': tokens.colors.accent,
    '--cms-color-background': tokens.colors.background,
    '--cms-color-foreground': tokens.colors.foreground,
    '--cms-color-muted': tokens.colors.muted,
    '--cms-color-border': tokens.colors.border,
    '--cms-font-heading': tokens.typography.headingFont,
    '--cms-font-body': tokens.typography.bodyFont,
    '--cms-font-base-size': tokens.typography.baseSize,
    '--cms-type-scale-ratio': tokens.typography.scaleRatio,
    '--cms-line-height': tokens.typography.lineHeight,
    '--cms-space-xs': tokens.spacing.xs,
    '--cms-space-sm': tokens.spacing.sm,
    '--cms-space-md': tokens.spacing.md,
    '--cms-space-lg': tokens.spacing.lg,
    '--cms-space-xl': tokens.spacing.xl,
    '--cms-space-section-y': tokens.spacing.sectionY,
    '--cms-radius-sm': tokens.radius.sm,
    '--cms-radius-md': tokens.radius.md,
    '--cms-radius-lg': tokens.radius.lg,
    '--cms-radius-pill': tokens.radius.pill,
    '--cms-shadow-sm': tokens.shadow.sm,
    '--cms-shadow-md': tokens.shadow.md,
    '--cms-shadow-lg': tokens.shadow.lg,
    '--cms-shadow-luxury': tokens.shadow.luxury,
    '--cms-button-bg': tokens.componentStyles.buttons.background,
    '--cms-button-color': tokens.componentStyles.buttons.color,
    '--cms-button-radius': tokens.componentStyles.buttons.radius,
    '--cms-button-padding': tokens.componentStyles.buttons.padding,
    '--cms-button-shadow': tokens.componentStyles.buttons.shadow,
    '--cms-card-bg': tokens.componentStyles.cards.background,
    '--cms-card-radius': tokens.componentStyles.cards.radius,
    '--cms-card-padding': tokens.componentStyles.cards.padding,
    '--cms-card-shadow': tokens.componentStyles.cards.shadow,
    '--cms-form-bg': tokens.componentStyles.forms.background,
    '--cms-form-radius': tokens.componentStyles.forms.radius,
    '--cms-form-border': tokens.componentStyles.forms.border,
    '--cms-table-header-bg': tokens.componentStyles.tables.headerBackground,
    '--cms-table-border': tokens.componentStyles.tables.border,
    '--cms-nav-link-color': tokens.componentStyles.navigation.linkColor,
    '--cms-nav-active-color': tokens.componentStyles.navigation.activeColor,
    '--cms-section-bg': tokens.componentStyles.sections.background,
    '--cms-section-padding-y': tokens.componentStyles.sections.paddingY,
    '--cms-responsive-desktop-section-y': tokens.responsive.desktop.sectionY,
    '--cms-responsive-desktop-container': tokens.responsive.desktop.container,
    '--cms-responsive-tablet-section-y': tokens.responsive.tablet.sectionY,
    '--cms-responsive-tablet-container': tokens.responsive.tablet.container,
    '--cms-responsive-mobile-section-y': tokens.responsive.mobile.sectionY,
    '--cms-responsive-mobile-container': tokens.responsive.mobile.container
  };
}
