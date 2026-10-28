import {
  createWorkspaceSchema,
  addWorkspaceMemberSchema,
  createDeleteWorkspaceConfirmSchema,
} from '../workspace.schema';

describe('Workspace Zod Schemas', () => {
  describe('createWorkspaceSchema', () => {
    it('should validate valid workspace name and description', () => {
      const valid = {
        name: 'SprintHub Core',
        description: 'Main product workspace',
      };
      const result = createWorkspaceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty workspace name', () => {
      const result = createWorkspaceSchema.safeParse({ name: '   ' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Workspace name is required');
      }
    });

    it('should reject workspace name exceeding 100 characters', () => {
      const result = createWorkspaceSchema.safeParse({
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Workspace name must not exceed 100 characters'
        );
      }
    });
  });

  describe('addWorkspaceMemberSchema', () => {
    it('should accept valid email and ADMIN role', () => {
      const result = addWorkspaceMemberSchema.safeParse({
        email: 'collaborator@team.org',
        role: 'ADMIN',
      });
      expect(result.success).toBe(true);
    });

    it('should reject OWNER as an assignable role for member addition', () => {
      const result = addWorkspaceMemberSchema.safeParse({
        email: 'target@team.org',
        role: 'OWNER',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createDeleteWorkspaceConfirmSchema', () => {
    it('should accept when typed name exactly matches required workspace name', () => {
      const schema = createDeleteWorkspaceConfirmSchema('CriticalWorkspace');
      const result = schema.safeParse({ confirmationName: 'CriticalWorkspace' });
      expect(result.success).toBe(true);
    });

    it('should reject when typed confirmation name differs', () => {
      const schema = createDeleteWorkspaceConfirmSchema('CriticalWorkspace');
      const result = schema.safeParse({ confirmationName: 'WrongWorkspace' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Please type "CriticalWorkspace" to confirm deletion'
        );
      }
    });
  });
});
