import type { Permission, Role } from './role';

/** Pure "does this role have this permission" check. No I/O — same spirit as `derive.ts`. */
export function hasPermission(role: Pick<Role, 'permissions'>, permission: Permission): boolean {
  return role.permissions.includes(permission);
}

/** True only if the role has every listed permission. */
export function hasAllPermissions(
  role: Pick<Role, 'permissions'>,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/** True if the role has at least one of the listed permissions. */
export function hasAnyPermission(
  role: Pick<Role, 'permissions'>,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}
