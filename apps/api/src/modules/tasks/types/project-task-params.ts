import { ParamsDictionary } from "express-serve-static-core";

export interface ProjectTaskParams extends ParamsDictionary {
  projectId: string;
}
