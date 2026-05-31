#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const execute = process.argv.includes('--execute');
const realOnly = process.argv.includes('--real-only');
const previewLimit = Number(process.env.CLEANUP_PREVIEW_LIMIT || 20);

const fakeTextPattern = [
  'smoke',
  'cleanup',
  'list table smoke',
  'list-table-smoke',
  'phase-b-runtime',
  'autosave recovery',
  'revision restore',
  'media ui',
  'media-ui',
  'media parity',
  'media-parity',
  'admin-smoke',
  'sandbox-theme',
  'frontend sync',
  'menu sync',
  'nested sync',
  'forbidden',
  'parity design',
  'qa audit runtime',
  'qa_edit',
  'qa edit',
  'mirror qa'
];

const fakeTextRe = new RegExp(fakeTextPattern.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const seedPostSlugs = new Set([
  'about-private-travel-designers',
  'first-taste-of-vietnam-in-style'
]);

const seedCategorySlugs = new Set(['culture']);
const seedTagSlugs = new Set(['private-travel']);
const seedMenuSlugs = new Set(['main-menu']);
const seedOptionKeysToRefresh = new Set(['global_settings']);
const seedBlockTemplateSlugs = new Set(['homepage-hero-template']);
const seedReusableBlockSlugs = new Set(['tailor-made-cta']);
const seedDesignSlugs = new Set(['luxury-default']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to clean non-local DATABASE_URL host: ${url.hostname}`);
  return url;
}

function textIncludesFake(...values) {
  return values.some((value) => fakeTextRe.test(String(value || '')));
}

function jsonText(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value || '');
  }
}

function hasMetaKey(row, key) {
  return Array.isArray(row.meta) && row.meta.some((entry) => entry.key === key);
}

function hasRealMirrorPostMeta(row) {
  return hasMetaKey(row, '_mirror_source');
}

function hasRealMirrorMediaMeta(row) {
  return hasMetaKey(row, '_mirror_media_source');
}

function hasRealMirrorTaxonomyMeta(row) {
  return hasMetaKey(row, '_mirror_taxonomy_source');
}

function isCurrentWebsiteAssetUrl(value) {
  const text = String(value || '');
  return text.startsWith('/images/') || text.startsWith('/uploads/') || /^https?:\/\//i.test(text);
}

function summarize(row) {
  if (!row) return row;
  const summary = {};
  for (const key of ['id', 'postType', 'status', 'name', 'title', 'slug', 'email', 'username', 'displayName', 'key', 'url', 'fileName', 'originalName', 'location']) {
    if (row[key] !== undefined) summary[key] = row[key];
  }
  return summary;
}

function preview(label, rows) {
  console.log(`\n${label}: ${rows.length}`);
  for (const row of rows.slice(0, previewLimit)) {
    console.log(`  - ${JSON.stringify(summarize(row))}`);
  }
  if (rows.length > previewLimit) console.log(`  ... +${rows.length - previewLimit} more`);
}

function compactIds(rows) {
  return rows.map((row) => row.id);
}

function chunk(values, size = 500) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function deleteById(model, ids) {
  let count = 0;
  for (const idsChunk of chunk([...new Set(ids)].filter(Boolean))) {
    const result = await model.deleteMany({ where: { id: { in: idsChunk } } });
    count += result.count;
  }
  return count;
}

async function updateGlobalSettingsFromRealSiteContent(tx) {
  const globalSettings = await tx.option.findUnique({ where: { key: 'global_settings' } });
  if (!globalSettings || !globalSettings.value || typeof globalSettings.value !== 'object' || !('seededAt' in globalSettings.value)) {
    return { refreshed: false };
  }

  const siteContent = await tx.option.findUnique({ where: { key: 'admin_site_content' } });
  const value = siteContent?.value && typeof siteContent.value === 'object' ? siteContent.value : {};
  const identity = value.identity && typeof value.identity === 'object' ? value.identity : {};
  const footer = value.footer && typeof value.footer === 'object' ? value.footer : {};
  const home = value.home && typeof value.home === 'object' ? value.home : {};
  const hero = home.hero && typeof home.hero === 'object' ? home.hero : {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const realSettings = {
    siteName: identity.adminSiteName || [identity.titleLine1, identity.titleLine2].filter(Boolean).join(' ') || 'Ha Long Luxury',
    tagline: identity.tagline || 'Private Asia Journeys',
    wordpressUrl: `${siteUrl.replace(/\/$/, '')}/admin`,
    siteUrl,
    logoUrl: identity.markImage || '',
    seoTitle: hero.title || 'Private journeys, designed with quiet precision.',
    seoDescription: hero.subtitle || 'Vietnam, Laos, Cambodia, Thailand, Myanmar and Multi Country routes shaped around your pace.',
    email: footer.email || '',
    address: footer.address || '',
    phoneDisplay: footer.phoneDisplay || '',
    phoneHref: footer.phoneHref || '',
    source: 'current-public-output'
  };

  await tx.option.update({
    where: { key: 'global_settings' },
    data: { value: realSettings }
  });
  return { refreshed: true, value: realSettings };
}

async function markUnmarkedCurrentWebsiteMedia(tx) {
  const mediaRows = await tx.media.findMany({
    where: {
      meta: { none: { key: '_mirror_media_source' } }
    },
    select: {
      id: true,
      fileName: true,
      originalName: true,
      url: true,
      width: true,
      height: true,
      kind: true
    }
  });
  const realWebsiteMedia = mediaRows.filter((item) => isCurrentWebsiteAssetUrl(item.url) && !textIncludesFake(item.fileName, item.originalName, item.url));
  for (const item of realWebsiteMedia) {
    await tx.mediaMeta.upsert({
      where: { mediaId_key: { mediaId: item.id, key: '_mirror_media_source' } },
      update: {
        value: {
          originalSource: item.url,
          mirrorSource: 'current-public-output',
          sourceCollection: 'website-assets',
          fileName: item.fileName,
          originalName: item.originalName,
          kind: item.kind,
          dimensions: { width: item.width, height: item.height }
        }
      },
      create: {
        mediaId: item.id,
        key: '_mirror_media_source',
        value: {
          originalSource: item.url,
          mirrorSource: 'current-public-output',
          sourceCollection: 'website-assets',
          fileName: item.fileName,
          originalName: item.originalName,
          kind: item.kind,
          dimensions: { width: item.width, height: item.height }
        }
      }
    });
  }
  return { marked: realWebsiteMedia.length };
}

async function collectCandidates() {
  const posts = await prisma.post.findMany({
    include: {
      meta: true,
      categories: true,
      tags: true,
      media: true,
      featuredImage: true
    }
  });

  const users = await prisma.user.findMany({
    include: {
      posts: { select: { id: true } },
      mediaItems: { select: { id: true } },
      revisions: { select: { id: true } },
      autosaves: { select: { id: true } }
    }
  });

  const fakeUsers = users.filter((user) => textIncludesFake(user.email, user.username, user.displayName));
  const fakeUserIds = new Set(compactIds(fakeUsers));

  const fakePosts = posts.filter((post) => {
    if (hasRealMirrorPostMeta(post)) return false;
    if (seedPostSlugs.has(post.slug)) return true;
    if (fakeUserIds.has(post.authorId)) return true;
    return textIncludesFake(post.title, post.slug, post.excerpt, post.content, post.seoTitle, post.seoDescription);
  });
  const fakePostIds = new Set(compactIds(fakePosts));

  const categories = await prisma.category.findMany({
    include: {
      meta: true,
      posts: { include: { post: { select: { id: true, title: true, slug: true, meta: true } } } }
    }
  });
  const fakeCategories = categories.filter((category) => {
    if (hasRealMirrorTaxonomyMeta(category)) return false;
    const allLinksAreFake = category.posts.every((link) => fakePostIds.has(link.postId));
    if (!allLinksAreFake) return false;
    return textIncludesFake(category.name, category.slug, category.description) || seedCategorySlugs.has(category.slug);
  });

  const tags = await prisma.tag.findMany({
    include: {
      meta: true,
      posts: { include: { post: { select: { id: true, title: true, slug: true, meta: true } } } }
    }
  });
  const fakeTags = tags.filter((tag) => {
    if (hasRealMirrorTaxonomyMeta(tag)) return false;
    if (seedTagSlugs.has(tag.slug)) return true;
    const allLinksAreFake = tag.posts.every((link) => fakePostIds.has(link.postId));
    if (!allLinksAreFake) return false;
    return textIncludesFake(tag.name, tag.slug, tag.description);
  });

  const media = await prisma.media.findMany({
    include: {
      meta: true,
      postLinks: { include: { post: { select: { id: true } } } },
      featuredPosts: { select: { id: true } }
    }
  });
  const fakeMedia = media.filter((item) => {
    if (hasRealMirrorMediaMeta(item)) return false;
    const linkedPostIds = [
      ...item.postLinks.map((link) => link.postId),
      ...item.featuredPosts.map((post) => post.id)
    ];
    const hasOnlyFakeLinks = linkedPostIds.length === 0 || linkedPostIds.every((postId) => fakePostIds.has(postId));
    return hasOnlyFakeLinks && textIncludesFake(item.fileName, item.originalName, item.url, item.altText, item.caption, item.description);
  });

  const menus = await prisma.menu.findMany({ include: { items: true } });
  const fakeMenus = menus.filter((menu) => {
    const containsFakeItem = menu.items.some((item) => fakePostIds.has(item.linkedPostId || '') || textIncludesFake(item.label, item.url));
    if (textIncludesFake(menu.name, menu.slug, menu.location)) return true;
    return seedMenuSlugs.has(menu.slug) && containsFakeItem;
  });
  const fakeMenuIds = new Set(compactIds(fakeMenus));
  const fakeMenuItems = menus.flatMap((menu) => menu.items).filter((item) => {
    if (fakeMenuIds.has(item.menuId)) return true;
    return fakePostIds.has(item.linkedPostId || '') || textIncludesFake(item.label, item.url, item.target, item.cssClasses.join(' '));
  });

  const blockTemplates = await prisma.blockTemplate.findMany();
  const fakeBlockTemplates = blockTemplates.filter((template) => {
    const blockText = jsonText(template.blocks);
    if (textIncludesFake(template.name, template.slug, blockText)) return true;
    return seedBlockTemplateSlugs.has(template.slug) && /Luxury Travel CMS|WordPress-like foundation|Reusable blocks/i.test(blockText);
  });

  const reusableBlocks = await prisma.reusableBlock.findMany();
  const fakeReusableBlocks = reusableBlocks.filter((block) => {
    const contentText = jsonText(block.content);
    if (textIncludesFake(block.name, block.slug, block.blockType, contentText)) return true;
    return seedReusableBlockSlugs.has(block.slug) && /Create a journey that feels private|Travel Designers/i.test(contentText);
  });

  const designPresets = await prisma.designPreset.findMany();
  const hasCurrentLiveDesign = designPresets.some((preset) => preset.slug === 'current-live-design-mirror');
  const fakeDesignPresets = designPresets.filter((preset) => {
    if (preset.slug === 'current-live-design-mirror') return false;
    if (textIncludesFake(preset.name, preset.slug)) return true;
    return hasCurrentLiveDesign && seedDesignSlugs.has(preset.slug);
  });

  const options = await prisma.option.findMany();
  const fakeOptions = options.filter((option) => {
    if (seedOptionKeysToRefresh.has(option.key)) return false;
    return textIncludesFake(option.key, jsonText(option.value));
  });

  const fakeEntityIds = new Set([
    ...compactIds(fakePosts),
    ...compactIds(fakeMedia),
    ...compactIds(fakeCategories),
    ...compactIds(fakeTags),
    ...compactIds(fakeUsers),
    ...compactIds(fakeMenus),
    ...compactIds(fakeMenuItems),
    ...compactIds(fakeBlockTemplates),
    ...compactIds(fakeReusableBlocks),
    ...compactIds(fakeDesignPresets),
    ...compactIds(fakeOptions)
  ]);

  const revisions = await prisma.revision.findMany();
  const fakeRevisions = realOnly ? revisions : revisions.filter((revision) => {
    return fakeEntityIds.has(revision.id)
      || fakePostIds.has(revision.postId || '')
      || fakeMenuIds.has(revision.menuId || '')
      || fakeEntityIds.has(revision.optionId || '')
      || fakeEntityIds.has(revision.blockTemplateId || '')
      || fakeEntityIds.has(revision.reusableBlockId || '')
      || fakeUserIds.has(revision.authorId)
      || textIncludesFake(revision.title, jsonText(revision.snapshot));
  });
  for (const revision of fakeRevisions) fakeEntityIds.add(revision.id);

  const autosaves = await prisma.autosave.findMany();
  const fakeAutosaves = realOnly ? autosaves : autosaves.filter((autosave) => fakePostIds.has(autosave.postId) || fakeUserIds.has(autosave.authorId) || textIncludesFake(jsonText(autosave.snapshot)));
  for (const autosave of fakeAutosaves) fakeEntityIds.add(autosave.id);

  const auditLogs = await prisma.auditLog.findMany();
  const fakeAuditLogs = realOnly ? auditLogs : auditLogs.filter((log) => {
    const payloadText = `${jsonText(log.before)} ${jsonText(log.after)} ${jsonText(log.metadata)}`;
    return fakeEntityIds.has(log.entityId || '')
      || fakeUserIds.has(log.actorId || '')
      || textIncludesFake(log.action, log.entityType, payloadText);
  });

  const primaryMenusAfterCleanup = menus.filter((menu) => menu.location === 'primary' && !fakeMenuIds.has(menu.id));
  const currentHeaderMenu = menus.find((menu) => menu.slug === 'admin-current-header-menu');
  const promoteCurrentHeaderMenu = Boolean(currentHeaderMenu && currentHeaderMenu.location !== 'primary' && primaryMenusAfterCleanup.length === 0);
  const refreshGlobalSettings = options.some((option) => {
    return option.key === 'global_settings'
      && option.value
      && typeof option.value === 'object'
      && 'seededAt' in option.value;
  });

  return {
    fakePosts,
    fakeMedia,
    fakeCategories,
    fakeTags,
    fakeUsers,
    fakeMenus,
    fakeMenuItems,
    fakeBlockTemplates,
    fakeReusableBlocks,
    fakeDesignPresets,
    fakeOptions,
    fakeRevisions,
    fakeAutosaves,
    fakeAuditLogs,
    promoteCurrentHeaderMenu,
    refreshGlobalSettings
  };
}

async function collectCounts() {
  const postGroups = await prisma.post.groupBy({
    by: ['postType', 'status'],
    _count: { _all: true },
    orderBy: [{ postType: 'asc' }, { status: 'asc' }]
  });
  return {
    postGroups: postGroups.map((group) => `${group.postType}/${group.status}:${group._count._all}`),
    posts: await prisma.post.count(),
    mirroredPosts: await prisma.post.count({ where: { meta: { some: { key: '_mirror_source', value: { equals: 'current-public-output' } } } } }),
    media: await prisma.media.count(),
    mirroredMedia: await prisma.media.count({ where: { meta: { some: { key: '_mirror_media_source' } } } }),
    categories: await prisma.category.count(),
    mirroredCategories: await prisma.category.count({ where: { meta: { some: { key: '_mirror_taxonomy_source' } } } }),
    tags: await prisma.tag.count(),
    mirroredTags: await prisma.tag.count({ where: { meta: { some: { key: '_mirror_taxonomy_source' } } } }),
    users: await prisma.user.count(),
    blockTemplates: await prisma.blockTemplate.count(),
    reusableBlocks: await prisma.reusableBlock.count(),
    designPresets: await prisma.designPreset.count(),
    menus: await prisma.menu.count(),
    menuItems: await prisma.menuItem.count(),
    options: await prisma.option.count(),
    revisions: await prisma.revision.count(),
    autosaves: await prisma.autosave.count(),
    auditLogs: await prisma.auditLog.count()
  };
}

async function executeCleanup(candidates) {
  const deleted = {};
  const updated = {};
  const ids = Object.fromEntries(Object.entries(candidates)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, value]) => [key, compactIds(value)]));

  await prisma.$transaction(async (tx) => {
    if (candidates.refreshGlobalSettings) {
      updated.globalSettings = await updateGlobalSettingsFromRealSiteContent(tx);
    }
    updated.currentWebsiteMediaMarked = await markUnmarkedCurrentWebsiteMedia(tx);

    if (candidates.promoteCurrentHeaderMenu) {
      await tx.menu.update({
        where: { slug: 'admin-current-header-menu' },
        data: { location: 'primary' }
      });
      updated.currentHeaderMenuLocation = 'primary';
    }

    const currentLiveDesign = await tx.designPreset.findUnique({ where: { slug: 'current-live-design-mirror' } });
    if (currentLiveDesign && ids.fakeDesignPresets?.length) {
      await tx.designPreset.updateMany({
        where: { id: { not: currentLiveDesign.id }, status: 'ACTIVE' },
        data: { status: 'DRAFT' }
      });
      await tx.designPreset.update({
        where: { id: currentLiveDesign.id },
        data: { status: 'ACTIVE' }
      });
      updated.activeDesignPreset = currentLiveDesign.slug;
    }

    deleted.fakeAuditLogs = await deleteById(tx.auditLog, ids.fakeAuditLogs || []);
    deleted.fakeAutosaves = await deleteById(tx.autosave, ids.fakeAutosaves || []);
    deleted.fakeRevisions = await deleteById(tx.revision, ids.fakeRevisions || []);

    const fakeMenuItemIds = ids.fakeMenuItems || [];
    if (fakeMenuItemIds.length) {
      await tx.menuItem.updateMany({ where: { parentId: { in: fakeMenuItemIds } }, data: { parentId: null } });
      deleted.fakeMenuItems = await deleteById(tx.menuItem, fakeMenuItemIds);
    } else {
      deleted.fakeMenuItems = 0;
    }

    const fakeMenuIds = ids.fakeMenus || [];
    if (fakeMenuIds.length) {
      await tx.menuItem.updateMany({ where: { menuId: { in: fakeMenuIds } }, data: { parentId: null } });
      const menuItems = await tx.menuItem.deleteMany({ where: { menuId: { in: fakeMenuIds } } });
      deleted.fakeMenuCascadeItems = menuItems.count;
      deleted.fakeMenus = await deleteById(tx.menu, fakeMenuIds);
    } else {
      deleted.fakeMenuCascadeItems = 0;
      deleted.fakeMenus = 0;
    }

    await tx.post.updateMany({ where: { parentId: { in: ids.fakePosts || [] } }, data: { parentId: null } });
    deleted.fakePosts = await deleteById(tx.post, ids.fakePosts || []);

    deleted.fakeMedia = await deleteById(tx.media, ids.fakeMedia || []);
    deleted.fakeCategories = await deleteById(tx.category, ids.fakeCategories || []);
    deleted.fakeTags = await deleteById(tx.tag, ids.fakeTags || []);
    deleted.fakeBlockTemplates = await deleteById(tx.blockTemplate, ids.fakeBlockTemplates || []);
    deleted.fakeReusableBlocks = await deleteById(tx.reusableBlock, ids.fakeReusableBlocks || []);
    deleted.fakeDesignPresets = await deleteById(tx.designPreset, ids.fakeDesignPresets || []);
    deleted.fakeOptions = await deleteById(tx.option, ids.fakeOptions || []);

    deleted.smokePostMeta = (await tx.postMeta.deleteMany({ where: { key: { startsWith: '_smoke_' } } })).count;
    deleted.smokeMediaMeta = (await tx.mediaMeta.deleteMany({ where: { key: { startsWith: '_smoke_' } } })).count;
    deleted.smokeUserMeta = (await tx.userMeta.deleteMany({ where: { key: { startsWith: '_smoke_' } } })).count;
    deleted.smokeCategoryMeta = (await tx.categoryMeta.deleteMany({ where: { key: { startsWith: '_smoke_' } } })).count;
    deleted.smokeTagMeta = (await tx.tagMeta.deleteMany({ where: { key: { startsWith: '_smoke_' } } })).count;

    const fakeUserIds = ids.fakeUsers || [];
    const blockers = await tx.user.findMany({
      where: { id: { in: fakeUserIds } },
      select: {
        id: true,
        posts: { select: { id: true } },
        mediaItems: { select: { id: true } },
        revisions: { select: { id: true } },
        autosaves: { select: { id: true } },
        designPresetsCreated: { select: { id: true } },
        blockTemplatesCreated: { select: { id: true } },
        reusableBlocksCreated: { select: { id: true } }
      }
    });
    const deletableUserIds = blockers
      .filter((user) => [
        user.posts,
        user.mediaItems,
        user.revisions,
        user.autosaves,
        user.designPresetsCreated,
        user.blockTemplatesCreated,
        user.reusableBlocksCreated
      ].every((items) => items.length === 0))
      .map((user) => user.id);
    deleted.fakeUsers = await deleteById(tx.user, deletableUserIds);
    updated.skippedFakeUsersWithRelations = fakeUserIds.length - deletableUserIds.length;
  }, { timeout: 30000 });

  return { deleted, updated };
}

async function main() {
  const url = assertLocalDatabase();
  console.log(`[cleanup] DATABASE_URL host=${url.hostname} port=${url.port || ''} db=${url.pathname.slice(1)}`);
  console.log(`[cleanup] mode=${execute ? 'EXECUTE' : 'DRY-RUN'}${realOnly ? ' + REAL_ONLY' : ''}`);

  const before = await collectCounts();
  console.log('\nCounts before cleanup:');
  console.log(JSON.stringify(before, null, 2));

  const candidates = await collectCandidates();
  preview('Fake posts/pages/tours/cruises/products', candidates.fakePosts);
  preview('Fake media rows', candidates.fakeMedia);
  preview('Fake categories', candidates.fakeCategories);
  preview('Fake tags', candidates.fakeTags);
  preview('Fake users', candidates.fakeUsers);
  preview('Fake menus', candidates.fakeMenus);
  preview('Fake menu items', candidates.fakeMenuItems);
  preview('Fake block templates', candidates.fakeBlockTemplates);
  preview('Fake reusable blocks', candidates.fakeReusableBlocks);
  preview('Fake design presets', candidates.fakeDesignPresets);
  preview('Fake options', candidates.fakeOptions);
  preview(realOnly ? 'Non-source revisions to purge' : 'Fake revisions', candidates.fakeRevisions);
  preview(realOnly ? 'Non-source autosaves to purge' : 'Fake autosaves', candidates.fakeAutosaves);
  preview(realOnly ? 'Non-source audit logs to purge' : 'Fake audit logs', candidates.fakeAuditLogs);
  console.log(`\nPlanned updates: ${JSON.stringify({
    promoteCurrentHeaderMenu: candidates.promoteCurrentHeaderMenu,
    refreshGlobalSettings: candidates.refreshGlobalSettings
  }, null, 2)}`);

  if (!execute) {
    console.log('\nDry-run only. Re-run with --execute to delete these local DB rows. No files will be deleted.');
    return;
  }

  const result = await executeCleanup(candidates);
  const after = await collectCounts();
  console.log('\nCleanup result:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nCounts after cleanup:');
  console.log(JSON.stringify(after, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
