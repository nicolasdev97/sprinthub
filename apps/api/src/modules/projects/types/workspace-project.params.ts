import { ParamsDictionary } from "express-serve-static-core";

export interface WorkspaceProjectParams extends ParamsDictionary {
  workspaceId: string;
}
