# E2E Test Refactoring: robust Navigation & Assertions

This plan details the migration of E2E tests away from hardcoded URL assertions and direct `page.goto` calls for internal navigation, favoring element-based verification and UI-driven navigation via the Dashboard.

## Objectives

- **Robust Navigation:** Replace `page.goto` calls for dashboard sub-pages with clicks on sidenav items.
- **Reliable Assertions:** Replace `toHaveURL` assertions with visibility checks of key layout elements.
- **Login Verification:** Use the sidenav container as the definitive signal for a successful login.

## Prerequisites

- **UI Context:** `src/app/features/dashboard/dashboard.layout.ts` already contains `data-testid="dashboard-sidenav-container"` and `data-testid="dashboard-nav-item-{path}"`.

## Detailed Implementation

### 1. Refactor Navigation Patterns

In all `.spec.ts` files under `e2e/`:

- **Instead of:** `await page.goto('http://localhost:4200/dashboard/partner')`
- **Use:**
  1. Ensure the user is on the dashboard.
  2. `await page.getByTestId('dashboard-nav-item-partner').click();`
  3. Verify navigation via `await expect(page.getByTestId('page-title')).toContainText('Partners');`

### 2. Refactor Login Assertions

In `e2e/auth/login.spec.ts` and `e2e/auth/auth.helpers.ts`:

- **Instead of:** `await expect(page).toHaveURL(/.*dashboard\/summary/);`
- **Use:** `await expect(page.getByTestId('dashboard-sidenav-container')).toBeVisible();`

### 3. Refactor Page Transitions

In `e2e/partner/partner-lifecycle.spec.ts`:

- Remove `toHaveURL` assertions after Create/Edit/Delete actions.
- Favor `toContainText` on `[data-testid="page-title"]` to confirm the user has reached the expected destination page.

## Affected Files

- `e2e/auth/auth.helpers.ts`
- `e2e/auth/login.spec.ts`
- `e2e/partner/partner-lifecycle.spec.ts`
- `e2e/partner/partner-create.spec.ts`

## Verification Steps

### 1. Integrity Check

- Run `npm run lint` to ensure no syntax errors were introduced in the test files.

### 2. Execution Check

- Run all refactored tests in terminal mode:
  ```bash
  npx playwright test --project=chromium --reporter=list
  ```
- Ensure all tests pass without relying on specific URL strings.

## Technical Notes

- **Direct Access:** `page.goto` is still acceptable for the initial entry point (e.g., navigating to `/login`) or when testing deep links directly.
- **Side Effects:** Navigating via the UI mimics real user behavior and verifies that the sidenav links are correctly wired.
- **Consistency:** Ensure `page-title` exists on all target pages (Summary, Partner List, Partner Detail, etc.) to support this pattern.
