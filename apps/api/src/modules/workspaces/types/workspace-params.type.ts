import { ParamsDictionary } from "express-serve-static-core";

export interface WorkspaceParams extends ParamsDictionary {
  workspaceId: string;
}
