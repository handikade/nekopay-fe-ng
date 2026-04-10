import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('http://localhost:4200/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in the login form
    await page.getByTestId('login-identifier').fill('dika@nekopay.id');
    await page.getByTestId('login-password').fill('neko1234');

    // Submit the form
    await page.getByTestId('login-submit').click();

    // Verify navigation to the dashboard
    await expect(page).toHaveURL(/.*dashboard\/summary/);
    await expect(page.getByTestId('dashboard-toolbar')).toBeVisible();
    await expect(page.getByTestId('dashboard-sidenav')).toBeVisible();
  });

  test('should show validation errors when fields are empty and touched', async ({ page }) => {
    const identifierInput = page.getByTestId('login-identifier');
    const passwordInput = page.getByTestId('login-password');
    const submitButton = page.getByTestId('login-submit');

    // Touch identifier field
    await identifierInput.focus();
    await passwordInput.focus(); // Blur identifier

    await expect(page.getByTestId('login-identifier-error')).toBeVisible();
    await expect(page.getByTestId('login-identifier-error')).toContainText(
      'Username or email is required',
    );

    // Touch password field
    await passwordInput.focus();
    await identifierInput.focus(); // Blur password

    await expect(page.getByTestId('login-password-error')).toBeVisible();
    await expect(page.getByTestId('login-password-error')).toContainText('Password is required');

    // Submit button should be disabled
    await expect(submitButton).toBeDisabled();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in the login form with wrong password
    await page.getByTestId('login-identifier').fill('dika@nekopay.id');
    await page.getByTestId('login-password').fill('xxxx1234');

    // Submit the form
    await page.getByTestId('login-submit').click();

    // Check for snackbar error message
    // Note: We use page.locator because mat-snackBar doesn't have our data-testid by default
    // though it's better to check the content.
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toBeVisible();
    // Assuming server returns "Invalid credentials" as in the requirements
    await expect(snackbar).toContainText('Invalid credentials');

    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });
});
