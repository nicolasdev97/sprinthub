import { TaskPriority, TaskStatus } from "@prisma/client";

export interface CreateTaskDto {
  projectId: string;
  createdById: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
}
