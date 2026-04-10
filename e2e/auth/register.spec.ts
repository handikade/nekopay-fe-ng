import { expect, test } from '@playwright/test';
import { performLogin } from './auth.helpers';

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the register page before each test
    await page.goto('http://localhost:4200/register');
  });

  test('should register successfully with valid data', async ({ page }) => {
    // Use a unique username, email, and phone to increase the chances of a successful registration
    const uniqueSuffix = Date.now().toString();
    const username = `testuser_${uniqueSuffix}`;
    const email = `testuser_${uniqueSuffix}@example.com`;
    const phone = `08${uniqueSuffix.slice(-9)}`;
    const password = 'securepassword123';

    // Fill in the register form
    await page.getByTestId('register-username').fill(username);
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(password);
    await page.getByTestId('register-phone').fill(phone);

    // Submit the form
    await page.getByTestId('register-submit').click();

    // Verify navigation to the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByTestId('login-page')).toBeVisible();

    // Verify that the registered user can log in
    await performLogin(page, email, password);
  });

  test('should show validation errors when fields are empty and touched', async ({ page }) => {
    const usernameInput = page.getByTestId('register-username');
    const emailInput = page.getByTestId('register-email');
    const passwordInput = page.getByTestId('register-password');
    const submitButton = page.getByTestId('register-submit');

    // Touch username field
    await usernameInput.focus();
    await emailInput.focus(); // Blur username

    await expect(page.getByTestId('register-username-error')).toBeVisible();
    await expect(page.getByTestId('register-username-error')).toContainText(
      'Username is required',
    );

    // Touch email field
    await emailInput.focus();
    await passwordInput.focus(); // Blur email

    await expect(page.getByTestId('register-email-error')).toBeVisible();
    await expect(page.getByTestId('register-email-error')).toContainText('Email is required');

    // Touch password field
    await passwordInput.focus();
    await usernameInput.focus(); // Blur password

    await expect(page.getByTestId('register-password-error')).toBeVisible();
    await expect(page.getByTestId('register-password-error')).toContainText(
      'Password is required',
    );

    // Validating format requirements (e.g., invalid email)
    await emailInput.fill('not-an-email');
    await passwordInput.focus(); // Blur email
    await expect(page.getByTestId('register-email-error')).toBeVisible();
    await expect(page.getByTestId('register-email-error')).toContainText(
      'Invalid email address',
    );

    // Validating password length
    await passwordInput.fill('short');
    await usernameInput.focus(); // Blur password
    await expect(page.getByTestId('register-password-error')).toBeVisible();
    await expect(page.getByTestId('register-password-error')).toContainText(
      'Password must be at least 8 characters',
    );

    // Submit button should be disabled
    await expect(submitButton).toBeDisabled();
  });

  test('should show error message for registration failure', async ({ page }) => {
    // Fill in the form with existing user data to simulate a backend conflict error
    // Based on the login test, 'dika@nekopay.id' exists
    await page.getByTestId('register-username').fill('dika');
    await page.getByTestId('register-email').fill('dika@nekopay.id');
    await page.getByTestId('register-password').fill('neko1234');

    // Submit the form
    await page.getByTestId('register-submit').click();

    // Check for snackbar error message
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toBeVisible();
    
    // We expect some error text from the server, verify it's just not empty or assume some substring
    // We at least expect the snackbar to be visibly shown as an error
    await expect(snackbar).not.toBeEmpty();

    // Should still be on register page
    await expect(page).toHaveURL(/.*register/);
  });
});
