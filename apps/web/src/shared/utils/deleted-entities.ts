/**
 * Deleted Entities Registry
 *
 * Tracks IDs of resources (workspaces, projects, tasks) deleted or revoked during the session.
 * Prevents TanStack Query from ever refetching, revalidating, or retrying queries
 * for entities that have been removed, while supporting clean restoration when a member
 * is re-added to a workspace.
 */

class DeletedEntitiesRegistry {
  private deletedIds = new Set<string>();
  private childrenByParent = new Map<string, Set<string>>();

  public markDeleted(id: string, parentId?: string): void {
    if (!id) return;
    const key = String(id);
    this.deletedIds.add(key);

    if (parentId) {
      const parentKey = String(parentId);
      let children = this.childrenByParent.get(parentKey);
      if (!children) {
        children = new Set<string>();
        this.childrenByParent.set(parentKey, children);
      }
      children.add(key);
    }
  }

  public unmarkDeleted(id: string): string[] {
    if (!id) return [];
    const key = String(id);
    const restored: string[] = [];

    const unmarkRecursive = (currentKey: string) => {
      if (this.deletedIds.has(currentKey)) {
        this.deletedIds.delete(currentKey);
        restored.push(currentKey);
      }
      const children = this.childrenByParent.get(currentKey);
      if (children) {
        this.childrenByParent.delete(currentKey);
        children.forEach((childKey) => {
          unmarkRecursive(childKey);
        });
      }
    };

    unmarkRecursive(key);
    return restored;
  }

  public isDeleted(id: string | null | undefined): boolean {
    if (!id) return false;
    return this.deletedIds.has(String(id));
  }

  public isQueryKeyDeleted(queryKey: readonly unknown[]): boolean {
    return queryKey.some((part) => {
      if (typeof part === 'string' && this.deletedIds.has(part)) {
        return true;
      }
      return false;
    });
  }

  public clear(): void {
    this.deletedIds.clear();
    this.childrenByParent.clear();
  }
}

export const deletedEntities = new DeletedEntitiesRegistry();
