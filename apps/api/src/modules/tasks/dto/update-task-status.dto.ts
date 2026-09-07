import { TaskStatus } from "@prisma/client";

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}
