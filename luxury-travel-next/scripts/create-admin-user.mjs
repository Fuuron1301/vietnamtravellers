import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const ROLE_CAPABILITIES = {
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

async function ensureRoles() {
  for (const [key, capabilities] of Object.entries(ROLE_CAPABILITIES)) {
    await prisma.role.upsert({
      where: { key },
      update: { capabilities },
      create: { key, name: key.charAt(0) + key.slice(1).toLowerCase(), capabilities }
    });
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const email = process.env.ADMIN_EMAIL || (await rl.question('Admin email: ')).trim().toLowerCase();
  const username = process.env.ADMIN_USERNAME || (await rl.question('Admin username: ')).trim();
  const displayName = process.env.ADMIN_DISPLAY_NAME || username || email;
  const password = process.env.ADMIN_PASSWORD || (await rl.question('Admin password: '));
  rl.close();

  if (!email || !username || !password) throw new Error('ADMIN_EMAIL, ADMIN_USERNAME and password are required.');
  await ensureRoles();
  const role = await prisma.role.findUniqueOrThrow({ where: { key: 'ADMINISTRATOR' } });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { username, displayName, passwordHash, roleId: role.id, status: 'ACTIVE' },
    create: { email, username, displayName, passwordHash, roleId: role.id }
  });
  console.log(`Admin user ready: ${user.email} (${user.username})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
