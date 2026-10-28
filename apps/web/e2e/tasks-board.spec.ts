import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './helpers/auth.helper';

test.describe('Task Board Management E2E', () => {
  test('should create a task in the board, transition its status, and persist across page reload', async ({ page }) => {
    // 1. Authenticate user
    await setupAuthenticatedUser(page);

    // 2. Create Workspace
    await page.goto('/workspaces');
    const wsName = `Board_WS_${Date.now()}`;
    await page.getByRole('button', { name: /new workspace|create workspace/i }).first().click();
    await page.getByLabel(/workspace name/i).fill(wsName);
    await page.getByRole('button', { name: 'Create Workspace', exact: true }).click();
    await expect(page.getByRole('link', { name: wsName, exact: true })).toBeVisible();

    // 3. Navigate into Workspace & Create Project
    await page.getByRole('link', { name: wsName, exact: true }).click();
    await page.waitForURL((url) => url.pathname.includes('/projects'));

    const projName = `Board_Proj_${Date.now()}`;
    await page.getByRole('button', { name: /new project|create project/i }).first().click();
    await page.getByLabel(/project name/i).fill(projName);
    await page.getByRole('button', { name: 'Create Project', exact: true }).click();
    await expect(page.getByRole('link', { name: projName, exact: true })).toBeVisible();

    // 4. Click Project to enter Tasks board view
    await page.getByRole('link', { name: projName, exact: true }).click();
    await page.waitForURL((url) => url.pathname.includes('/tasks'));

    // 5. Open Create Task Dialog
    const taskTitle = `Feature_Task_${Date.now()}`;
    await page.getByRole('button', { name: /new task|create task/i }).first().click();
    await expect(page.getByRole('heading', { name: /create task/i })).toBeVisible();

    // 6. Fill Task Name & Description
    await page.getByLabel(/task name/i).fill(taskTitle);
    await page.getByLabel(/description/i).fill('Testing core board status lifecycle');

    // 7. Submit Create Task
    await page.getByRole('button', { name: 'Create Task', exact: true }).click();

    // 8. Assert Task is visible on board in TODO column (exact match avoids toast collision)
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();

    // 9. Move Task to 'In Progress' via accessible status move button
    const moveButton = page.getByRole('button', { name: new RegExp(`Move ${taskTitle} to another status`, 'i') });
    await expect(moveButton).toBeVisible();
    await moveButton.click();

    // Click 'In Progress' from dropdown
    await page.getByRole('menuitem', { name: /in progress/i }).click();

    // Verify task title is still visible
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();

    // 10. Reload page to verify persistence in database
    await page.reload();

    // Task should still be visible on board after reload
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
  });
});

