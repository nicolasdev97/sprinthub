export type NotificationType =
  | 'WORKSPACE_INVITATION'
  | 'PROJECT_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PRIORITY_CHANGED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationQueryParams {
  isRead?: boolean;
}
