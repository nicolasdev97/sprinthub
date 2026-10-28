import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './helpers/auth.helper';

test.describe('Workspace & Project Lifecycle E2E', () => {
  test('should create a workspace and then create a project inside it', async ({ page }) => {
    // 1. Authenticate user
    await setupAuthenticatedUser(page);

    // 2. Navigate to Workspaces hub
    await page.goto('/workspaces');
    await expect(page.getByRole('heading', { name: /workspaces hub/i })).toBeVisible();

    // 3. Open Create Workspace Dialog
    const workspaceName = `WS_${Date.now()}`;
    await page
      .getByRole('button', { name: /new workspace/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /create workspace/i })).toBeVisible();

    // 4. Fill Workspace Form & Submit
    await page.getByLabel(/workspace name/i).fill(workspaceName);
    await page.getByLabel(/description/i).fill('Automated E2E Workspace');
    await page.getByRole('button', { name: 'Create Workspace', exact: true }).click();

    // 5. Verify Workspace appears in the list
    await expect(page.getByRole('link', { name: workspaceName, exact: true })).toBeVisible();

    // 6. Enter the newly created workspace via its link/button
    await page.getByRole('link', { name: workspaceName, exact: true }).click();
    await page.waitForURL((url) => url.pathname.includes('/projects'), { timeout: 10000 });

    // 7. Open Create Project Dialog
    const projectName = `Proj_${Date.now()}`;
    await page
      .getByRole('button', { name: /new project/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /create project/i })).toBeVisible();

    // 8. Fill Project Form & Submit
    await page.getByLabel(/project name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Automated E2E Project');
    await page.getByRole('button', { name: 'Create Project', exact: true }).click();

    // 9. Verify Project card appears in the list
    await expect(page.getByRole('link', { name: projectName, exact: true })).toBeVisible();
  });
});
