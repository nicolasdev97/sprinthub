import { test, expect } from '@playwright/test';
import { generateUniqueUser, registerUserViaUi, loginUserViaUi } from './helpers/auth.helper';

test.describe('Auth Journey E2E', () => {
  test('should register a new user successfully and show account created notice', async ({
    page,
  }) => {
    const user = generateUniqueUser('reg');

    await registerUserViaUi(page, user);

    if (page.url().includes('/login')) {
      await expect(page.getByText(/account created/i)).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/(dashboard|workspaces)/);
    }
  });

  test('should log in with valid credentials, navigate to dashboard, and persist session cookie', async ({
    page,
    context,
  }) => {
    const user = generateUniqueUser('login');

    // Register user first
    await registerUserViaUi(page, user);

    // If on /login, proceed with login
    if (page.url().includes('/login')) {
      await loginUserViaUi(page, user);
    }

    // Verify authenticated interface is reached
    await expect(page).toHaveURL(/\/(dashboard|workspaces)/);

    // Verify session indicator cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'sprinthub_session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe('active');
  });

  test('should redirect unauthenticated users attempting to access /workspaces to /login', async ({
    page,
    context,
  }) => {
    // Ensure clean state without cookies
    await context.clearCookies();

    await page.goto('/workspaces');

    // Verify Edge Middleware redirection with redirect param
    await expect(page).toHaveURL(/\/login\?redirect=%2Fworkspaces/);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });
});
