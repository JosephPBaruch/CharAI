import { test, expect } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// Mirrors scenarios from CharAI.feature so Playwright Test UI can display them.
test.describe("CharAI.feature", () => {
  test("User creates an account", async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/localhost:5173/);

    // generate unique username and email
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const uniqueEmail = `testuser${timestamp}@example.com`;

    // Navigate to signup page
    await page.click('[data-testid="signup-button"]');
    await expect(page).toHaveURL(/\/signup/);

    // Fill in signup form
    await page.fill('[data-testid="username-input"]', uniqueUsername);
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('input[name="first_name"]', uniqueUsername);
    await page.fill('input[name="last_name"]', "User");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.fill('input[name="password2"]', "TestPassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // wait 3 seconds for any potential redirects
    await page.waitForTimeout(3000);

    // Look for the text: "Welcome, Test!"
    await expect(
      page.locator(`text=Welcome, ${uniqueUsername}!`),
    ).toBeVisible();

    // Verify successful registration (redirects to home page)
    await expect(page).toHaveURL(baseUrl, { timeout: 10000 });
  });
});
