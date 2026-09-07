import { ParamsDictionary } from "express-serve-static-core";

export interface TaskParams extends ParamsDictionary {
  taskId: string;
}
