import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

const roleCapabilities = {
  ADMINISTRATOR: [
    'read_admin', 'edit_posts', 'publish_posts', 'delete_posts', 'edit_pages', 'publish_pages', 'delete_pages',
    'upload_files', 'manage_media', 'manage_options', 'manage_navigation', 'manage_homepage', 'manage_footer',
    'view_tours', 'manage_tours', 'manage_taxonomy', 'manage_users', 'restore_revisions'
  ],
  EDITOR: [
    'read_admin', 'edit_posts', 'publish_posts', 'delete_posts', 'edit_pages', 'publish_pages', 'delete_pages',
    'upload_files', 'manage_media', 'manage_navigation', 'manage_homepage', 'manage_footer', 'view_tours',
    'manage_tours', 'manage_taxonomy', 'restore_revisions'
  ],
  AUTHOR: ['read_admin', 'edit_posts', 'publish_posts', 'upload_files', 'view_tours'],
  CONTRIBUTOR: ['read_admin', 'edit_posts', 'view_tours']
};

function base64Url(buffer) {
  return buffer.toString('base64url');
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${base64Url(salt)}$${base64Url(derived)}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

async function ensureRoles() {
  const roles = {};
  for (const [key, capabilities] of Object.entries(roleCapabilities)) {
    roles[key] = await prisma.role.upsert({
      where: { key },
      update: { capabilities },
      create: { key, name: key.charAt(0) + key.slice(1).toLowerCase(), capabilities }
    });
  }
  return roles;
}

async function ensureAdminUser(role) {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const displayName = process.env.ADMIN_DISPLAY_NAME || 'Administrator';
  const password = process.env.ADMIN_PASSWORD || 'change-me-before-production';
  const passwordHash = await hashPassword(password);
  return prisma.user.upsert({
    where: { email },
    update: { username, displayName, passwordHash, roleId: role.id, status: 'ACTIVE' },
    create: { email, username, displayName, passwordHash, roleId: role.id }
  });
}

async function ensureTaxonomy() {
  const culture = await prisma.category.upsert({
    where: { slug: 'culture' },
    update: { name: 'Culture', description: 'Cultural travel stories and tours.' },
    create: { name: 'Culture', slug: 'culture', description: 'Cultural travel stories and tours.' }
  });
  const vietnam = await prisma.category.upsert({
    where: { slug: 'vietnam' },
    update: { name: 'Vietnam', description: 'Vietnam destination content.' },
    create: { name: 'Vietnam', slug: 'vietnam', description: 'Vietnam destination content.' }
  });
  const luxury = await prisma.tag.upsert({
    where: { slug: 'luxury' },
    update: { name: 'Luxury' },
    create: { name: 'Luxury', slug: 'luxury' }
  });
  const privateTravel = await prisma.tag.upsert({
    where: { slug: 'private-travel' },
    update: { name: 'Private Travel' },
    create: { name: 'Private Travel', slug: 'private-travel' }
  });
  return { culture, vietnam, luxury, privateTravel };
}

async function ensureMedia(authorId) {
  return prisma.media.upsert({
    where: { url: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg' },
    update: {
      altText: 'Ha Long Bay limestone karsts at golden hour',
      caption: 'Ha Long Bay, Vietnam'
    },
    create: {
      fileName: 'vietnam-ha-long-bay-4k-crisp.jpg',
      originalName: 'Vietnam Ha Long Bay 4K',
      mimeType: 'image/jpeg',
      kind: 'IMAGE',
      url: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg',
      size: 0,
      width: 3840,
      height: 2160,
      altText: 'Ha Long Bay limestone karsts at golden hour',
      caption: 'Ha Long Bay, Vietnam',
      authorId
    }
  });
}

async function ensurePost({ postType, title, slug, content, excerpt, authorId, featuredImageId, categoryIds, tagIds, tourMeta }) {
  const mirroredPost = await prisma.post.findUnique({
    where: { postType_slug: { postType, slug } },
    include: {
      meta: {
        where: { key: { in: ['_mirror_source', '_mirror_raw'] } },
        select: { key: true },
        take: 1
      }
    }
  });
  if (mirroredPost?.meta.length) {
    return mirroredPost;
  }

  const post = await prisma.post.upsert({
    where: { postType_slug: { postType, slug } },
    update: {
      status: 'PUBLISHED',
      title,
      excerpt,
      content,
      seoTitle: title,
      seoDescription: excerpt,
      featuredImageId,
      publishedAt: new Date()
    },
    create: {
      postType,
      status: 'PUBLISHED',
      title,
      slug,
      excerpt,
      content,
      seoTitle: title,
      seoDescription: excerpt,
      authorId,
      featuredImageId,
      publishedAt: new Date()
    }
  });

  await prisma.postCategory.deleteMany({ where: { postId: post.id } });
  if (categoryIds.length) {
    await prisma.postCategory.createMany({ data: categoryIds.map((categoryId) => ({ postId: post.id, categoryId })) });
  }
  await prisma.postTag.deleteMany({ where: { postId: post.id } });
  if (tagIds.length) {
    await prisma.postTag.createMany({ data: tagIds.map((tagId) => ({ postId: post.id, tagId })) });
  }
  if (featuredImageId) {
    await prisma.postMedia.upsert({
      where: { postId_mediaId_role: { postId: post.id, mediaId: featuredImageId, role: 'gallery' } },
      update: { sortOrder: 0 },
      create: { postId: post.id, mediaId: featuredImageId, role: 'gallery', sortOrder: 0 }
    });
  }
  if (tourMeta) {
    await prisma.tourMeta.upsert({
      where: { postId: post.id },
      update: tourMeta,
      create: { postId: post.id, ...tourMeta }
    });
  }
  return post;
}

async function ensureMenu(items) {
  const menu = await prisma.menu.upsert({
    where: { slug: 'main-menu' },
    update: { name: 'Main Menu', location: 'primary' },
    create: { name: 'Main Menu', slug: 'main-menu', location: 'primary' }
  });
  await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        label: item.label,
        url: item.url,
        linkedPostId: item.postId || null,
        sortOrder: index,
        cssClasses: []
      }
    });
  }
  return menu;
}

async function ensureDesignPreset(adminId) {
  await prisma.designPreset.updateMany({
    where: { status: 'ACTIVE', slug: { not: 'luxury-default' } },
    data: { status: 'DRAFT' }
  });
  return prisma.designPreset.upsert({
    where: { slug: 'luxury-default' },
    update: {
      name: 'Luxury Default',
      status: 'ACTIVE',
      tokens: {
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
      },
      updatedById: adminId
    },
    create: {
      name: 'Luxury Default',
      slug: 'luxury-default',
      status: 'ACTIVE',
      tokens: {
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
      },
      createdById: adminId,
      updatedById: adminId
    }
  });
}

async function ensureReusableBlock(adminId) {
  return prisma.reusableBlock.upsert({
    where: { slug: 'tailor-made-cta' },
    update: {
      name: 'Tailor-made CTA',
      blockType: 'cta',
      status: 'ACTIVE',
      content: [
        {
          id: 'tailor-made-cta',
          type: 'cta',
          props: {
            eyebrow: 'Travel Designers',
            title: 'Create a journey that feels private, polished, and effortless',
            href: '/customize-your-trip/',
            label: 'Talk to a designer'
          }
        }
      ],
      updatedById: adminId
    },
    create: {
      name: 'Tailor-made CTA',
      slug: 'tailor-made-cta',
      blockType: 'cta',
      status: 'ACTIVE',
      content: [
        {
          id: 'tailor-made-cta',
          type: 'cta',
          props: {
            eyebrow: 'Travel Designers',
            title: 'Create a journey that feels private, polished, and effortless',
            href: '/customize-your-trip/',
            label: 'Talk to a designer'
          }
        }
      ],
      createdById: adminId,
      updatedById: adminId
    }
  });
}

async function ensureBlockTemplate(adminId, reusableBlock) {
  await prisma.blockTemplate.updateMany({
    where: { status: 'ACTIVE', type: 'PAGE', slug: { not: 'homepage-hero-template' } },
    data: { status: 'DRAFT' }
  });
  return prisma.blockTemplate.upsert({
    where: { slug: 'homepage-hero-template' },
    update: {
      name: 'Homepage Hero Template',
      type: 'PAGE',
      status: 'ACTIVE',
      blocks: [
        {
          id: 'homepage-hero',
          type: 'hero',
          props: {
            eyebrow: 'Luxury Travel CMS',
            title: 'A polished WordPress-like foundation for premium travel content',
            subtitle: 'Reusable blocks, templates, design tokens, and audit-safe admin workflows.'
          }
        },
        {
          id: 'homepage-cta',
          type: 'reusable',
          props: {
            slug: reusableBlock.slug
          }
        }
      ],
      updatedById: adminId
    },
    create: {
      name: 'Homepage Hero Template',
      slug: 'homepage-hero-template',
      type: 'PAGE',
      status: 'ACTIVE',
      blocks: [
        {
          id: 'homepage-hero',
          type: 'hero',
          props: {
            eyebrow: 'Luxury Travel CMS',
            title: 'A polished WordPress-like foundation for premium travel content',
            subtitle: 'Reusable blocks, templates, design tokens, and audit-safe admin workflows.'
          }
        },
        {
          id: 'homepage-cta',
          type: 'reusable',
          props: {
            slug: reusableBlock.slug
          }
        }
      ],
      createdById: adminId,
      updatedById: adminId
    }
  });
}

async function main() {
  const roles = await ensureRoles();
  const admin = await ensureAdminUser(roles.ADMINISTRATOR);
  const taxonomy = await ensureTaxonomy();
  const media = await ensureMedia(admin.id);
  const designPreset = await ensureDesignPreset(admin.id);
  const reusableBlock = await ensureReusableBlock(admin.id);
  const blockTemplate = await ensureBlockTemplate(admin.id, reusableBlock);
  const page = await ensurePost({
    postType: 'PAGE',
    title: 'About Our Private Travel Designers',
    slug: 'about-private-travel-designers',
    excerpt: 'A CMS-seeded page for testing page hierarchy and menu routing.',
    content: 'This page is seeded by the local CMS setup and can be edited from wp-admin-like Pages.',
    authorId: admin.id,
    featuredImageId: media.id,
    categoryIds: [taxonomy.vietnam.id],
    tagIds: [taxonomy.luxury.id]
  });
  await ensurePost({
    postType: 'POST',
    title: 'A First Taste of Vietnam in Style',
    slug: 'first-taste-of-vietnam-in-style',
    excerpt: 'A seeded blog post used to verify posts, taxonomy, featured images, revisions, and frontend sync.',
    content: 'Plan a private Vietnam journey with expert local designers, curated hotels, and refined cultural access.',
    authorId: admin.id,
    featuredImageId: media.id,
    categoryIds: [taxonomy.culture.id, taxonomy.vietnam.id],
    tagIds: [taxonomy.luxury.id, taxonomy.privateTravel.id]
  });
  const tour = await ensurePost({
    postType: 'TOUR',
    title: 'Ky Son Biking, Cooking & Herbal Healing',
    slug: 'ky-son-biking-cooking-herbal-healing',
    excerpt: 'A seeded tour used to verify tour metadata, pricing, gallery, and itinerary editing.',
    content: 'A polished countryside escape with cycling, cooking, herbal traditions, and private-guided cultural moments.',
    authorId: admin.id,
    featuredImageId: media.id,
    categoryIds: [taxonomy.vietnam.id],
    tagIds: [taxonomy.privateTravel.id],
    tourMeta: {
      basePrice: '385',
      currency: 'USD',
      duration: 'Full day',
      availability: 'available',
      gallery: [{ mediaId: media.id, url: media.url }],
      itinerary: [{ time: '08:00', title: 'Private pickup from Hanoi' }]
    }
  });
  await ensureMenu([
    { label: 'Home', url: '/' },
    { label: 'Vietnam Tours', url: '/vietnam-tours' },
    { label: 'Travel Journal', url: '/travel-journal' },
    { label: 'About', url: `/${page.slug}`, postId: page.id },
    { label: 'Featured Tour', url: `/vietnam-tours/${tour.slug}`, postId: tour.id }
  ]);
  await prisma.option.upsert({
    where: { key: 'global_settings' },
    update: { value: { siteName: 'Luxury Travel', primaryColor: '#2271b1', seededAt: new Date().toISOString() } },
    create: { key: 'global_settings', value: { siteName: 'Luxury Travel', primaryColor: '#2271b1', seededAt: new Date().toISOString() } }
  });
  console.log(`CMS seed complete. Admin: ${admin.email}. Default password source: ${process.env.ADMIN_PASSWORD ? 'ADMIN_PASSWORD env' : 'change-me-before-production'}. Design preset: ${designPreset.slug}. Reusable block: ${reusableBlock.slug}. Template: ${blockTemplate.slug}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
