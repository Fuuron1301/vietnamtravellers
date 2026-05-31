export type AdminRole = 'administrator' | 'editor' | 'author' | 'contributor';

export type AdminCapability =
  | 'read_admin'
  | 'edit_posts'
  | 'publish_posts'
  | 'delete_posts'
  | 'edit_pages'
  | 'publish_pages'
  | 'delete_pages'
  | 'upload_files'
  | 'manage_media'
  | 'manage_options'
  | 'manage_navigation'
  | 'manage_homepage'
  | 'manage_footer'
  | 'view_tours'
  | 'manage_tours'
  | 'manage_taxonomy'
  | 'manage_users'
  | 'restore_revisions';

export const roleCapabilities: Record<AdminRole, AdminCapability[]> = {
  administrator: [
    'read_admin',
    'edit_posts',
    'publish_posts',
    'delete_posts',
    'edit_pages',
    'publish_pages',
    'delete_pages',
    'upload_files',
    'manage_media',
    'manage_options',
    'manage_navigation',
    'manage_homepage',
    'manage_footer',
    'view_tours',
    'manage_tours',
    'manage_taxonomy',
    'manage_users',
    'restore_revisions'
  ],
  editor: [
    'read_admin',
    'edit_posts',
    'publish_posts',
    'delete_posts',
    'edit_pages',
    'publish_pages',
    'delete_pages',
    'upload_files',
    'manage_media',
    'manage_navigation',
    'manage_homepage',
    'manage_footer',
    'view_tours',
    'manage_tours',
    'manage_taxonomy',
    'restore_revisions'
  ],
  author: ['read_admin', 'edit_posts', 'publish_posts', 'upload_files', 'view_tours'],
  contributor: ['read_admin', 'edit_posts', 'view_tours']
};

export const adminRoleLabels: Record<AdminRole, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  contributor: 'Contributor'
};

export function dbRoleKeyToAdminRole(key: string): AdminRole {
  const normalized = key.toLowerCase();
  if (normalized === 'administrator' || normalized === 'editor' || normalized === 'author' || normalized === 'contributor') return normalized;
  throw new Error(`Unsupported admin role key: ${key}`);
}

export function adminRoleToDbKey(role: AdminRole) {
  return role.toUpperCase();
}

export function roleCan(role: AdminRole, capability: AdminCapability) {
  return roleCapabilities[role].includes(capability);
}

export function capabilitiesForRole(role: AdminRole) {
  return roleCapabilities[role];
}

export function capabilityForWriteResource(resource: string): AdminCapability {
  if (resource === 'posts' || resource === 'post') return 'publish_posts';
  if (resource === 'pages' || resource === 'page' || resource === 'styles') return 'publish_pages';
  if (resource === 'media') return 'upload_files';
  if (resource === 'taxonomy' || resource === 'categories' || resource === 'tags') return 'manage_taxonomy';
  if (resource === 'menus' || resource === 'navigation') return 'manage_navigation';
  if (resource === 'settings' || resource === 'site-content') return 'manage_options';
  if (resource === 'users') return 'manage_users';
  if (resource === 'revisions') return 'restore_revisions';
  if (resource === 'autosaves') return 'edit_posts';
  if (resource === 'tours' || resource === 'tour' || resource === 'products' || resource === 'product' || resource === 'cruises' || resource === 'cruise') return 'manage_tours';
  return 'manage_options';
}
