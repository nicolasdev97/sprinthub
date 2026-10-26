export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
}
