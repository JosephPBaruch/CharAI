import { test, expect } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// Mirrors scenarios from CharAI.feature so Playwright Test UI can display them.
test.describe("CharAI.feature", () => {
  test("User creates an account", async ({ page }) => {
    await page.goto(baseUrl);
    // TODO: Implement steps to match the feature scenario.
    await expect(page).toHaveURL(/localhost:5173/);
    // click on sign up button:  data-testid="signup-button"
    await page.click('[data-testid="signup-button"]');

    // timeout in 1 sec
    await page.waitForTimeout(1000);
  });
});
