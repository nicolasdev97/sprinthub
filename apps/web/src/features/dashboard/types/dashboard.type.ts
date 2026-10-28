import { Project } from '@/features/projects';
import { Task, TaskPriority, TaskStatus } from '@/features/tasks';

export interface WorkspaceDashboard {
  totalProjects: number;
  activeProjects: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface DashboardTaskItem extends Task {
  project: Pick<Project, 'id' | 'name' | 'status'>;
}

export interface WorkspaceTasksBreakdown {
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  upcomingTasks: DashboardTaskItem[];
  recentTasks: DashboardTaskItem[];
}
