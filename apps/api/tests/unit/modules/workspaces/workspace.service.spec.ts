import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceService } from '../../../../src/modules/workspaces/service/workspace.service';

import { eventsService } from '../../../../src/modules/events';

vi.mock('../../../../src/modules/events', () => ({
  eventsService: {
    broadcast: vi.fn(),
    emitToUser: vi.fn(),
  },
}));

describe('WorkspaceService', () => {
  let workspaceService: WorkspaceService;
  let mockWorkspaceRepository: any;
  let mockNotificationService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkspaceRepository = {
      getWorkspaceByName: vi.fn(),
      createWorkspace: vi.fn(),
      getWorkspaces: vi.fn(),
      getWorkspaceById: vi.fn(),
      getWorkspaceEntityById: vi.fn(),
      updateWorkspace: vi.fn(),
      deleteWorkspace: vi.fn(),
      getWorkspaceMemberByUser: vi.fn(),
      getWorkspaceMemberById: vi.fn(),
      getWorkspaceMembers: vi.fn(),
      updateWorkspaceMemberRole: vi.fn(),
      removeWorkspaceMember: vi.fn(),
      transferWorkspaceOwnership: vi.fn(),
    };

    mockNotificationService = {
      createNotification: vi.fn(),
    };

    workspaceService = new WorkspaceService(mockWorkspaceRepository, mockNotificationService);
  });

  describe('createWorkspace', () => {
    it('should throw 409 if workspace name already exists', async () => {
      mockWorkspaceRepository.getWorkspaceByName.mockResolvedValue({
        id: 'ws-1',
        name: 'Dev Team',
      });

      await expect(
        workspaceService.createWorkspace({ name: 'Dev Team' }, 'usr-1')
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Workspace name already exists',
      });
      expect(mockWorkspaceRepository.createWorkspace).not.toHaveBeenCalled();
    });

    it('should create workspace and broadcast event', async () => {
      mockWorkspaceRepository.getWorkspaceByName.mockResolvedValue(null);
      mockWorkspaceRepository.createWorkspace.mockResolvedValue({
        id: 'ws-new',
        name: 'Dev Team',
        ownerId: 'usr-1',
      });

      const result = await workspaceService.createWorkspace({ name: 'Dev Team' }, 'usr-1');

      expect(mockWorkspaceRepository.createWorkspace).toHaveBeenCalledWith(
        { name: 'Dev Team' },
        'usr-1'
      );
      expect(eventsService.broadcast).toHaveBeenCalledWith({
        type: 'WORKSPACE_MUTATED',
        workspaceId: 'ws-new',
        action: 'updated',
      });
      expect(result.id).toBe('ws-new');
    });
  });

  describe('transferWorkspaceOwnership', () => {
    it('should throw 404 if workspace does not exist', async () => {
      mockWorkspaceRepository.getWorkspaceEntityById.mockResolvedValue(null);

      await expect(
        workspaceService.transferWorkspaceOwnership('ws-1', 'usr-owner', 'usr-target')
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 403 if requester is not the current owner', async () => {
      mockWorkspaceRepository.getWorkspaceEntityById.mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-actual-owner',
      });

      await expect(
        workspaceService.transferWorkspaceOwnership('ws-1', 'usr-impostor', 'usr-target')
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Only the workspace owner can transfer ownership',
      });
    });

    it('should throw 400 if trying to transfer ownership to oneself', async () => {
      mockWorkspaceRepository.getWorkspaceEntityById.mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-owner',
      });

      await expect(
        workspaceService.transferWorkspaceOwnership('ws-1', 'usr-owner', 'usr-owner')
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot transfer ownership to yourself',
      });
    });

    it('should throw 400 if target user is not a member of the workspace', async () => {
      mockWorkspaceRepository.getWorkspaceEntityById.mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-owner',
      });
      mockWorkspaceRepository.getWorkspaceMemberByUser.mockResolvedValue(null);

      await expect(
        workspaceService.transferWorkspaceOwnership('ws-1', 'usr-owner', 'usr-target')
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'The target user must be a member of the workspace to receive ownership',
      });
    });

    it('should execute transfer atomically and broadcast ownership_transferred event', async () => {
      mockWorkspaceRepository.getWorkspaceEntityById.mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-owner',
      });
      mockWorkspaceRepository.getWorkspaceMemberByUser.mockResolvedValue({
        id: 'mem-target',
        userId: 'usr-target',
        role: WorkspaceRole.ADMIN,
      });
      mockWorkspaceRepository.transferWorkspaceOwnership.mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-target',
      });

      const result = await workspaceService.transferWorkspaceOwnership(
        'ws-1',
        'usr-owner',
        'usr-target'
      );

      expect(mockWorkspaceRepository.transferWorkspaceOwnership).toHaveBeenCalledWith(
        'ws-1',
        'usr-owner',
        'usr-target'
      );
      expect(eventsService.broadcast).toHaveBeenCalledWith({
        type: 'WORKSPACE_MUTATED',
        workspaceId: 'ws-1',
        action: 'ownership_transferred',
      });
      expect(result.ownerId).toBe('usr-target');
    });
  });

  describe('updateWorkspaceMemberRole', () => {
    it('should throw 400 if attempting to assign OWNER role through role update', async () => {
      mockWorkspaceRepository.getWorkspaceMemberByUser.mockResolvedValue({
        role: WorkspaceRole.OWNER,
      });

      await expect(
        workspaceService.updateWorkspaceMemberRole(
          'ws-1',
          'mem-2',
          'usr-owner',
          WorkspaceRole.OWNER
        )
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Owner role cannot be assigned',
      });
    });

    it('should throw 403 if attempting to change current owner role', async () => {
      mockWorkspaceRepository.getWorkspaceMemberByUser.mockResolvedValue({
        role: WorkspaceRole.OWNER,
      });
      mockWorkspaceRepository.getWorkspaceMemberById.mockResolvedValue({
        id: 'mem-owner',
        role: WorkspaceRole.OWNER,
      });

      await expect(
        workspaceService.updateWorkspaceMemberRole(
          'ws-1',
          'mem-owner',
          'usr-owner',
          WorkspaceRole.ADMIN
        )
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Cannot update workspace owner',
      });
    });
  });
});
