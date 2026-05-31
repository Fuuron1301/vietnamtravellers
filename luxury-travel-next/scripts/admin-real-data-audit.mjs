#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
const requiredPostTypes = new Set(['POST', 'PAGE', 'TOUR', 'CRUISE']);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasMeta(rows, key) {
  return Array.isArray(rows) && rows.some((entry) => entry.key === key);
}

function jsonText(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value ?? '');
  }
}

function postLabel(post) {
  return `${post.postType}:${post.slug} (${post.title})`;
}

function addIssue(issues, scope, message, item) {
  issues.push({ scope, message, item });
}

async function auditPosts(issues) {
  const posts = await prisma.post.findMany({
    include: {
      featuredImage: true,
      meta: true,
      tourMeta: true,
      media: true
    }
  });

  for (const post of posts) {
    if (!requiredPostTypes.has(post.postType)) continue;
    const label = postLabel(post);
    const haystack = [post.title, post.slug, post.excerpt, post.content, post.seoTitle, post.seoDescription].join(' ');
    if (fakeTextRe.test(haystack)) addIssue(issues, 'posts.fake', 'Fake/smoke marker found', label);
    if (!hasMeta(post.meta, '_mirror_source')) addIssue(issues, 'posts.source', 'Missing _mirror_source meta', label);
    if (!text(post.title)) addIssue(issues, 'posts.title', 'Missing title', label);
    if (!text(post.slug)) addIssue(issues, 'posts.slug', 'Missing slug', label);
    if (!text(post.excerpt)) addIssue(issues, 'posts.excerpt', 'Missing excerpt', label);
    if (!text(post.content)) addIssue(issues, 'posts.content', 'Missing content', label);
    if (!text(post.seoTitle)) addIssue(issues, 'posts.seo', 'Missing SEO title', label);
    if (!text(post.seoDescription)) addIssue(issues, 'posts.seo', 'Missing SEO description', label);
    if (!post.featuredImageId && !text(post.featuredImage?.url)) addIssue(issues, 'posts.image', 'Missing featured image', label);

    if (post.postType === 'TOUR') {
      if (!post.tourMeta) {
        addIssue(issues, 'tours.meta', 'Missing TourMeta', label);
      } else {
        const gallery = Array.isArray(post.tourMeta.gallery) ? post.tourMeta.gallery : [];
        const itinerary = Array.isArray(post.tourMeta.itinerary) ? post.tourMeta.itinerary : [];
        if (!gallery.length) addIssue(issues, 'tours.gallery', 'Missing gallery', label);
        if (!itinerary.length) addIssue(issues, 'tours.itinerary', 'Missing itinerary', label);
      }
    }
  }

  return posts;
}

async function auditMedia(issues) {
  const media = await prisma.media.findMany({
    include: { meta: true, postLinks: true }
  });
  for (const item of media) {
    const label = `${item.url || item.fileName}`;
    if (fakeTextRe.test([item.fileName, item.originalName, item.url, item.altText, item.caption, item.description].join(' '))) {
      addIssue(issues, 'media.fake', 'Fake/smoke marker found', label);
    }
    if (!hasMeta(item.meta, '_mirror_media_source')) addIssue(issues, 'media.source', 'Missing _mirror_media_source meta', label);
    if (!text(item.url)) addIssue(issues, 'media.url', 'Missing media URL', label);
    if (item.kind === 'IMAGE' && !text(item.altText)) addIssue(issues, 'media.alt', 'Missing image alt text', label);
  }
  return media;
}

async function auditTaxonomy(issues) {
  const categories = await prisma.category.findMany({ include: { meta: true } });
  const tags = await prisma.tag.findMany({ include: { meta: true } });
  for (const category of categories) {
    if (fakeTextRe.test([category.name, category.slug, category.description].join(' '))) addIssue(issues, 'category.fake', 'Fake marker found', category.slug);
    if (!hasMeta(category.meta, '_mirror_taxonomy_source')) addIssue(issues, 'category.source', 'Missing source meta', category.slug);
  }
  for (const tag of tags) {
    if (fakeTextRe.test([tag.name, tag.slug, tag.description].join(' '))) addIssue(issues, 'tag.fake', 'Fake marker found', tag.slug);
    if (!hasMeta(tag.meta, '_mirror_taxonomy_source')) addIssue(issues, 'tag.source', 'Missing source meta', tag.slug);
  }
  return { categories, tags };
}

async function auditStructure(issues) {
  const [menus, options, designPresets, blockTemplates, reusableBlocks, users, revisions, autosaves, auditLogs] = await Promise.all([
    prisma.menu.findMany({ include: { items: true } }),
    prisma.option.findMany(),
    prisma.designPreset.findMany(),
    prisma.blockTemplate.findMany(),
    prisma.reusableBlock.findMany(),
    prisma.user.findMany(),
    prisma.revision.findMany(),
    prisma.autosave.findMany(),
    prisma.auditLog.findMany()
  ]);

  const headerMenu = menus.find((menu) => menu.slug === 'admin-current-header-menu');
  const primaryMenu = menus.find((menu) => menu.location === 'primary');
  const siteContent = options.find((option) => option.key === 'admin_site_content');
  const design = designPresets.find((preset) => preset.slug === 'current-live-design-mirror');

  if (!headerMenu) addIssue(issues, 'menu.header', 'Missing current header menu mirror', 'admin-current-header-menu');
  if (!primaryMenu && !headerMenu) addIssue(issues, 'menu.primary', 'Missing usable primary/header menu', 'primary');
  if (headerMenu && headerMenu.items.length < 5) addIssue(issues, 'menu.items', 'Header menu has too few items', `${headerMenu.items.length}`);
  if (!siteContent) addIssue(issues, 'options.siteContent', 'Missing admin_site_content option', 'admin_site_content');
  if (siteContent && (!siteContent.value?.navigation || !siteContent.value?.footer)) {
    addIssue(issues, 'options.siteContent', 'admin_site_content missing navigation/footer', 'admin_site_content');
  }
  if (!design) addIssue(issues, 'design.current', 'Missing current live design mirror', 'current-live-design-mirror');

  for (const menu of menus) {
    if (fakeTextRe.test([menu.name, menu.slug, menu.location, ...menu.items.map((item) => `${item.label} ${item.url}`)].join(' '))) {
      addIssue(issues, 'menu.fake', 'Fake/smoke marker found', menu.slug);
    }
  }
  for (const option of options) {
    if (fakeTextRe.test([option.key, jsonText(option.value)].join(' '))) addIssue(issues, 'option.fake', 'Fake/smoke marker found', option.key);
  }
  for (const preset of designPresets) {
    if (fakeTextRe.test([preset.name, preset.slug, jsonText(preset.tokens)].join(' '))) addIssue(issues, 'design.fake', 'Fake/smoke marker found', preset.slug);
  }
  for (const template of blockTemplates) {
    if (fakeTextRe.test([template.name, template.slug, jsonText(template.blocks)].join(' '))) addIssue(issues, 'blocks.fake', 'Fake/smoke marker found', template.slug);
  }
  for (const block of reusableBlocks) {
    if (fakeTextRe.test([block.name, block.slug, jsonText(block.blocks)].join(' '))) addIssue(issues, 'reusable.fake', 'Fake/smoke marker found', block.slug);
  }
  for (const user of users) {
    if (fakeTextRe.test([user.email, user.username, user.displayName].join(' '))) addIssue(issues, 'user.fake', 'Fake/smoke marker found', user.email);
  }
  for (const revision of revisions) {
    if (fakeTextRe.test([revision.title, jsonText(revision.snapshot)].join(' '))) addIssue(issues, 'revision.fake', 'Fake/smoke marker found', revision.title);
  }
  for (const autosave of autosaves) {
    if (fakeTextRe.test(jsonText(autosave.snapshot))) addIssue(issues, 'autosave.fake', 'Fake/smoke marker found', autosave.id);
  }
  for (const auditLog of auditLogs) {
    if (fakeTextRe.test([auditLog.action, auditLog.entityType, jsonText(auditLog.metadata)].join(' '))) addIssue(issues, 'audit.fake', 'Fake/smoke marker found', auditLog.id);
  }

  return { menus, options, designPresets, blockTemplates, reusableBlocks, users, revisions, autosaves, auditLogs };
}

async function main() {
  const issues = [];
  const [posts, media, taxonomy, structure] = await Promise.all([
    auditPosts(issues),
    auditMedia(issues),
    auditTaxonomy(issues),
    auditStructure(issues)
  ]);

  const postTypeCounts = posts.reduce((acc, post) => {
    const key = `${post.postType}/${post.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const issueCounts = issues.reduce((acc, issue) => {
    acc[issue.scope] = (acc[issue.scope] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    status: issues.length ? 'FAIL' : 'PASS',
    counts: {
      posts: posts.length,
      postTypes: postTypeCounts,
      media: media.length,
      categories: taxonomy.categories.length,
      tags: taxonomy.tags.length,
      menus: structure.menus.length,
      menuItems: structure.menus.reduce((sum, menu) => sum + menu.items.length, 0),
      options: structure.options.length,
      designPresets: structure.designPresets.length,
      blockTemplates: structure.blockTemplates.length,
      reusableBlocks: structure.reusableBlocks.length,
      users: structure.users.length,
      revisions: structure.revisions.length,
      autosaves: structure.autosaves.length,
      auditLogs: structure.auditLogs.length
    },
    issueCounts,
    issues: issues.slice(0, 80)
  }, null, 2));

  if (issues.length) process.exit(1);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
