import { AppError } from '../../../shared';

import { WorkspaceRole } from '@prisma/client';

import { WorkspaceFilterParams } from '../types';

import { CreateWorkspaceDto, UpdateWorkspaceDto, AddWorkspaceMemberDto } from '../dto';
import { WorkspaceRepository } from '../repository';
import { NotificationService } from '../../notifications';
import { eventsService } from '../../events';

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly notificationService: NotificationService
  ) {}

  async createWorkspace(data: CreateWorkspaceDto, ownerId: string) {
    const existingWorkspace = await this.workspaceRepository.getWorkspaceByName(data.name);

    if (existingWorkspace) {
      throw new AppError('Workspace name already exists', 409);
    }

    const workspace = await this.workspaceRepository.createWorkspace(data, ownerId);
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId: workspace.id,
      action: 'updated',
    });
    return workspace;
  }

  async getWorkspaces(userId: string, filters?: WorkspaceFilterParams) {
    const workspaceMembers = await this.workspaceRepository.getWorkspaces(userId, filters);

    return workspaceMembers.map((workspaceMember) => workspaceMember.workspace);
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceById(workspaceId, userId);

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    return workspaceMember.workspace;
  }

  async updateWorkspace(workspaceId: string, userId: string, data: UpdateWorkspaceDto) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    if (workspaceMember.role !== WorkspaceRole.OWNER) {
      throw new AppError('Forbidden', 403);
    }

    if (data.name) {
      const existingWorkspace = await this.workspaceRepository.getWorkspaceByName(data.name);

      if (existingWorkspace && existingWorkspace.id !== workspaceId) {
        throw new AppError('Workspace name already exists', 409);
      }
    }

    const updated = await this.workspaceRepository.updateWorkspace(workspaceId, data);
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'updated',
    });
    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    if (workspaceMember.role !== WorkspaceRole.OWNER) {
      throw new AppError('Forbidden', 403);
    }

    await this.workspaceRepository.deleteWorkspace(workspaceId);
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'deleted',
    });
  }

  async addWorkspaceMember(workspaceId: string, userId: string, data: AddWorkspaceMemberDto) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError('Forbidden', 403);
    }

    if (data.role === WorkspaceRole.OWNER) {
      throw new AppError('Owner role cannot be assigned', 400);
    }

    const memberUser = await this.workspaceRepository.getUserByEmail(data.email);

    if (!memberUser) {
      throw new AppError('User not found', 404);
    }

    const existingMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      memberUser.id
    );

    if (existingMember) {
      throw new AppError('User is already a workspace member', 409);
    }

    const workspaceMemberCreated = await this.workspaceRepository.addWorkspaceMember(
      workspaceId,
      memberUser.id,
      data.role
    );

    const workspace = await this.workspaceRepository.getWorkspaceEntityById(workspaceId);
    const workspaceName = workspace?.name ?? 'a workspace';

    await this.notificationService.createNotification(
      memberUser.id,
      'Added to workspace',
      `You have been added to workspace "${workspaceName}".<!--link:/workspaces/${workspaceId}/projects-->`
    );

    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'member_added',
      userId: memberUser.id,
    });

    return workspaceMemberCreated;
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    return this.workspaceRepository.getWorkspaceMembers(workspaceId);
  }

  async getWorkspaceMemberByUser(workspaceId: string, userId: string, statusCode: 403 | 404 = 404) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError(
        statusCode === 404 ? 'Workspace not found' : 'User is not a member of this workspace',
        statusCode
      );
    }

    return workspaceMember;
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    role: WorkspaceRole
  ) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    if (workspaceMember.role !== WorkspaceRole.OWNER) {
      throw new AppError('Forbidden', 403);
    }

    if (role === WorkspaceRole.OWNER) {
      throw new AppError('Owner role cannot be assigned', 400);
    }

    const member = await this.workspaceRepository.getWorkspaceMemberById(workspaceId, memberId);

    if (!member) {
      throw new AppError('Workspace member not found', 404);
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new AppError('Cannot update workspace owner', 403);
    }

    const result = await this.workspaceRepository.updateWorkspaceMemberRole(memberId, role);
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'role_updated',
    });
    return result;
  }

  async removeWorkspaceMember(workspaceId: string, memberId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      userId
    );

    if (!workspaceMember) {
      throw new AppError('Workspace not found', 404);
    }

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError('Forbidden', 403);
    }

    const member = await this.workspaceRepository.getWorkspaceMemberById(workspaceId, memberId);

    if (!member) {
      throw new AppError('Workspace member not found', 404);
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new AppError('Cannot remove workspace owner', 403);
    }

    if (workspaceMember.role === WorkspaceRole.ADMIN && member.role === WorkspaceRole.ADMIN) {
      throw new AppError('Admins cannot remove other admins', 403);
    }

    const result = await this.workspaceRepository.deleteWorkspaceMember(
      memberId,
      workspaceId,
      member.userId
    );
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'member_removed',
      userId: member.userId,
    });
    void this.workspaceRepository.getWorkspaceEntityById(workspaceId).then((ws) => {
      if (ws) {
        void this.notificationService.createNotification(
          member.userId,
          'Removed from workspace',
          `You have been removed from workspace "${ws.name}".`
        );
      }
    });
    return result;
  }

  async transferWorkspaceOwnership(workspaceId: string, currentUserId: string, newOwnerId: string) {
    const workspace = await this.workspaceRepository.getWorkspaceEntityById(workspaceId);

    if (!workspace) {
      throw new AppError('Workspace not found', 404);
    }

    if (workspace.ownerId !== currentUserId) {
      throw new AppError('Only the workspace owner can transfer ownership', 403);
    }

    if (newOwnerId === currentUserId) {
      throw new AppError('Cannot transfer ownership to yourself', 400);
    }

    const targetMember = await this.workspaceRepository.getWorkspaceMemberByUser(
      workspaceId,
      newOwnerId
    );

    if (!targetMember) {
      throw new AppError(
        'The target user must be a member of the workspace to receive ownership',
        400
      );
    }

    const result = await this.workspaceRepository.transferWorkspaceOwnership(
      workspaceId,
      currentUserId,
      newOwnerId
    );
    eventsService.broadcast({
      type: 'WORKSPACE_MUTATED',
      workspaceId,
      action: 'ownership_transferred',
    });
    return result;
  }
}
