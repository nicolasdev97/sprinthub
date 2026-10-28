import { ParamsDictionary } from 'express-serve-static-core';

export interface WorkspaceDashboardParams extends ParamsDictionary {
  workspaceId: string;
}
