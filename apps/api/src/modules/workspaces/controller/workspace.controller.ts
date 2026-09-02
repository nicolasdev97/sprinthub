import { Request, Response } from "express";

import { WorkspaceParams, WorkspaceMemberParams } from "../types";

import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddWorkspaceMemberDto,
  UpdateWorkspaceMemberRoleDto,
} from "../dto";
import { WorkspaceService } from "../service";

export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async createWorkspace(req: Request, res: Response) {
    const data = req.body as CreateWorkspaceDto;
    const ownerId = req.user!.userId;

    const workspace = await this.workspaceService.createWorkspace(
      data,
      ownerId,
    );

    res.status(201).json(workspace);
  }

  async getUserWorkspaces(req: Request, res: Response) {
    const userId = req.user!.userId;

    const workspaces = await this.workspaceService.getUserWorkspaces(userId);

    res.status(200).json(workspaces);
  }

  async getWorkspaceById(req: Request<WorkspaceParams>, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await this.workspaceService.getWorkspaceById(
      workspaceId,
      userId,
    );

    res.status(200).json(workspace);
  }

  async updateWorkspace(
    req: Request<WorkspaceParams, unknown, UpdateWorkspaceDto>,
    res: Response,
  ) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await this.workspaceService.updateWorkspace(
      workspaceId,
      userId,
      req.body,
    );

    res.status(200).json(workspace);
  }

  async deleteWorkspace(req: Request<WorkspaceParams>, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    await this.workspaceService.deleteWorkspace(workspaceId, userId);

    res.status(204).send();
  }

  async addWorkspaceMember(
    req: Request<WorkspaceParams, unknown, AddWorkspaceMemberDto>,
    res: Response,
  ) {
    const { workspaceId } = req.params;

    const member = await this.workspaceService.addWorkspaceMember(
      workspaceId,
      req.user.userId,
      req.body,
    );

    res.status(201).json(member);
  }

  async getWorkspaceMembers(req: Request<WorkspaceParams>, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspaceMembers = await this.workspaceService.getWorkspaceMembers(
      workspaceId,
      userId,
    );

    res.status(200).json(workspaceMembers);
  }

  async updateWorkspaceMemberRole(
    req: Request<WorkspaceMemberParams, {}, UpdateWorkspaceMemberRoleDto>,
    res: Response,
  ) {
    const { workspaceId, memberId } = req.params;
    const userId = req.user.userId;

    const workspaceMember =
      await this.workspaceService.updateWorkspaceMemberRole(
        workspaceId,
        memberId,
        userId,
        req.body.role,
      );

    res.status(200).json(workspaceMember);
  }

  async removeWorkspaceMember(
    req: Request<WorkspaceMemberParams>,
    res: Response,
  ) {
    const { workspaceId, memberId } = req.params;
    const userId = req.user.userId;

    await this.workspaceService.removeWorkspaceMember(
      workspaceId,
      memberId,
      userId,
    );

    res.status(204).send();
  }
}
