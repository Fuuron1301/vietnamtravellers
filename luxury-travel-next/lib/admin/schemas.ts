import { z } from 'zod';

export const cmsStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'PRIVATE', 'TRASH']).or(
  z.enum(['draft', 'published', 'scheduled', 'private', 'trash'])
);

export const cmsContentMutationSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1).max(220),
  slug: z.string().max(220).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().optional(),
  seoTitle: z.string().max(220).optional(),
  seoDescription: z.string().max(320).optional(),
  canonicalUrl: z.string().max(500).optional(),
  status: cmsStatusSchema.optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
  tagIds: z.array(z.string().min(1)).optional(),
  mediaIds: z.array(z.string().min(1)).optional(),
  featuredImageId: z.string().min(1).nullable().optional(),
  parentId: z.string().min(1).nullable().optional(),
  menuOrder: z.number().int().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  trashedAt: z.string().datetime().nullable().optional(),
  tourMeta: z.object({
    basePrice: z.union([z.string(), z.number(), z.null()]).optional(),
    currency: z.string().max(8).optional(),
    duration: z.string().max(120).optional(),
    availability: z.string().max(80).optional(),
    gallery: z.array(z.unknown()).optional(),
    itinerary: z.unknown().optional()
  }).optional(),
  meta: z.record(z.string().min(1), z.unknown()).optional()
}).passthrough();

export const cmsDeleteSchema = z.object({
  id: z.string().min(1)
});

const mediaMutationBase = z.object({
  url: z.string().min(1).optional(),
  src: z.string().min(1).optional(),
  title: z.string().max(220).optional(),
  mimeType: z.string().max(120).optional(),
  size: z.number().int().nonnegative().optional(),
  altText: z.string().max(220).optional(),
  caption: z.string().max(500).optional(),
  description: z.string().max(2000).optional()
});

const designStringMapSchema = z.record(z.string().min(1), z.string().min(1));

export const mediaUrlMutationSchema = mediaMutationBase.refine((value) => Boolean(value.url || value.src), {
  message: 'A media url or src is required.',
  path: ['url']
});

export const mediaUpdateSchema = mediaMutationBase.partial().extend({
  id: z.string().min(1),
  action: z.enum(['update', 'attach', 'detach']).optional(),
  postId: z.string().min(1).optional(),
  role: z.string().min(1).max(80).optional(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const settingMutationSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
  autoload: z.enum(['YES', 'NO']).optional()
});

export const revisionRestoreSchema = z.object({
  revisionId: z.string().min(1)
});

export const taxonomyMutationSchema = z.object({
  id: z.string().min(1).optional(),
  kind: z.enum(['category', 'categories', 'tag', 'tags', 'CATEGORY', 'CATEGORIES', 'TAG', 'TAGS']).optional(),
  name: z.string().min(1).max(220),
  slug: z.string().max(220).optional(),
  description: z.string().max(2000).optional(),
  parentId: z.string().min(1).nullable().optional()
}).passthrough();

export const userMutationSchema = z.object({
  id: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(1).max(120).optional(),
  displayName: z.string().min(1).max(220).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['administrator', 'editor', 'author', 'contributor', 'ADMINISTRATOR', 'EDITOR', 'AUTHOR', 'CONTRIBUTOR']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional()
}).passthrough();

export const userCreateSchema = userMutationSchema.extend({
  email: z.string().email(),
  password: z.string().min(6)
});

export const userUpdateSchema = userMutationSchema.extend({
  id: z.string().min(1)
});

export const autosaveMutationSchema = cmsContentMutationSchema.extend({
  postId: z.string().min(1).optional(),
  resource: z.enum(['posts', 'pages', 'tours', 'products']).optional()
}).refine((value) => Boolean(value.postId || value.id), {
  message: 'postId is required.',
  path: ['postId']
});

export const autosaveDeleteSchema = z.object({
  postId: z.string().min(1).optional(),
  id: z.string().min(1).optional()
}).refine((value) => Boolean(value.postId || value.id), {
  message: 'postId is required.',
  path: ['postId']
});

export const menuItemMutationSchema: z.ZodType<{
  label?: string;
  url?: string;
  target?: string;
  cssClasses?: string[];
  linkedPostId?: string | null;
  children?: unknown[];
}> = z.lazy(() => z.object({
  label: z.string().max(160).optional(),
  url: z.string().max(500).optional(),
  target: z.string().max(40).optional(),
  cssClasses: z.array(z.string().max(80)).optional(),
  linkedPostId: z.string().min(1).nullable().optional(),
  children: z.array(menuItemMutationSchema).optional()
}));

export const menuMutationSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
  location: z.string().max(120).optional(),
  items: z.array(menuItemMutationSchema).optional()
}).passthrough();

export const designTokenSchema = z.object({
  colors: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    accent: z.string().min(1),
    background: z.string().min(1),
    foreground: z.string().min(1),
    muted: z.string().min(1),
    border: z.string().min(1)
  }),
  typography: z.object({
    headingFont: z.string().min(1),
    bodyFont: z.string().min(1),
    baseSize: z.string().min(1),
    scaleRatio: z.string().min(1),
    lineHeight: z.string().min(1)
  }),
  spacing: z.object({
    xs: z.string().min(1),
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
    xl: z.string().min(1),
    sectionY: z.string().min(1)
  }),
  radius: z.object({
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
    pill: z.string().min(1)
  }),
  shadow: z.object({
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
    luxury: z.string().min(1)
  }),
  componentStyles: z.object({
    buttons: designStringMapSchema,
    cards: designStringMapSchema,
    forms: designStringMapSchema,
    tables: designStringMapSchema,
    navigation: designStringMapSchema,
    sections: designStringMapSchema
  }).optional(),
  responsive: z.object({
    desktop: designStringMapSchema,
    tablet: designStringMapSchema,
    mobile: designStringMapSchema
  }).optional()
});

export const designPresetCreateSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
  tokens: designTokenSchema,
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional()
});

export const designPresetUpdateSchema = designPresetCreateSchema.partial().extend({
  id: z.string().min(1),
  action: z.enum(['activate']).optional()
});

export const designPresetActivateSchema = z.object({
  id: z.string().min(1)
});

export const blockTypeSchema = z.enum(['hero', 'text', 'image', 'gallery', 'cta', 'tourGrid', 'blogGrid', 'customHtml', 'reusable', 'container']);

export const blockTreeSchema: z.ZodType<any> = z.lazy(() => z.object({
  id: z.string().min(1),
  type: blockTypeSchema,
  props: z.record(z.unknown()).optional(),
  children: z.array(blockTreeSchema).optional()
}));

export const reusableBlockSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
  blockType: z.string().min(1).max(80),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  content: z.union([blockTreeSchema, z.array(blockTreeSchema)])
});

export const blockTemplateSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
  type: z.enum(['PAGE', 'SECTION', 'HEADER', 'FOOTER', 'LOOP', 'SINGLE']),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  blocks: z.array(blockTreeSchema)
});

export const blockMutationSchema = z.object({
  kind: z.enum(['reusable', 'template']),
  reusable: reusableBlockSchema.optional(),
  template: blockTemplateSchema.optional()
});

export const metaMutationSchema = z.object({
  entityType: z.enum(['post', 'media', 'user', 'category', 'tag']),
  entityId: z.string().min(1),
  key: z.string().min(1).max(160),
  value: z.unknown().optional(),
  action: z.enum(['set', 'delete']).default('set')
});
