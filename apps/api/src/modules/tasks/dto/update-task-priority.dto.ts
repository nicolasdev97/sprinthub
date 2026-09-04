import { TaskPriority } from "@prisma/client";

export interface UpdateTaskPriorityDto {
  priority: TaskPriority;
}
