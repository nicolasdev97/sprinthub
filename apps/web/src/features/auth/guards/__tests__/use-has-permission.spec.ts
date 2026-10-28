import { evaluateRolePermission, ROLE_HIERARCHY } from '../permissions';

describe('RBAC Permissions Evaluator', () => {
  describe('ROLE_HIERARCHY', () => {
    it('should maintain strict hierarchical rank OWNER > ADMIN > MEMBER', () => {
      expect(ROLE_HIERARCHY.OWNER).toBeGreaterThan(ROLE_HIERARCHY.ADMIN);
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.MEMBER);
    });
  });

  describe('evaluateRolePermission', () => {
    it('should return false if userRole is null or undefined', () => {
      expect(evaluateRolePermission(null, { permission: 'workspace:delete' })).toBe(false);
      expect(evaluateRolePermission(undefined, { allowedRoles: ['MEMBER'] })).toBe(false);
    });

    it('should allow OWNER to perform destructive workspace actions', () => {
      expect(evaluateRolePermission('OWNER', { permission: 'workspace:delete' })).toBe(true);
      expect(evaluateRolePermission('OWNER', { permission: 'workspace:transfer_ownership' })).toBe(
        true
      );
    });

    it('should forbid ADMIN or MEMBER from deleting workspaces or transferring ownership', () => {
      expect(evaluateRolePermission('ADMIN', { permission: 'workspace:delete' })).toBe(false);
      expect(evaluateRolePermission('ADMIN', { permission: 'workspace:transfer_ownership' })).toBe(
        false
      );
      expect(evaluateRolePermission('MEMBER', { permission: 'workspace:delete' })).toBe(false);
    });

    it('should allow ADMIN and OWNER to invite members, but forbid MEMBER', () => {
      expect(evaluateRolePermission('OWNER', { permission: 'member:invite' })).toBe(true);
      expect(evaluateRolePermission('ADMIN', { permission: 'member:invite' })).toBe(true);
      expect(evaluateRolePermission('MEMBER', { permission: 'member:invite' })).toBe(false);
    });

    it('should allow MEMBER to create and update tasks', () => {
      expect(evaluateRolePermission('MEMBER', { permission: 'task:create' })).toBe(true);
      expect(evaluateRolePermission('MEMBER', { permission: 'task:update' })).toBe(true);
    });

    it('should evaluate allowedRoles filter correctly', () => {
      expect(evaluateRolePermission('ADMIN', { allowedRoles: ['OWNER', 'ADMIN'] })).toBe(true);
      expect(evaluateRolePermission('MEMBER', { allowedRoles: ['OWNER', 'ADMIN'] })).toBe(false);
    });
  });
});
