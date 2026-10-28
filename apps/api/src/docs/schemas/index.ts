import { commonSchemas } from './common.schemas';
import { authSchemas } from './auth.schemas';
import { userSchemas } from './user.schemas';
import { workspaceSchemas } from './workspace.schemas';
import { projectSchemas } from './project.schemas';
import { taskSchemas } from './task.schemas';
import { notificationSchemas } from './notification.schemas';
import { dashboardSchemas } from './dashboard.schemas';

export const allSchemas = {
  ...commonSchemas,
  ...authSchemas,
  ...userSchemas,
  ...workspaceSchemas,
  ...projectSchemas,
  ...taskSchemas,
  ...notificationSchemas,
  ...dashboardSchemas,
};
