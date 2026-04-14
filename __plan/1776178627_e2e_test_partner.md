# E2E Test: Partner Lifecycle (Create & Edit)

This plan defines the end-to-end test for the partner lifecycle, covering creation, verification, and editing.

## Prerequisites

- **Test User:** `qa@nekopay.id` / `test1234`
- **Base URL:** `http://localhost:4200`
- **Test File:** `e2e/partner/partner-lifecycle.spec.ts`

## Test Flow

### 1. Authentication

- Navigate to `/login`.
- Perform login using `performLogin` helper with `qa@nekopay.id`.
- Assert navigation to `/dashboard/summary`.

### 2. Navigation

- Navigate to `/dashboard/partner/create`.
- Assert `[data-testid="page-title"]` contains "Create Partner".

### 3. Create Partner

- Fill "Basic" information:
  - `[data-testid="partner-name-input"]`: `E2E Partner [UNIQUE_ID]`
  - `[data-testid="partner-legal-entity-select"]`: Select `PT` (option `[data-testid="legal-entity-option-PT"]`)
  - `[data-testid="partner-email-input"]`: `e2e-[UNIQUE_ID]@nekopay.id`
  - `[data-testid="partner-phone-input"]`: `+628123456789`
  - `[data-testid="partner-type-checkbox-BUYER"]`: Check.
- Submit form via `[data-testid="partner-submit-button"]`.
- Assert success snackbar: "Partner created successfully".
- Assert navigation to `/dashboard/partner`.

### 4. Verify Creation & Detail

- Find the newly created partner in the list using `[data-testid="partner-name-link"]` that matches the name.
- Click the partner name to navigate to `/dashboard/partner/:id`.
- Assert `[data-testid="page-title"]` contains "Partner Details".
- Assert displayed data matches input:
  - `[data-testid="detail-partner-name"]`: `E2E Partner [UNIQUE_ID]`
  - `[data-testid="detail-partner-legal-entity"]`: `PT`
  - `[data-testid="detail-partner-email"]`: `e2e-[UNIQUE_ID]@nekopay.id`
  - `[data-testid="detail-partner-phone"]`: `+628123456789`

### 5. Edit Partner

- Click `[data-testid="partner-edit-button"]`.
- Assert `[data-testid="page-title"]` contains "Edit Partner".
- Update information:
  - `[data-testid="partner-name-input"]`: `E2E Partner [UNIQUE_ID] UPDATED`
  - `[data-testid="partner-legal-entity-select"]`: Select `CV` (option `[data-testid="legal-entity-option-CV"]`)
- Submit form via `[data-testid="partner-submit-button"]`.
- Assert success snackbar: "Partner updated successfully".
- Assert navigation back to `/dashboard/partner/:id`.

### 6. Final Verification

- Assert updated data is reflected:
  - `[data-testid="detail-partner-name"]`: `E2E Partner [UNIQUE_ID] UPDATED`
  - `[data-testid="detail-partner-legal-entity"]`: `CV`

## Technical Notes

- Use `data-testid` exclusively for selecting elements and performing assertions.
- Use `Date.now()` to generate unique identifiers for names and emails to avoid collisions.
- Reuse `performLogin` from `e2e/auth/auth.helpers.ts`.
- All newly added `data-testid`s have been implemented in the source code.
