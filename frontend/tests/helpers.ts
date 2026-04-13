import { Page, expect } from "@playwright/test";

export const registerUser = async (
  page: Page,
  username: string,
  password: string,
  baseUrl: string,
) => {
  await page.goto(baseUrl);
  await expect(page).toHaveURL(/localhost/);

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

export const loginUser = async (
  page: Page,
  username: string,
  password: string,
  baseUrl: string,
) => {
  await page.goto(baseUrl);
  await expect(page).toHaveURL(/localhost/);

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

export const logoutUser = async (page: Page, baseUrl: string) => {
  await page.goto(baseUrl);
  await expect(page).toHaveURL(/localhost/);

  await page.click('[data-testid="profile-menu-button"]');
  await page.click('[data-testid="logout-button"]');
  await expect(page).toHaveURL(baseUrl);

  await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
};
