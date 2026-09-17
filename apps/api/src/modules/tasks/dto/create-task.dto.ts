import { TaskPriority, TaskStatus } from "@prisma/client";

export interface CreateTaskDto {
  projectId: string;
  createdById: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
}
