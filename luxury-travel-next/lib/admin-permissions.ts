export {
  adminRoleLabels,
  capabilitiesForRole,
  capabilityForWriteResource,
  roleCan,
  roleCapabilities,
  type AdminCapability,
  type AdminRole
} from '@/lib/admin/rbac';

export function getAdminRoleFromRequest(): never {
  throw new Error('Header-based admin role resolution has been removed. Use session authentication via lib/admin/auth.');
}

export function assertCapability(): never {
  throw new Error('Legacy assertCapability has been removed. Use requireAdminCapability from lib/admin/auth.');
}
