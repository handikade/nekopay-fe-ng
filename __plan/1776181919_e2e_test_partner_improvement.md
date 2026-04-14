# E2E Test: Partner Lifecycle (Create, Edit, & Delete) - Improved

This plan defines an enhanced end-to-end test for the partner lifecycle, covering creation, verification, editing, and deletion, with a focus on robust element selection using `data-testid`.

## Objectives

- Verify full CRUD lifecycle of a Partner.
- Ensure state transitions are correctly reflected in the UI (Detail page and List page).
- Improve test reliability by avoiding URL-based assertions and using `data-testid` instead.

## Prerequisites

- **Test User:** `qa@nekopay.id` / `test1234`
- **Base URL:** `http://localhost:4200`
- **Test File:** `e2e/partner/partner-lifecycle.spec.ts`
- **Required UI Changes:**
  - Add `data-testid="confirm-dialog-confirm-button"` to the "Confirm" button in `src/app/ui/confirm-dialog.component.ts`.
  - Add `data-testid="confirm-dialog-cancel-button"` to the "Cancel" button in `src/app/ui/confirm-dialog.component.ts`.

## Detailed Test Flow

### 1. Authentication

- Navigate to `/login`.
- Perform login using `performLogin` helper with `qa@nekopay.id`.
- Assert `[data-testid="page-title"]` contains "Summary".

### 2. Creation Flow

- Navigate to `/dashboard/partner/create`.
- Assert `[data-testid="page-title"]` contains "Create Partner".
- Fill "Basic" information:
  - `[data-testid="partner-name-input"]`: `E2E Partner [UNIQUE_ID]`
  - `[data-testid="partner-legal-entity-select"]`: Select `PT` (option `[data-testid="legal-entity-option-PT"]`)
  - `[data-testid="partner-email-input"]`: `e2e-[UNIQUE_ID]@nekopay.id`
  - `[data-testid="partner-phone-input"]`: `+628123456789`
  - `[data-testid="partner-type-checkbox-BUYER"]`: Check.
- Submit form via `[data-testid="partner-submit-button"]`.
- **Verification:**
  - Assert success snackbar `mat-snack-bar-container` contains "Partner created successfully".
  - Assert `[data-testid="page-title"]` contains "Partner Details" (Automatic redirect).

### 3. Detail Verification

- Assert displayed data matches the input:
  - `[data-testid="detail-partner-name"]` matches `E2E Partner [UNIQUE_ID]`
  - `[data-testid="detail-partner-legal-entity"]` matches `PT`
  - `[data-testid="detail-partner-email"]` matches `e2e-[UNIQUE_ID]@nekopay.id`

### 4. Edit Flow

- Click `[data-testid="partner-edit-button"]`.
- Assert `[data-testid="page-title"]` contains "Edit Partner".
- Update information:
  - `[data-testid="partner-name-input"]`: `E2E Partner [UNIQUE_ID] UPDATED`
  - `[data-testid="partner-legal-entity-select"]`: Select `CV` (option `[data-testid="legal-entity-option-CV"]`)
- Submit form via `[data-testid="partner-submit-button"]`.
- **Verification:**
  - Assert success snackbar contains "Partner updated successfully".
  - Assert `[data-testid="page-title"]` contains "Partner Details".
  - Assert `[data-testid="detail-partner-name"]` matches `E2E Partner [UNIQUE_ID] UPDATED`.
  - Assert `[data-testid="detail-partner-legal-entity"]` matches `CV`.

### 5. List & Search Verification

- Navigate to `/dashboard/partner`.
- Assert `[data-testid="page-title"]` contains "Partners".
- Search for the updated name using `[data-testid="partner-search-input"]`.
- **Verification:**
  - Assert `[data-testid="partner-row"]` is visible.
  - Assert `[data-testid="partner-name-link"]` with the updated name is present in the table.

### 6. Deletion Flow

- Click the `[data-testid="partner-name-link"]` to navigate back to the detail page.
- Click `[data-testid="partner-delete-button"]`.
- **Handle Dialog:**
  - Assert confirmation dialog is visible.
  - Click `[data-testid="confirm-dialog-confirm-button"]`.
- **Verification:**
  - Assert success snackbar contains "Partner deleted successfully".
  - Assert `[data-testid="page-title"]` contains "Partners" (Automatic redirect).

### 7. Final Verification (Absence)

- Search for the updated name again using `[data-testid="partner-search-input"]`.
- **Verification:**
  - Assert `[data-testid="partner-no-data"]` is visible.
  - Assert `[data-testid="partner-name-link"]` with the updated name is NOT in the table.

## Technical Notes

- **Unique Data:** Use `Date.now()` to generate unique identifiers for each test run to avoid data collisions in the backend.
- **Snackbar Handling:** Use Playwright's `.filter({ hasText: '...' })` on the snackbar locator to handle race conditions and strict mode violations during animations.
- **Selectors:** Exclusively use `data-testid` for element selection and assertions to ensure test stability against UI styling changes.
- **Verification:** Every major action (Create, Edit, Delete) must be verified by both a success indicator (snackbar) and a secondary check (detail page or search result).
