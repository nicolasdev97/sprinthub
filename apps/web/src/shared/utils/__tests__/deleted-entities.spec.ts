import { deletedEntities } from '../deleted-entities';

describe('deletedEntities registry', () => {
  beforeEach(() => {
    deletedEntities.clear();
  });

  it('should mark an entity as deleted and report it correctly', () => {
    expect(deletedEntities.isDeleted('entity-1')).toBe(false);

    deletedEntities.markDeleted('entity-1');
    expect(deletedEntities.isDeleted('entity-1')).toBe(true);
  });

  it('should check if a queryKey contains deleted entities', () => {
    deletedEntities.markDeleted('workspace-123');

    expect(deletedEntities.isQueryKeyDeleted(['workspaces', 'workspace-123', 'projects'])).toBe(
      true
    );
    expect(deletedEntities.isQueryKeyDeleted(['workspaces', 'workspace-active', 'projects'])).toBe(
      false
    );
  });

  it('should support parent-child cascade unmarking', () => {
    deletedEntities.markDeleted('task-child', 'workspace-parent');
    deletedEntities.markDeleted('workspace-parent');

    expect(deletedEntities.isDeleted('task-child')).toBe(true);
    expect(deletedEntities.isDeleted('workspace-parent')).toBe(true);

    const restored = deletedEntities.unmarkDeleted('workspace-parent');

    expect(restored).toContain('workspace-parent');
    expect(restored).toContain('task-child');
    expect(deletedEntities.isDeleted('workspace-parent')).toBe(false);
    expect(deletedEntities.isDeleted('task-child')).toBe(false);
  });

  it('should clear all tracked entities', () => {
    deletedEntities.markDeleted('e1');
    deletedEntities.markDeleted('e2');
    expect(deletedEntities.isDeleted('e1')).toBe(true);
    expect(deletedEntities.isDeleted('e2')).toBe(true);

    deletedEntities.clear();
    expect(deletedEntities.isDeleted('e1')).toBe(false);
    expect(deletedEntities.isDeleted('e2')).toBe(false);
  });
});
