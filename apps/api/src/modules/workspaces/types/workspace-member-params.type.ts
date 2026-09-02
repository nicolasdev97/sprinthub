import { ParamsDictionary } from "express-serve-static-core";

export interface WorkspaceMemberParams extends ParamsDictionary {
  workspaceId: string;
  memberId: string;
}
