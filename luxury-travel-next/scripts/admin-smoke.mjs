import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const contributorEmail = process.env.ADMIN_SMOKE_CONTRIBUTOR_EMAIL || 'smoke-contributor@example.com';
const contributorPassword = process.env.ADMIN_SMOKE_CONTRIBUTOR_PASSWORD || 'change-me-before-production';
const prisma = new PrismaClient();

function cookieHeaderFrom(response) {
  const cookies = response.headers.getSetCookie?.() || [];
  return cookies.map((cookie) => cookie.split(';')[0]).filter(Boolean).join('; ');
}

async function assertStatus(path, expected) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  if (response.status !== expected) {
    throw new Error(`${path} expected ${expected}, got ${response.status}`);
  }
  console.log(`${path} -> ${response.status}`);
}

async function requestJson(path, options = {}, auth) {
  const headers = new Headers(options.headers || {});
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (auth?.cookieHeader) headers.set('cookie', auth.cookieHeader);
  if (auth?.csrfToken) headers.set('x-admin-csrf', auth.csrfToken);
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
    redirect: 'manual'
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

async function requestForm(path, form, auth) {
  const headers = new Headers();
  if (auth?.cookieHeader) headers.set('cookie', auth.cookieHeader);
  if (auth?.csrfToken) headers.set('x-admin-csrf', auth.csrfToken);
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: form,
    redirect: 'manual'
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

function assertApi(result, expectedStatus, label) {
  if (result.response.status !== expectedStatus) {
    throw new Error(`${label} expected ${expectedStatus}, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  }
  console.log(`${label} -> ${result.response.status}`);
}

async function assertAuditActionsSince(since, requiredActions, oneOfActionGroups = []) {
  const logs = await prisma.auditLog.findMany({
    where: { createdAt: { gte: since } },
    select: { action: true }
  });
  const actions = new Set(logs.map((log) => log.action));
  const missing = requiredActions.filter((action) => !actions.has(action));
  const missingGroups = oneOfActionGroups.filter((group) => !group.some((action) => actions.has(action)));
  if (missing.length || missingGroups.length) {
    throw new Error(`Missing audit log actions: ${[
      ...missing,
      ...missingGroups.map((group) => `one of [${group.join(', ')}]`)
    ].join(', ')}`);
  }
  console.log(`Audit log coverage -> ${requiredActions.length + oneOfActionGroups.length} checks`);
}

async function assertMetaRoundTrip(entityType, entityId, key, auth) {
  assertApi(await requestJson('/api/admin/meta', {
    method: 'PATCH',
    body: { entityType, entityId, key, value: { smoke: true, entityType } }
  }, auth), 200, `PATCH /api/admin/meta ${entityType}`);
  const meta = await requestJson(`/api/admin/meta?entityType=${entityType}&entityId=${entityId}`, {}, auth);
  assertApi(meta, 200, `GET /api/admin/meta ${entityType}`);
  const found = meta.payload?.data?.items?.some((item) => item.key === key && item.value?.entityType === entityType);
  if (!found) throw new Error(`Metadata round-trip failed for ${entityType}:${entityId}:${key}`);
  assertApi(await requestJson('/api/admin/meta', {
    method: 'DELETE',
    body: { entityType, entityId, key }
  }, auth), 200, `DELETE /api/admin/meta ${entityType}`);
}

async function login(login, password, label) {
  const result = await requestJson('/api/admin/auth/login', {
    method: 'POST',
    body: { login, password }
  });
  assertApi(result, 200, label);
  const cookieHeader = cookieHeaderFrom(result.response);
  const csrfToken = result.payload?.data?.csrfToken;
  if (!cookieHeader || !csrfToken) throw new Error(`${label} did not return cookies and CSRF token.`);
  return { cookieHeader, csrfToken, user: result.payload.data.user };
}

async function ensureContributor(adminAuth) {
  const users = await requestJson('/api/admin/users?perPage=100', {}, adminAuth);
  assertApi(users, 200, 'GET /api/admin/users as admin');
  const existing = users.payload?.data?.items?.find((user) => user.email === contributorEmail);
  if (existing) {
    const updated = await requestJson('/api/admin/users', {
      method: 'PATCH',
      body: {
        id: existing.id,
        email: contributorEmail,
        username: 'smoke-contributor',
        displayName: 'Smoke Contributor',
        password: contributorPassword,
        role: 'contributor',
        status: 'ACTIVE'
      }
    }, adminAuth);
    assertApi(updated, 200, 'PATCH /api/admin/users contributor');
    return updated.payload.data.item;
  }
  const created = await requestJson('/api/admin/users', {
    method: 'POST',
    body: {
      email: contributorEmail,
      username: 'smoke-contributor',
      displayName: 'Smoke Contributor',
      password: contributorPassword,
      role: 'contributor',
      status: 'ACTIVE'
    }
  }, adminAuth);
  assertApi(created, 201, 'POST /api/admin/users contributor');
  return created.payload.data.item;
}

async function authenticatedChecks() {
  const stamp = Date.now();
  const auditStartedAt = new Date(Date.now() - 1000);
  const adminAuth = await login(adminLogin, adminPassword, 'POST /api/admin/auth/login as admin');
  const designIndex = await requestJson('/api/admin/design', {}, adminAuth);
  assertApi(designIndex, 200, 'GET /api/admin/design active snapshot');
  const originalActiveDesignId = designIndex.payload?.data?.active?.id;
  const activeDesignTokens = designIndex.payload?.data?.active?.tokens;
  let smokeDesignId = null;

  assertApi(await requestJson('/api/admin/cruises', {}, adminAuth), 200, 'GET /api/admin/cruises as admin');
  assertApi(await requestJson('/api/admin/design', {}, adminAuth), 200, 'GET /api/admin/design as admin');
  assertApi(await requestJson('/api/admin/settings', {
    method: 'PUT',
    body: { key: 'admin_smoke_missing_csrf', value: { stamp } }
  }, { cookieHeader: adminAuth.cookieHeader }), 403, 'PUT /api/admin/settings missing CSRF');
  assertApi(await requestJson('/api/admin/design', {
    method: 'POST',
    body: { slug: `invalid-design-${stamp}` }
  }, adminAuth), 400, 'POST /api/admin/design invalid body');
  const design = await requestJson('/api/admin/design', {
    method: 'POST',
    body: {
      name: `Smoke Design ${stamp}`,
      slug: `smoke-design-${stamp}`,
      tokens: activeDesignTokens || {
        colors: {
          primary: '#0b1b2b',
          secondary: '#0b1b2b',
          accent: '#c8a96a',
          background: '#f8f5ef',
          foreground: '#0b1b2b',
          muted: '#6b7280',
          border: '#d8cbb2'
        },
        typography: {
          headingFont: '"Playfair Display", Georgia, serif',
          bodyFont: 'Manrope, Inter, sans-serif',
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
        }
      }
    }
  }, adminAuth);
  assertApi(design, 201, 'POST /api/admin/design');
  const designItem = design.payload.data.item;
  smokeDesignId = designItem.id;
  try {
    assertApi(await requestJson('/api/admin/design', {
      method: 'PATCH',
      body: { id: smokeDesignId, action: 'activate' }
    }, adminAuth), 200, 'PATCH /api/admin/design activate');
  await assertStatus('/', 200);

  assertApi(await requestJson('/api/admin/blocks?type=reusable', {}, adminAuth), 200, 'GET /api/admin/blocks reusable');
  assertApi(await requestJson('/api/admin/blocks', {
    method: 'POST',
    body: { kind: 'reusable', slug: `invalid-block-${stamp}` }
  }, adminAuth), 400, 'POST /api/admin/blocks invalid');
  const reusableBlock = await requestJson('/api/admin/blocks', {
    method: 'POST',
    body: {
      kind: 'reusable',
      name: `Smoke CTA ${stamp}`,
      slug: `smoke-cta-${stamp}`,
      blockType: 'cta',
      content: {
        id: `block-${stamp}`,
        type: 'cta',
        props: {
          eyebrow: 'Smoke CTA',
          title: 'Plan a private journey',
          href: '/customize-your-trip/',
          label: 'Start Planning'
        }
      }
    }
  }, adminAuth);
  assertApi(reusableBlock, 201, 'POST /api/admin/blocks reusable');
  const template = await requestJson('/api/admin/blocks', {
    method: 'POST',
    body: {
      kind: 'template',
      name: `Smoke Home Template ${stamp}`,
      slug: `smoke-home-template-${stamp}`,
      type: 'PAGE',
      blocks: [
        {
          id: `hero-${stamp}`,
          type: 'hero',
          props: {
            title: 'Smoke Hero',
            subtitle: 'Rendered from CMS blocks',
            image: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg'
          }
        },
        {
          id: `text-${stamp}`,
          type: 'text',
          props: { content: 'Smoke body block.' }
        }
      ]
    }
  }, adminAuth);
  assertApi(template, 201, 'POST /api/admin/blocks template');
  const templateItem = template.payload.data.item;
  const templateUpdated = await requestJson('/api/admin/blocks', {
    method: 'PATCH',
    body: {
      kind: 'template',
      id: templateItem.id,
      name: `Smoke Home Template ${stamp} Updated`,
      slug: `smoke-home-template-${stamp}`,
      type: 'PAGE',
      status: 'ACTIVE',
      blocks: [
        {
          id: `hero-${stamp}`,
          type: 'hero',
          props: {
            title: 'Smoke Hero Updated',
            subtitle: 'Rendered from CMS blocks',
            image: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg'
          }
        },
        {
          id: `text-${stamp}`,
          type: 'text',
          props: { content: 'Smoke body block updated.' }
        }
      ]
    }
  }, adminAuth);
  assertApi(templateUpdated, 200, 'PATCH /api/admin/blocks template update');
  const templateRevisions = await requestJson(`/api/admin/revisions?blockTemplateId=${templateItem.id}`, {}, adminAuth);
  assertApi(templateRevisions, 200, 'GET /api/admin/revisions block template');
  if (!Array.isArray(templateRevisions.payload?.data?.items) || !templateRevisions.payload.data.items.length) {
    throw new Error('Expected at least one block template revision.');
  }
  assertApi(await requestJson('/api/admin/revisions', {
    method: 'POST',
    body: { revisionId: templateRevisions.payload.data.items[0].id }
  }, adminAuth), 200, 'POST /api/admin/revisions restore block template');

  assertApi(await requestJson('/api/admin/posts', {
    method: 'POST',
    body: { slug: `invalid-${stamp}` }
  }, adminAuth), 400, 'POST /api/admin/posts invalid body');
  assertApi(await requestJson('/api/admin/cruises', {
    method: 'POST',
    body: { slug: `invalid-cruise-${stamp}` }
  }, adminAuth), 400, 'POST /api/admin/cruises invalid body');

  const mediaForm = new FormData();
  mediaForm.append('file', new Blob(['admin smoke upload'], { type: 'text/plain' }), `admin-smoke-${stamp}.txt`);
  mediaForm.append('altText', 'Admin smoke upload');
  const media = await requestForm('/api/admin/media', mediaForm, adminAuth);
  assertApi(media, 201, 'POST /api/admin/media upload');
  const mediaItem = media.payload.data.item;

  const category = await requestJson('/api/admin/taxonomy', {
    method: 'POST',
    body: { kind: 'categories', name: `Smoke Category ${stamp}`, slug: `smoke-category-${stamp}` }
  }, adminAuth);
  assertApi(category, 201, 'POST /api/admin/taxonomy category');

  const tag = await requestJson('/api/admin/taxonomy', {
    method: 'POST',
    body: { kind: 'tags', name: `Smoke Tag ${stamp}`, slug: `smoke-tag-${stamp}` }
  }, adminAuth);
  assertApi(tag, 201, 'POST /api/admin/taxonomy tag');

  const page = await requestJson('/api/admin/pages', {
    method: 'POST',
    body: {
      title: `Smoke Page ${stamp}`,
      slug: `smoke-page-${stamp}`,
      content: 'Smoke page content.',
      status: 'DRAFT',
      menuOrder: 10
    }
  }, adminAuth);
  assertApi(page, 201, 'POST /api/admin/pages');
  const pageItem = page.payload.data.item;

  const post = await requestJson('/api/admin/posts', {
    method: 'POST',
    body: {
      title: `Smoke Post ${stamp}`,
      slug: `phase-b-runtime-${stamp}`,
      excerpt: 'Smoke post excerpt.',
      content: 'Smoke post content.',
      status: 'DRAFT',
      categoryIds: [category.payload.data.item.id],
      tagIds: [tag.payload.data.item.id],
      featuredImageId: mediaItem.id,
      mediaIds: [mediaItem.id]
    }
  }, adminAuth);
  assertApi(post, 201, 'POST /api/admin/posts');
  const postItem = post.payload.data.item;

  assertApi(await requestJson('/api/admin/media', {
    method: 'PATCH',
    body: { id: mediaItem.id, action: 'attach', postId: postItem.id, role: 'smoke-gallery', sortOrder: 0 }
  }, adminAuth), 200, 'PATCH /api/admin/media attach');
  assertApi(await requestJson('/api/admin/media', {
    method: 'PATCH',
    body: { id: mediaItem.id, action: 'detach', postId: postItem.id, role: 'smoke-gallery' }
  }, adminAuth), 200, 'PATCH /api/admin/media detach');
  await assertMetaRoundTrip('media', mediaItem.id, `_smoke_media_${stamp}`, adminAuth);
  await assertMetaRoundTrip('category', category.payload.data.item.id, `_smoke_category_${stamp}`, adminAuth);
  await assertMetaRoundTrip('tag', tag.payload.data.item.id, `_smoke_tag_${stamp}`, adminAuth);

  const cruise = await requestJson('/api/admin/cruises', {
    method: 'POST',
    body: {
      title: `Smoke Cruise ${stamp}`,
      slug: `smoke-cruise-${stamp}`,
      excerpt: 'Smoke cruise excerpt.',
      content: 'Smoke cruise content.',
      status: 'DRAFT'
    }
  }, adminAuth);
  assertApi(cruise, 201, 'POST /api/admin/cruises');
  const cruiseItem = cruise.payload.data.item;

  const tour = await requestJson('/api/admin/tours', {
    method: 'POST',
    body: {
      title: `Smoke Tour ${stamp}`,
      slug: `smoke-tour-${stamp}`,
      excerpt: 'Smoke tour excerpt.',
      content: 'Smoke tour content.',
      status: 'DRAFT',
      tourMeta: {
        basePrice: 1250,
        currency: 'USD',
        duration: '3 days',
        availability: 'available',
        gallery: [],
        itinerary: [{ day: 1, title: 'Arrival' }]
      }
    }
  }, adminAuth);
  assertApi(tour, 201, 'POST /api/admin/tours');
  const tourItem = tour.payload.data.item;

  const product = await requestJson('/api/admin/products', {
    method: 'POST',
    body: {
      title: `Smoke Product ${stamp}`,
      slug: `smoke-product-${stamp}`,
      excerpt: 'Smoke product excerpt.',
      content: 'Smoke product content.',
      status: 'DRAFT'
    }
  }, adminAuth);
  assertApi(product, 201, 'POST /api/admin/products');
  const productItem = product.payload.data.item;

  const updatedPost = await requestJson('/api/admin/posts', {
    method: 'PATCH',
    body: {
      id: postItem.id,
      title: `Smoke Post Updated ${stamp}`,
      slug: postItem.slug,
      excerpt: 'Smoke post excerpt updated.',
      content: 'Smoke post content updated.',
      status: 'PUBLISHED',
      categoryIds: [category.payload.data.item.id],
      tagIds: [tag.payload.data.item.id],
      featuredImageId: mediaItem.id,
      mediaIds: [mediaItem.id]
    }
  }, adminAuth);
  assertApi(updatedPost, 200, 'PATCH /api/admin/posts');
  assertApi(await requestJson('/api/admin/meta', {
    method: 'PATCH',
    body: {
      entityType: 'post',
      entityId: postItem.id,
      key: '_cms_blocks',
      value: template.payload.data.item.blocks
    }
  }, adminAuth), 200, 'PATCH /api/admin/meta post blocks');
  assertApi(await requestJson(`/api/admin/meta?entityType=post&entityId=${postItem.id}`, {}, adminAuth), 200, 'GET /api/admin/meta post');

  const publicPost = await fetch(`${baseUrl}/blog/${postItem.slug}`, { redirect: 'manual' });
  const publicPostText = await publicPost.text();
  if (publicPost.status !== 200 || !publicPostText.includes('Smoke Hero')) {
    throw new Error(`Public CMS runtime did not render block content for ${postItem.slug}.`);
  }

  assertApi(await requestJson(`/api/admin/revisions?postId=${postItem.id}`, {}, adminAuth), 200, 'GET /api/admin/revisions');
  assertApi(await requestJson('/api/admin/autosaves', {
    method: 'POST',
    body: {
      postId: postItem.id,
      resource: 'posts',
      title: `Smoke Post Autosave ${stamp}`,
      content: 'Autosaved smoke content.'
    }
  }, adminAuth), 200, 'POST /api/admin/autosaves');
  assertApi(await requestJson(`/api/admin/autosaves?postId=${postItem.id}`, {}, adminAuth), 200, 'GET /api/admin/autosaves');
  assertApi(await requestJson('/api/admin/cruises', {
    method: 'DELETE',
    body: { id: cruiseItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/cruises trash');
  assertApi(await requestJson('/api/admin/tours', {
    method: 'DELETE',
    body: { id: tourItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/tours trash');
  assertApi(await requestJson('/api/admin/products', {
    method: 'DELETE',
    body: { id: productItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/products trash');

  const menu = await requestJson('/api/admin/menus', {
    method: 'POST',
    body: {
      name: `Smoke Menu ${stamp}`,
      slug: `smoke-menu-${stamp}`,
      location: `smoke-${stamp}`,
      items: [
        {
          label: pageItem.title,
          url: `/${pageItem.slug}`,
          linkedPostId: pageItem.id,
          children: [{ label: 'Child Link', url: '/child-link' }]
        }
      ]
    }
  }, adminAuth);
  assertApi(menu, 201, 'POST /api/admin/menus');
  const menuItem = menu.payload.data.item;

  assertApi(await requestJson('/api/admin/settings', {
    method: 'PUT',
    body: { key: 'admin_smoke_last_run', value: { stamp } }
  }, adminAuth), 200, 'PUT /api/admin/settings');

  assertApi(await requestJson('/api/admin/menus', {
    method: 'DELETE',
    body: { id: menuItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/menus');
  assertApi(await requestJson('/api/admin/posts', {
    method: 'DELETE',
    body: { id: postItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/posts trash');
  assertApi(await requestJson('/api/admin/pages', {
    method: 'DELETE',
    body: { id: pageItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/pages trash');

  // Media is still attached to the trashed post, so deletion must be protected first.
  assertApi(await requestJson('/api/admin/media', {
    method: 'DELETE',
    body: { id: mediaItem.id }
  }, adminAuth), 409, 'DELETE /api/admin/media attached protection');
  assertApi(await requestJson('/api/admin/posts', {
    method: 'PATCH',
    body: {
      id: postItem.id,
      title: updatedPost.payload.data.item.title,
      slug: updatedPost.payload.data.item.slug,
      excerpt: updatedPost.payload.data.item.excerpt,
      content: updatedPost.payload.data.item.content,
      status: 'TRASH',
      categoryIds: [],
      tagIds: [],
      featuredImageId: null,
      mediaIds: []
    }
  }, adminAuth), 200, 'PATCH /api/admin/posts detach media');
  assertApi(await requestJson('/api/admin/media', {
    method: 'DELETE',
    body: { id: mediaItem.id }
  }, adminAuth), 200, 'DELETE /api/admin/media');
  if (mediaItem.url?.startsWith('/uploads/admin/')) {
    await fs.rm(path.join(process.cwd(), 'public', mediaItem.url), { force: true }).catch(() => undefined);
  }

  assertApi(await requestJson('/api/admin/taxonomy', {
    method: 'DELETE',
    body: { id: tag.payload.data.item.id, kind: 'tags' }
  }, adminAuth), 200, 'DELETE /api/admin/taxonomy tag');
  assertApi(await requestJson('/api/admin/taxonomy', {
    method: 'DELETE',
    body: { id: category.payload.data.item.id, kind: 'categories' }
  }, adminAuth), 200, 'DELETE /api/admin/taxonomy category');

  const contributor = await ensureContributor(adminAuth);
  const contributorAuth = await login(contributorEmail, contributorPassword, 'POST /api/admin/auth/login as contributor');
  assertApi(await requestJson('/api/admin/users', {}, contributorAuth), 403, 'GET /api/admin/users as contributor');
  assertApi(await requestJson('/api/admin/settings', {
    method: 'PUT',
    body: { key: 'admin_smoke_forbidden', value: { stamp } }
  }, contributorAuth), 403, 'PUT /api/admin/settings as contributor');
  assertApi(await requestJson('/api/admin/design', {
    method: 'POST',
    body: { name: 'Forbidden Design', tokens: design.payload.data.item.tokens }
  }, contributorAuth), 403, 'POST /api/admin/design as contributor');
  assertApi(await requestJson('/api/admin/blocks', {
    method: 'POST',
    body: {
      kind: 'template',
      name: 'Forbidden Template',
      type: 'PAGE',
      blocks: [{ id: 'forbidden', type: 'text', props: { content: 'Forbidden' } }]
    }
  }, contributorAuth), 403, 'POST /api/admin/blocks template as contributor');
  assertApi(await requestJson('/api/admin/cruises', {
    method: 'POST',
    body: {
      title: 'Forbidden Cruise',
      slug: `forbidden-cruise-${stamp}`,
      excerpt: 'Forbidden',
      content: 'Forbidden'
    }
  }, contributorAuth), 403, 'POST /api/admin/cruises as contributor');

  await assertMetaRoundTrip('user', contributor.id, `_smoke_user_${stamp}`, adminAuth);

  await assertAuditActionsSince(auditStartedAt, [
    'admin_login',
    'design_preset_create',
    'design_preset_activate',
    'reusable_block_create',
    'template_block_create',
    'template_block_update',
    'revision_restore',
    'media_upload',
    'category_create',
    'tag_create',
    'page_create',
    'post_create',
    'media_attach',
    'media_detach',
    'cruise_create',
    'tour_create',
    'product_create',
    'post_update',
    'meta_set',
    'meta_delete',
    'autosave_save',
    'cruise_trash',
    'tour_trash',
    'product_trash',
    'menu_create',
    'option_update',
    'menu_delete',
    'post_trash',
    'page_trash',
    'media_delete',
    'tag_delete',
    'category_delete'
  ], [['user_create', 'user_update']]);
  } finally {
    if (originalActiveDesignId && smokeDesignId) {
      assertApi(await requestJson('/api/admin/design', {
        method: 'PATCH',
        body: { id: originalActiveDesignId, action: 'activate' }
      }, adminAuth), 200, 'PATCH /api/admin/design restore active');
    }
  }
  assertApi(await requestJson('/api/admin/auth/logout', { method: 'POST' }, adminAuth), 200, 'POST /api/admin/auth/logout');
  await assertAuditActionsSince(auditStartedAt, ['admin_logout']);
}

async function main() {
  await assertStatus('/admin', 307);
  await assertStatus('/admin/login', 200);
  await assertStatus('/api/admin/posts', 401);
  await assertStatus('/api/admin/tours', 401);
  await assertStatus('/api/admin/cruises', 401);
  await assertStatus('/api/admin/products', 401);
  await assertStatus('/api/admin/pages', 401);
  await assertStatus('/api/admin/media', 401);
  await assertStatus('/api/admin/settings', 401);
  await assertStatus('/api/admin/taxonomy', 401);
  await assertStatus('/api/admin/menus', 401);
  await assertStatus('/api/admin/users', 401);
  await assertStatus('/api/admin/revisions', 401);
  await assertStatus('/api/admin/autosaves', 401);
  await assertStatus('/api/admin/design', 401);
  await assertStatus('/api/admin/blocks', 401);
  await assertStatus('/api/admin/meta', 401);
  await authenticatedChecks();
  console.log('Admin smoke checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
