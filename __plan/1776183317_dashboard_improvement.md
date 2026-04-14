# E2E Test: Dashboard Improvement Plan

This plan details the migration of `DashboardLayout` to Tailwind CSS and the enhancement of its `data-testid` attributes for better E2E testability.

## Objectives

- **Tailwind Migration:** Replace internal CSS with utility-first Tailwind classes to align with the project's styling standards.
- **E2E Testability:** Add specific `data-testid` attributes to navigable elements and critical actions for robust automated testing.

## Affected Files

- `src/app/features/dashboard/dashboard.layout.ts`

## Detailed Implementation

### 1. Tailwind Migration

Replace the `styles` block with Tailwind utility classes in the component template:

- Use `h-screen` for the sidenav container.
- Use `sticky top-0 z-[1]` for the toolbar.
- Use `flex-1` instead of a custom `.spacer` class.
- Apply `p-6` for the main content area padding.
- For the active navigation link, use Tailwind classes within the `routerLinkActive` binding if possible, or keep the existing class if it's too complex to translate purely to utility classes while maintaining Material list-item standards.

### 2. Data-TestID Enhancement

Add the following `data-testid` attributes to ensure reliable element selection:

- **Sidenav Toggle Button:** `[data-testid="dashboard-toggle-sidenav"]`
- **Navigation Items:** `[data-testid="dashboard-nav-item-{{item.path}}"]` (e.g., `dashboard-nav-item-partner`, `dashboard-nav-item-summary`).
- **Logout Button:** `[data-testid="dashboard-logout-button"]`
- **Toolbar:** Ensure `[data-testid="dashboard-toolbar"]` is correctly positioned.
- **Sidenav:** Ensure `[data-testid="dashboard-sidenav"]` is correctly positioned.

## Verification Steps

### 1. Compilation & Integrity

- Run `npm run build` to ensure no regression in bundle generation.
- Run `npm run lint` and `npm run format` to verify coding standards.

### 2. UI/UX Verification

- Manually verify that the sidenav toggle still works correctly.
- Ensure the active link styling is still visible when navigating between sections.
- Confirm the layout remains responsive and fits the screen height (`h-screen`).

### 3. E2E Test Capability

- Verify the new selectors are discoverable in the DOM:
  - `page.getByTestId('dashboard-logout-button')`
  - `page.getByTestId('dashboard-nav-item-partner')`
  - `page.getByTestId('dashboard-toggle-sidenav')`

## Technical Notes

- Maintain `ChangeDetectionStrategy.OnPush` for performance.
- Use the `isExpanded()` signal for dynamic styling of the sidenav width as currently implemented.
- Ensure that the `mat-list-item` structure remains intact during the transition to ensure Material design consistency.
