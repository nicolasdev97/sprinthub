import { Page, expect } from '@playwright/test';

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function generateUniqueUser(prefix = 'user'): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return {
    firstName: 'E2E',
    lastName: 'Tester',
    email: `${prefix}_${timestamp}_${random}@sprinthub-test.com`,
    password: 'SecurePassword123!',
  };
}

/**
 * Registers a new unique user through the web registration form and verifies redirection.
 */
export async function registerUserViaUi(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  await expect(page.getByText(/create your account/i)).toBeVisible();

  await page.getByLabel(/first name/i).fill(user.firstName);
  await page.getByLabel(/last name/i).fill(user.lastName);
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill(user.password);
  await page.getByLabel(/confirm password/i).fill(user.password);

  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for redirect away from /register
  await page.waitForURL((url) => !url.pathname.endsWith('/register'), { timeout: 10000 });
}

/**
 * Logs in with the provided user credentials through the login UI.
 */
export async function loginUserViaUi(page: Page, user: Pick<TestUser, 'email' | 'password'>): Promise<void> {
  await page.goto('/login');
  await expect(page.getByText(/welcome back/i)).toBeVisible();

  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill(user.password);

  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for redirect to private area
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Sets up a fresh authenticated user session ready for protected flows.
 */
export async function setupAuthenticatedUser(page: Page): Promise<TestUser> {
  const user = generateUniqueUser();
  await registerUserViaUi(page, user);

  // If redirected to /login (with or without registered=true), perform login
  if (page.url().includes('/login')) {
    await loginUserViaUi(page, user);
  }

  return user;
}
