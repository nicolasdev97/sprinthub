import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { workspaceService } from '../service';
import {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRoleRequest,
  UpdateWorkspaceRequest,
} from '../types';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
  });
};

export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
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
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
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
    },
  });
};
