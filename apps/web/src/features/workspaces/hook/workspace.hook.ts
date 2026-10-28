import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Project } from '@/features/projects/types';
import { Task } from '@/features/tasks/types';
import { crossTabSync, deletedEntities } from '@/shared/utils';

import { workspaceService } from '../service';
import {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRoleRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceMember,
  WorkspaceQueryParams,
} from '../types';

export const useWorkspaces = (params?: WorkspaceQueryParams) => {
  return useQuery({
    queryKey: ['workspaces', params],
    queryFn: () => workspaceService.getWorkspaces(params),
  });
};

export const useWorkspace = (workspaceId: string, options?: { enabled?: boolean }) => {
  const isEnabled = Boolean(workspaceId) && !deletedEntities.isDeleted(workspaceId);
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
  });
};

export const useWorkspaceMembers = (workspaceId: string, options?: { enabled?: boolean }) => {
  const isEnabled = Boolean(workspaceId) && !deletedEntities.isDeleted(workspaceId);
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['dashboard']],
      });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceRequest }) =>
      workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (updatedWorkspace, variables) => {
      if (updatedWorkspace && updatedWorkspace.id) {
        queryClient.setQueryData(['workspaces', variables.workspaceId], updatedWorkspace);
        queryClient.setQueriesData<Workspace[]>({ queryKey: ['workspaces'] }, (old) =>
          Array.isArray(old)
            ? old.map((w) => (w.id === updatedWorkspace.id ? { ...w, ...updatedWorkspace } : w))
            : old
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.workspaceId],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['dashboard']],
      });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.deleteWorkspace(workspaceId),
    onMutate: async (workspaceId: string) => {
      // 1. Immediately register workspace (and its cached child projects & tasks) as permanently deleted
      deletedEntities.markDeleted(workspaceId);

      const cachedProjectQueries = queryClient.getQueriesData<Project[]>({
        queryKey: ['projects', workspaceId],
      });
      cachedProjectQueries.forEach(([, projectsList]) => {
        if (Array.isArray(projectsList)) {
          projectsList.forEach((p) => {
            if (p?.id) {
              deletedEntities.markDeleted(p.id, workspaceId);
              queryClient.setQueryDefaults(['projects', p.id], { enabled: false, retry: false });
              queryClient.setQueryDefaults(['tasks', p.id], { enabled: false, retry: false });
              queryClient.setQueryData(['projects', p.id], null);

              const cachedTaskQueries = queryClient.getQueriesData<Task[]>({
                queryKey: ['tasks', p.id],
              });
              cachedTaskQueries.forEach(([, tasksList]) => {
                if (Array.isArray(tasksList)) {
                  tasksList.forEach((t) => {
                    if (t?.id) {
                      deletedEntities.markDeleted(t.id, p.id);
                      queryClient.setQueryDefaults(['tasks', t.id], {
                        enabled: false,
                        retry: false,
                      });
                      queryClient.setQueryData(['tasks', t.id], null);
                    }
                  });
                }
              });
            }
          });
        }
      });

      // 2. Immediately silence and set null on queries for this workspace and child entities
      queryClient.setQueryDefaults(['workspaces', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['workspaces', workspaceId, 'members'], {
        enabled: false,
        retry: false,
      });
      queryClient.setQueryDefaults(['projects', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['dashboard', workspaceId], { enabled: false, retry: false });

      await queryClient.cancelQueries({ queryKey: ['workspaces', workspaceId] });
      await queryClient.cancelQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      await queryClient.cancelQueries({ queryKey: ['projects', workspaceId] });
      await queryClient.cancelQueries({ queryKey: ['tasks', workspaceId] });
      await queryClient.cancelQueries({ queryKey: ['dashboard', workspaceId] });

      queryClient.setQueryData(['workspaces', workspaceId], null);
      queryClient.setQueriesData({ queryKey: ['workspaces', workspaceId, 'members'] }, []);
      queryClient.setQueriesData({ queryKey: ['projects', workspaceId] }, []);
      queryClient.setQueriesData({ queryKey: ['tasks', workspaceId] }, []);
      queryClient.setQueryData(['dashboard', workspaceId], null);

      // 3. Optimistically remove from all workspace lists so <WorkspaceCard> unmounts right away
      queryClient.setQueriesData<Workspace[]>({ queryKey: ['workspaces'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((w) => w.id !== workspaceId);
      });
    },
    onSuccess: (_, workspaceId) => {
      deletedEntities.markDeleted(workspaceId);

      queryClient.setQueryDefaults(['workspaces', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['workspaces', workspaceId, 'members'], {
        enabled: false,
        retry: false,
      });
      queryClient.setQueryDefaults(['projects', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['dashboard', workspaceId], { enabled: false, retry: false });

      queryClient.setQueryData(['workspaces', workspaceId], null);
      queryClient.setQueriesData({ queryKey: ['workspaces', workspaceId, 'members'] }, []);
      queryClient.setQueriesData({ queryKey: ['projects', workspaceId] }, []);
      queryClient.setQueriesData({ queryKey: ['tasks', workspaceId] }, []);
      queryClient.setQueryData(['dashboard', workspaceId], null);

      queryClient.setQueriesData<Workspace[]>({ queryKey: ['workspaces'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((w) => w.id !== workspaceId);
      });

      crossTabSync.postMessage({
        type: 'ENTITY_DELETED',
        entity: 'workspace',
        id: workspaceId,
      });
    },
  });
};

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddWorkspaceMemberRequest }) =>
      workspaceService.addMember(workspaceId, data),
    onSuccess: (newMember, variables) => {
      if (newMember && newMember.id) {
        queryClient.setQueryData<WorkspaceMember[]>(
          ['workspaces', variables.workspaceId, 'members'],
          (old) => {
            if (!Array.isArray(old)) return [newMember];
            return old.some((m) => m.id === newMember.id) ? old : [...old, newMember];
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['workspace-members'], ['dashboard']],
      });
    },
  });
};

export const useUpdateWorkspaceMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      memberId,
      data,
    }: {
      workspaceId: string;
      memberId: string;
      data: UpdateWorkspaceMemberRoleRequest;
    }) => workspaceService.updateMemberRole(workspaceId, memberId, data),
    onSuccess: (updatedMember, variables) => {
      if (updatedMember && updatedMember.id) {
        queryClient.setQueryData<WorkspaceMember[]>(
          ['workspaces', variables.workspaceId, 'members'],
          (old) =>
            Array.isArray(old)
              ? old.map((m) => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
              : old
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['workspace-members']],
      });
    },
  });
};

export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) =>
      workspaceService.removeMember(workspaceId, memberId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<WorkspaceMember[]>(
        ['workspaces', variables.workspaceId, 'members'],
        (old) => (Array.isArray(old) ? old.filter((m) => m.id !== variables.memberId) : old)
      );

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.workspaceId],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['workspace-members'], ['dashboard']],
      });
    },
  });
};

export const useTransferWorkspaceOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, newOwnerId }: { workspaceId: string; newOwnerId: string }) =>
      workspaceService.transferOwnership(workspaceId, newOwnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['workspace-members']],
      });
    },
  });
};
