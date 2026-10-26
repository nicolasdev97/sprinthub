import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crossTabSync } from '@/shared/utils';

import { workspaceService } from '../service';
import {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRoleRequest,
  UpdateWorkspaceRequest,
  WorkspaceQueryParams,
} from '../types';

export const useWorkspaces = (params?: WorkspaceQueryParams) => {
  return useQuery({
    queryKey: ['workspaces', params],
    queryFn: () => workspaceService.getWorkspaces(params),
  });
};

export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
};

export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: Boolean(workspaceId),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
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
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['projects'], ['tasks'], ['dashboard']],
      });
    },
  });
};

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddWorkspaceMemberRequest }) =>
      workspaceService.addMember(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['workspace-members']],
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
    onSuccess: (_, variables) => {
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

export const useTransferWorkspaceOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      newOwnerId,
    }: {
      workspaceId: string;
      newOwnerId: string;
    }) => workspaceService.transferOwnership(workspaceId, newOwnerId),
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
