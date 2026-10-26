export type SseEventType =
  | "TASK_MUTATED"
  | "PROJECT_MUTATED"
  | "WORKSPACE_MUTATED"
  | "NOTIFICATION_CREATED";

export interface TaskMutatedEvent {
  type: "TASK_MUTATED";
  workspaceId: string;
  projectId: string;
  taskId: string;
  action: "created" | "updated" | "deleted";
}

export interface ProjectMutatedEvent {
  type: "PROJECT_MUTATED";
  workspaceId: string;
  projectId: string;
  action: "created" | "updated" | "deleted" | "archived";
}

export interface WorkspaceMutatedEvent {
  type: "WORKSPACE_MUTATED";
  workspaceId: string;
  action: "updated" | "deleted" | "member_added" | "member_removed" | "role_updated" | "ownership_transferred";
}

export interface NotificationCreatedEvent {
  type: "NOTIFICATION_CREATED";
  userId: string;
  notificationId: string;
}

export type SseEvent =
  | TaskMutatedEvent
  | ProjectMutatedEvent
  | WorkspaceMutatedEvent
  | NotificationCreatedEvent;

