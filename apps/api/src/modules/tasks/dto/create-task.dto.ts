import { TaskPriority, TaskStatus } from "@prisma/client";

export interface CreateTaskDto {
  projectId: string;
  createdById: string;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
}
