---
description: "Generate a Playwright E2E test for a CharAI feature following existing test patterns."
---

# Create a Playwright E2E Test

Generate a Playwright test for the described feature. Follow the patterns established in `frontend/tests/charai.spec.ts`.

## Setup

- Tests live in `frontend/tests/` and match the glob `**/*.spec.ts`.
- Config is in `frontend/tests/playwright.config.ts`.
- Base URL comes from `process.env.BASE_URL` or defaults to `http://localhost:5173`.
- Import from `@playwright/test`: `test`, `expect`, `Page`.

## Patterns to follow

### Test structure

```typescript
import { test, expect, Page } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

test.describe("<FeatureName>", () => {
  // Reusable helpers as const arrow functions accepting Page
  const setupUser = async (page: Page, username: string, password: string) => {
    // ... registration + login flow
  };

  test("<scenario description>", async ({ page }) => {
    // Arrange → Act → Assert
  });
});
```

### Selectors — priority order

1. `data-testid` attributes: `page.getByTestId("field-name")`
2. Accessible roles: `page.getByRole("button", { name: "Submit" })`
3. Label text: `page.getByLabel("Price")`
4. Text content: `page.locator("text=Welcome")`
5. CSS selectors (last resort): `page.locator('[data-testid="x"] input')`

### Common helpers

- **Register user**: Navigate to `/signup`, fill form fields via `data-testid` selectors (`signup-button`, `username-input`, `email-input`), submit, verify redirect.
- **Login user**: Navigate to `/login`, fill `input[name="username"]` and `input[name="password"]`, submit, verify welcome text.
- **Logout user**: Click `[data-testid="logout-button"]`, verify login button is visible.

### Assertions

- URL checks: `await expect(page).toHaveURL(/\/fields/);`
- Visibility: `await expect(page.locator("...")).toBeVisible();`
- Text content: `await expect(locator).toHaveText("expected");`
- Polling/retries for async operations:
  ```typescript
  await expect(async () => {
    await page.reload();
    await expect(statusLocator).toHaveText("complete");
  }).toPass({ intervals: [3_000], timeout: 120_000 });
  ```

### Timeouts

- Default timeout is 30s (from config).
- For long-running operations (e.g., prescription generation), extend per-test: `test.setTimeout(180_000);`

### Unique test data

- Generate unique usernames with timestamps: `` `testuser${Date.now()}` ``
- Use deterministic test coordinates (e.g., Idaho farmland area around `46.75, -116.97`).

## When generating a test

1. Ask what user flow or feature to test if not specified.
2. Reuse existing helper patterns (register, login, logout) — don't reinvent them.
3. Add `data-testid` attributes to any new frontend elements that need them (note these in your output).
4. Use descriptive test names that read like user stories.
5. Handle async operations with polling rather than fixed `waitForTimeout`.
6. Keep tests independent — each test should set up its own state (register a fresh user, etc.).
