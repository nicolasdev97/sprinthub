import { TaskPriority } from "@prisma/client";

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}
