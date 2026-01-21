# Functional Testing with Playwright and Cucumber

This directory contains BDD-style functional tests using Playwright and Cucumber based on Gherkin `.feature` files.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm init -y
npm install --save-dev @playwright/test @cucumber/cucumber
npm install --save-dev @cucumber/cucumber playwright
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Project Structure

```
ftest/
├── README.md
├── features/
│   ├── CharAI.feature          # Feature files (must be in features/ directory)
│   └── step_definitions/
│       └── steps.ts            # Step implementations
├── support/
│   └── world.ts                # World/context setup
├── cucumber.js                 # Cucumber configuration
└── package.json
```

**Important:** All `.feature` files must be placed in the `features/` directory. Cucumber will not find feature files outside this directory.

### 4. Create Cucumber Configuration

Create `cucumber.js`:

```javascript
module.exports = {
  default: {
    features: ["features/**/*.feature"],
    require: ["support/**/*.ts", "features/step_definitions/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:reports/cucumber-report.html"],
    formatOptions: {
      snippetInterface: "async-await",
    },
  },
};
```

### 5. Create World/Context

Create `support/world.ts`:

```typescript
import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
```

### 6. Create Step Definitions

Create `features/step_definitions/steps.ts`:

```typescript
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});

// Example step definitions
When('a user creates an account', async function (this: CustomWorld) {
  await this.page?.goto('http://localhost:5173/register');
  await this.page?.fill('input[name="username"]', 'testuser');
  await this.page?.fill('input[name="email"]', 'test@example.com');
  await this.page?.fill('input[name="password"]', 'password123');
  await this.page?.click('button[type="submit"]');
});

Then('the system saves the user\\'s information', async function (this: CustomWorld) {
  // Verify account creation
  await expect(this.page?.locator('text=Account created')).toBeVisible();
});
```

### 7. Update package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "cucumber-js",
    "test:headed": "cucumber-js --format progress",
    "test:report": "cucumber-js --format html:reports/cucumber-report.html"
  },
  "devDependencies": {
    "@cucumber/cucumber": "^10.0.0",
    "@playwright/test": "^1.40.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

### 8. Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["features/**/*", "support/**/*"]
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run with specific tag
npm test -- --tags "@authentication"

# Skip tests with tag
npm test -- --tags "not @skip"

# Run in headed mode (see browser)
HEADLESS=false npm test
```

## Writing Tests

### Feature File Format

Create `.feature` files in the `features/` directory (required):

```gherkin
Feature: Feature Name

  Scenario: Scenario name
    Given initial context
    When an action occurs
    Then expected outcome
    And additional assertion
```

### Tags

- `@skip` - Skip this scenario
- `@authentication` - Authentication-related tests
- `@security` - Security-related tests

### Step Definition Pattern

```typescript
Given(
  "pattern with {string}",
  async function (this: CustomWorld, param: string) {
    // Implementation
  },
);
```

## Debugging

### Run with debug mode:

```bash
DEBUG=cucumber:* npm test
```

### Add breakpoints:

```typescript
When("debugging step", async function (this: CustomWorld) {
  debugger; // Set breakpoint here
  await this.page?.pause(); // Playwright inspector
});
```

## Tips

- Keep step definitions reusable and atomic
- Use Page Object Model for complex interactions
- Store test data in `fixtures/` directory
- Generate missing step definitions: `npm test -- --dry-run`
- Use `--fail-fast` to stop on first failure

## CI/CD Integration

```yaml
# .github/workflows/functional-tests.yml
- name: Run Functional Tests
  run: |
    cd ftest
    npm install
    npx playwright install --with-deps
    npx playwright test --ui
    npm test
```
