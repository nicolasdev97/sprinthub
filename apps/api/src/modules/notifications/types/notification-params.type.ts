import { ParamsDictionary } from "express-serve-static-core";

export interface NotificationParams extends ParamsDictionary {
  notificationId: string;
}
