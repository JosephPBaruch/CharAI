import { test, expect, Page } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// Mirrors scenarios from CharAI.feature so Playwright Test UI can display them.
test.describe("CharAI.feature", () => {
  const registerUser = async (
    page: Page,
    username: string,
    password: string,
  ) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/localhost:5173/);

    // generate unique username and email

    // Navigate to signup page
    await page.click('[data-testid="signup-button"]');
    await expect(page).toHaveURL(/\/signup/);

    // Fill in signup form
    await page.fill('[data-testid="username-input"]', username);
    await page.fill(
      '[data-testid="email-input"]',
      `testuser${username}@example.com`,
    );
    await page.fill('input[name="first_name"]', username);
    await page.fill('input[name="last_name"]', "User");
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="password2"]', password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Look for the text: "Welcome, Test!"
    await expect(page.locator(`text=Welcome, ${username}!`)).toBeVisible();

    // Verify successful registration (redirects to home page)
    await expect(page).toHaveURL(baseUrl);
  };

  const loginUser = async (page: Page, username: string, password: string) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/localhost:5173/);

    // Navigate to login page
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/\/login/);

    // Fill in login form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    // Submit the form
    await page.click('button[type="submit"]');

    await expect(page.locator(`text=Welcome, ${username}!`)).toBeVisible();

    // Verify successful registration (redirects to home page)
    await expect(page).toHaveURL(baseUrl);
  };

  const logoutUser = async (page: Page) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/localhost:5173/);

    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(baseUrl);

    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  };

  test("User creates an account", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);
  });

  test("User logs out", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);

    await logoutUser(page);
  });

  test("User logs in", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);

    await logoutUser(page);

    await loginUser(page, uniqueUsername, password);
  });
});
