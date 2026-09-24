import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/domain';
import type { Permission, Role } from '@/domain';

const roleWith = (permissions: Permission[]): Pick<Role, 'permissions'> => ({ permissions });

describe('hasPermission', () => {
  it('is true when the permission is in the role', () => {
    expect(hasPermission(roleWith(['EMPLOYEE_VIEW_ALL']), 'EMPLOYEE_VIEW_ALL')).toBe(true);
  });

  it('is false when the permission is absent', () => {
    expect(hasPermission(roleWith(['EMPLOYEE_VIEW_ALL']), 'EMPLOYEE_CREATE')).toBe(false);
  });

  it('is false for an empty permission set', () => {
    expect(hasPermission(roleWith([]), 'DASHBOARD_VIEW_OWN')).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('is true only when every listed permission is present', () => {
    const role = roleWith(['LEAD_VIEW_TEAM', 'LEAD_ASSIGN']);
    expect(hasAllPermissions(role, ['LEAD_VIEW_TEAM'])).toBe(true);
    expect(hasAllPermissions(role, ['LEAD_VIEW_TEAM', 'LEAD_ASSIGN'])).toBe(true);
    expect(hasAllPermissions(role, ['LEAD_VIEW_TEAM', 'LEAD_EDIT'])).toBe(false);
  });

  it('is vacuously true for an empty list', () => {
    expect(hasAllPermissions(roleWith([]), [])).toBe(true);
  });
});

describe('hasAnyPermission', () => {
  it('is true when at least one listed permission is present', () => {
    const role = roleWith(['SITE_VISIT_TICKET_CREATE']);
    expect(hasAnyPermission(role, ['SITE_VISIT_TICKET_CREATE', 'SITE_VISIT_TICKET_CANCEL'])).toBe(
      true,
    );
  });

  it('is false when none are present', () => {
    const role = roleWith(['SITE_VISIT_TICKET_CREATE']);
    expect(hasAnyPermission(role, ['EMPLOYEE_CREATE', 'VEHICLE_MANAGE'])).toBe(false);
  });

  it('is false for an empty list', () => {
    expect(hasAnyPermission(roleWith(['EMPLOYEE_CREATE']), [])).toBe(false);
  });
});
