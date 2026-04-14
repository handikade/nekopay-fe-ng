import { expect, Page } from '@playwright/test';

export async function performLogin(page: Page, identifier: string, password: string) {
  // Fill in the login form
  await page.getByTestId('login-identifier').fill(identifier);
  await page.getByTestId('login-password').fill(password);

  // Submit the form
  await page.getByTestId('login-submit').click();

  // Verify navigation to the dashboard
  await expect(page.getByTestId('dashboard-sidenav-container')).toBeVisible();
  await expect(page.getByTestId('dashboard-toolbar')).toBeVisible();
  await expect(page.getByTestId('dashboard-sidenav')).toBeVisible();
}
