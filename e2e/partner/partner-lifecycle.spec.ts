import { expect, test } from '@playwright/test';
import { performLogin } from '../auth/auth.helpers';

test.describe('Partner Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Authentication
    await page.goto('http://localhost:4200/login');
    await performLogin(page, 'qa@nekopay.id', 'test1234');
    // Assert page title instead of URL
    await expect(page.getByTestId('page-title')).toContainText('Summary');
  });

  test('should complete the full partner lifecycle: create, verify, edit, and delete', async ({
    page,
  }) => {
    const uniqueId = Date.now().toString();
    const partnerName = `E2E Partner ${uniqueId}`;
    const partnerEmail = `e2e-${uniqueId}@nekopay.id`;
    const partnerPhone = '+628123456789';

    const updatedPartnerName = `${partnerName} UPDATED`;

    // 2. Creation Flow
    await page.goto('http://localhost:4200/dashboard/partner/create');
    await expect(page.getByTestId('page-title')).toContainText('Create Partner');

    // Fill Basic information
    await page.getByTestId('partner-name-input').fill(partnerName);
    await page.getByTestId('partner-legal-entity-select').click();
    await page.getByTestId('legal-entity-option-PT').click();
    await page.getByTestId('partner-email-input').fill(partnerEmail);
    await page.getByTestId('partner-phone-input').fill(partnerPhone);
    await page.getByTestId('partner-type-checkbox-BUYER').click();

    // Submit form
    await page.getByTestId('partner-submit-button').click();

    // Verification: Success snackbar and redirect
    const createSnackbar = page
      .locator('mat-snack-bar-container')
      .filter({ hasText: 'Partner created successfully' });
    await expect(createSnackbar).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('Partner Details');

    // 3. Detail Verification
    await expect(page.getByTestId('detail-partner-name')).toHaveText(partnerName);
    await expect(page.getByTestId('detail-partner-legal-entity')).toHaveText('PT');
    await expect(page.getByTestId('detail-partner-email')).toHaveText(partnerEmail);

    // 4. Edit Flow
    await page.getByTestId('partner-edit-button').click();
    await expect(page.getByTestId('page-title')).toContainText('Edit Partner');

    // Update information
    await page.getByTestId('partner-name-input').fill(updatedPartnerName);
    await page.getByTestId('partner-legal-entity-select').click();
    await page.getByTestId('legal-entity-option-CV').click();

    // Submit form
    await page.getByTestId('partner-submit-button').click();

    // Verification: Success snackbar and details
    const editSnackbar = page
      .locator('mat-snack-bar-container')
      .filter({ hasText: 'Partner updated successfully' });
    await expect(editSnackbar).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('Partner Details');
    await expect(page.getByTestId('detail-partner-name')).toHaveText(updatedPartnerName);
    await expect(page.getByTestId('detail-partner-legal-entity')).toHaveText('CV');

    // 5. List & Search Verification
    await page.goto('http://localhost:4200/dashboard/partner');
    await expect(page.getByTestId('page-title')).toContainText('Partners');

    // Search for the updated name
    await page.getByTestId('partner-search-input').fill(updatedPartnerName);

    // Wait for the loading state to complete if it appears
    const loadingSpinner = page.getByTestId('partner-list-loading');
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).not.toBeVisible();
    }

    // Verification: Search result in table
    const partnerLink = page.getByTestId('partner-name-link').filter({ hasText: updatedPartnerName });
    await expect(partnerLink).toBeVisible();

    // 6. Deletion Flow
    // Click the partner link to go back to detail page
    await partnerLink.click();
    await expect(page.getByTestId('page-title')).toContainText('Partner Details');

    await page.getByTestId('partner-delete-button').click();

    // Handle Confirmation Dialog
    const confirmDialog = page.locator('ui-confirm-dialog');
    await expect(confirmDialog).toBeVisible();
    await page.getByTestId('confirm-dialog-confirm-button').click();

    // Verification: Success snackbar and redirect back to list
    const deleteSnackbar = page
      .locator('mat-snack-bar-container')
      .filter({ hasText: 'Partner deleted successfully' });
    await expect(deleteSnackbar).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('Partners');

    // 7. Final Verification (Absence)
    await page.getByTestId('partner-search-input').fill(updatedPartnerName);

    // Wait for search debounce and potential loading
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).not.toBeVisible();
    }

    // Verification: Row is gone or no data message is shown
    await expect(partnerLink).not.toBeVisible();
    await expect(page.getByTestId('partner-no-data')).toBeVisible();
  });
});
