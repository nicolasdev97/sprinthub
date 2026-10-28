import { createTaskSchema, updateTaskSchema, taskPriorityEnum, taskStatusEnum } from '../task.schema';

describe('Task Zod Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate complete valid task payload', () => {
      const valid = {
        title: 'Implement unit testing suite',
        description: 'Set up isolated mocks and tests for phase 4.1',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assigneeId: 'usr-1',
        dueDate: '2026-11-01T00:00:00.000Z',
      };
      const result = createTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing task title', () => {
      const invalid = {
        title: '   ',
        priority: 'MEDIUM',
        status: 'TODO',
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Task title is required');
      }
    });

    it('should reject invalid status or priority enums', () => {
      const invalid = {
        title: 'Fix issue',
        priority: 'URGENT_INVALID',
        status: 'COMPLETED_INVALID',
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept valid update without changing priority or status', () => {
      const valid = {
        title: 'Updated title',
        description: 'Updated description',
      };
      const result = updateTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject title exceeding 200 characters', () => {
      const invalid = {
        title: 'x'.repeat(201),
      };
      const result = updateTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

