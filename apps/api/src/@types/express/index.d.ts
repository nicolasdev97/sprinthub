import { Project, Task, WorkspaceMember } from '@prisma/client';
import { JwtPayload } from '../../shared';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      validatedQuery?: unknown;
      validatedData?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      workspaceId?: string;
      workspaceMember?: WorkspaceMember;
      project?: Project;
      task?: Task;
    }
  }
}

export {};
