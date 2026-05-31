#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function words(value) {
  const stripped = stripHtml(value);
  return stripped ? stripped.split(/\s+/).length : 0;
}

function hasSmokeMarker(value) {
  return /\b(smoke|demo|fake)\b|sandbox-theme|mirror qa|admin-smoke|phase-b-runtime|list-table-smoke|media-ui|media parity/i.test(String(value || ''));
}

function isLikely4k(url = '') {
  return /(?:w=|width=)(?:3840|4000|4096|5120)|(?:3840|4000|4096|5120)px|4k|uhd/i.test(url);
}

async function auditPosts() {
  const posts = await prisma.post.findMany({
    include: {
      featuredImage: { select: { url: true, width: true, height: true } },
      meta: { select: { key: true, value: true } }
    }
  });

  const issues = [];
  for (const post of posts) {
    const haystack = `${post.title} ${post.slug} ${post.excerpt} ${post.content}`;
    if (hasSmokeMarker(haystack)) {
      issues.push({ scope: 'posts.fake', slug: post.slug, title: post.title });
      continue;
    }
    if (!text(post.title) || !text(post.slug) || !text(post.content)) {
      issues.push({ scope: 'posts.content', slug: post.slug, title: post.title, reason: 'missing core text' });
    }
    if (!post.featuredImage && !isLikely4k(post.featuredImage?.url || '')) {
      issues.push({ scope: 'posts.image', slug: post.slug, title: post.title, reason: 'missing featured image' });
    }
    if (!post.meta.some((item) => item.key === '_mirror_source') && ['TOUR', 'CRUISE', 'PAGE'].includes(post.postType)) {
      issues.push({ scope: 'posts.source', slug: post.slug, title: post.title, reason: 'missing _mirror_source meta' });
    }
  }

  return { posts, issues };
}

async function auditMenus() {
  const menus = await prisma.menu.findMany({ include: { items: true } });
  const issues = [];
  for (const menu of menus) {
    const haystack = `${menu.name} ${menu.slug} ${menu.location} ${menu.items.map((item) => `${item.label} ${item.url}`).join(' ')}`;
    if (hasSmokeMarker(haystack)) {
      issues.push({ scope: 'menus.fake', slug: menu.slug, name: menu.name });
    }
    if (!menu.items.length) {
      issues.push({ scope: 'menus.empty', slug: menu.slug, name: menu.name });
    }
  }
  return { menus, issues };
}

async function auditSiteContent() {
  const option = await prisma.option.findUnique({ where: { key: 'admin_site_content' } });
  const content = option?.value || {};
  const labels = [
    content.identity?.titleLine1,
    content.identity?.titleLine2,
    content.identity?.tagline,
    content.home?.hero?.eyebrow,
    content.home?.hero?.title,
    content.home?.hero?.subtitle,
    content.footer?.contactHeading,
    content.footer?.openHours,
    content.footer?.phoneDisplay,
    content.footer?.email,
    content.footer?.address,
    ...(content.navigation?.tourChoices || []).map((item) => item.label),
    ...(content.navigation?.aboutChoices || []).map((item) => item.label),
    ...(content.footer?.columns || []).flatMap((column) => [column.title, ...((column.links || []).map((item) => item.label))]),
    ...(content.footer?.legalLinks || []).map((item) => item.label)
  ].filter(Boolean);
  const issues = labels.filter((label) => hasSmokeMarker(label)).map((label) => ({ scope: 'site-content.fake', label }));
  return { option, issues };
}

async function auditContentQuality() {
  const blogs = await prisma.post.findMany({
    where: { postType: 'POST' },
    select: { slug: true, title: true, excerpt: true, content: true, featuredImage: { select: { url: true } } }
  });
  const tours = await prisma.post.findMany({
    where: { postType: 'TOUR' },
    select: { slug: true, title: true, featuredImage: { select: { url: true, width: true, height: true } } }
  });

  const blogIssues = blogs.filter((post) => words(post.content) < 220 || stripHtml(post.excerpt).length < 80);
  const tourIssues = tours.filter((post) => {
    const img = post.featuredImage;
    return !img || (!isLikely4k(img.url) && !(img.width >= 3840 || img.height >= 2160));
  });

  return { blogs, tours, blogIssues, tourIssues };
}

async function main() {
  const [postAudit, menuAudit, siteAudit, qualityAudit] = await Promise.all([
    auditPosts(),
    auditMenus(),
    auditSiteContent(),
    auditContentQuality()
  ]);

  const issues = [...postAudit.issues, ...menuAudit.issues, ...siteAudit.issues];
  const report = {
    status: issues.length ? 'FAIL' : 'PASS',
    counts: {
      posts: postAudit.posts.length,
      blogs: qualityAudit.blogs.length,
      tours: qualityAudit.tours.length,
      blogIssues: qualityAudit.blogIssues.length,
      tourIssues: qualityAudit.tourIssues.length,
      menus: menuAudit.menus.length,
      menuItems: menuAudit.menus.reduce((sum, menu) => sum + menu.items.length, 0),
      siteContent: siteAudit.option ? 1 : 0
    },
    issueCounts: issues.reduce((acc, issue) => {
      acc[issue.scope] = (acc[issue.scope] || 0) + 1;
      return acc;
    }, {}),
    issues: issues.slice(0, 80),
    contentQuality: {
      blogIssues: qualityAudit.blogIssues.slice(0, 20).map((post) => ({
        slug: post.slug,
        title: post.title,
        words: words(post.content),
        excerptLength: stripHtml(post.excerpt).length
      })),
      tourIssues: qualityAudit.tourIssues.slice(0, 20).map((post) => ({
        slug: post.slug,
        title: post.title,
        image: post.featuredImage?.url || ''
      }))
    }
  };

  console.log(JSON.stringify(report, null, 2));
  if (issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
