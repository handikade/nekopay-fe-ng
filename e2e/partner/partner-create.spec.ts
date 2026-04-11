import { expect, test } from '@playwright/test';
import { performLogin } from '../auth/auth.helpers';

test.describe('Partner Create', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:4200/login');
    // Login with provided credentials
    await performLogin(page, 'dika', 'neko1234');
    // Navigate to create partner page
    await page.goto('http://localhost:4200/dashboard/partner/create');
  });

  test('happy path: should create partner successfully', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;
    // Fill the form
    await page.getByTestId('partner-name-input').fill('E2E Test Partner');

    // Select Legal Entity (PT)
    await page.getByTestId('partner-legal-entity-select').click();
    await page.getByTestId('legal-entity-option-PT').click();

    await page.getByTestId('partner-email-input').fill(uniqueEmail);
    await page.getByTestId('partner-phone-input').fill('+62811223344');

    // Select Partner Type (BUYER)
    await page.getByTestId('partner-type-checkbox-BUYER').click();

    // Submit the form
    await page.getByTestId('partner-submit-button').click();

    // Verify success snackbar
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toBeVisible();
    await expect(snackbar).toContainText('Partner created successfully');

    // Verify navigation back to partner list
    await expect(page).toHaveURL(/.*dashboard\/partner$/);
  });

  test('negative case: should show validation errors', async ({ page }) => {
    const nameInput = page.getByTestId('partner-name-input');
    const emailInput = page.getByTestId('partner-email-input');
    const phoneInput = page.getByTestId('partner-phone-input');

    // Touch fields and blur to trigger validation
    await nameInput.focus();
    await emailInput.focus(); // Blur name
    await expect(page.getByTestId('partner-name-error')).toBeVisible();

    await emailInput.fill('invalid-email');
    await phoneInput.focus(); // Blur email
    await expect(page.getByTestId('partner-email-format-error')).toBeVisible();

    await emailInput.clear();
    await phoneInput.focus(); // Blur email
    await expect(page.getByTestId('partner-email-required-error')).toBeVisible();

    await phoneInput.focus();
    await nameInput.focus(); // Blur phone
    await expect(page.getByTestId('partner-phone-error')).toBeVisible();

    // Check submit button is disabled
    await expect(page.getByTestId('partner-submit-button')).toBeDisabled();
  });

  test('should navigate back when cancel button is clicked', async ({ page }) => {
    await page.getByTestId('partner-cancel-button').click();
    // Verify navigation back to partner list
    await expect(page).toHaveURL(/.*dashboard\/partner$/);
  });
});
