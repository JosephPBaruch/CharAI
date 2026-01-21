# Functional Testing with Playwright

This directory contains Playwright-based functional tests. The `features/CharAI.feature` file remains as documentation of desired flows but is **not executed**; tests live in Playwright specs (`*.spec.ts`).

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
npx playwright install
```

### 2. Project Structure

```
tests/
├── README.md
├── charai.spec.ts          # Playwright specs (executed)
├── features/
│   └── CharAI.feature      # Documentation only (not executed)
├── playwright.config.ts    # Playwright config
├── package.json
└── reports/                # Playwright reports
```

## Running Tests

```bash
# Run headless
npm test

# Open Playwright UI
npm run test:ui

# Headed mode
npm run test:headed

# Custom base URL
BASE_URL=http://localhost:5173 npm test
```

## Writing Tests

- Add new Playwright specs in `*.spec.ts` files (e.g., `charai.spec.ts`).
- Keep `features/CharAI.feature` as living documentation; it is not executed by the runner.

Example snippet:

```typescript
import { test, expect } from "@playwright/test";

test("app loads", async ({ page }) => {
  await page.goto(process.env.BASE_URL || "http://localhost:5173");
  await expect(page).toHaveURL(/localhost:5173/);
});
```

## Debugging

### Debugging

- Inspector: `PWDEBUG=1 npm test`
- Pause in a test: `await page.pause()`

## CI/CD Integration

```yaml
- name: Run Playwright tests
  run: |
    cd frontend/tests
    npm install
    npx playwright install --with-deps
    npm test
```
