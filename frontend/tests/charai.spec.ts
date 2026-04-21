import { test, expect, Page } from "@playwright/test";
import {
  loginUser,
  logoutUser,
  registerUser,
  setupBasicFieldInfo,
} from "./helpers";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

export const fieldInformation: FieldInformationType = {
  fieldName: "Test North Field",
  fieldDescription: "Northern section for testing",
  cropType: "WW",
  biocharRate: "20",
  biocharCost: "150",
  cropSalesPrice: "12",
  expectedNumberOfCells: "11,043",
};

export interface FieldInformationType {
  fieldName: string;
  fieldDescription: string;
  cropType: string;
  biocharRate: string;
  biocharCost: string;
  cropSalesPrice: string;
  expectedNumberOfCells: string;
}

// Mirrors scenarios from CharAI.feature so Playwright Test UI can display them.
test.describe("CharAI.feature", () => {
  test("User creates an account", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);
  });

  test("User logs out", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    await logoutUser(page, baseUrl);
  });

  test("User logs in", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    await logoutUser(page, baseUrl);

    await loginUser(page, uniqueUsername, password, baseUrl);
  });

  test("User creates field and views prescription map", async ({ page }) => {
    test.setTimeout(180_000); // allow up to 3 minutes for prescription processing

    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    await setupBasicFieldInfo(page, baseUrl, fieldInformation);

    // Click "Draw Boundaries" / "Edit Coordinates" to open the coordinate modal
    await page.getByTestId("open-manual-coordinates").click();

    // Add first marker
    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-0")
      .locator("input")
      .fill("46.75520514295208");
    await page
      .getByTestId("marker-lng-0")
      .locator("input")
      .fill("-116.97727203369142");

    // Add second marker
    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-1")
      .locator("input")
      .fill("46.75214798439814");
    await page
      .getByTestId("marker-lng-1")
      .locator("input")
      .fill("-116.94499969482423");

    // Add third marker
    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-2")
      .locator("input")
      .fill("46.74591554718295");
    await page
      .getByTestId("marker-lng-2")
      .locator("input")
      .fill("-116.96405410766603");

    // Click "Save Boundaries"
    await page.getByTestId("save-boundaries-button").click();

    // Click "Submit request"
    await page.getByRole("button", { name: "Submit request" }).click();

    // Verify the new field appears in the table automatically (no manual page reload)
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("td", { hasText: "WW" })).toBeVisible({
      timeout: 15_000,
    });

    // Verify name and description are visible in the table
    await expect(
      page.locator("td", { hasText: "Test North Field" }),
    ).toBeVisible({ timeout: 5_000 });

    // Poll for the status to become "complete" — check every 3 seconds for up to 2 minutes
    await expect(async () => {
      await page.reload();
      const statusCell = page
        .locator("tr")
        .filter({ hasText: "WW" })
        .locator("td")
        .nth(5);
      await expect(statusCell).toHaveText("Complete");
    }).toPass({ intervals: [3_000], timeout: 120_000 });

    // Click "Get Map" for that row
    const fieldRow = page.locator("tr").filter({ hasText: "WW" });
    await fieldRow.getByRole("button", { name: "Get Map" }).click();

    // Verify the prescription map dialog is displayed with field name and description
    await expect(page.getByText("Test North Field")).toBeVisible();
    await expect(page.getByText("Northern section for testing")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // Verify Analysis Summary shows correct total grid cells
    await expect(page.getByText("Analysis Summary")).toBeVisible();
    await expect(page.getByText("Total Grid Cells")).toBeVisible();
    const gridCellsValue = page
      .locator("text=Total Grid Cells")
      .locator("..")
      .locator("p")
      .last();
    await expect(gridCellsValue).toHaveText("11,043");

    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("Crop type dropdown contains all valid options", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    // Navigate to /fields and open the form
    await page.goto(`${baseUrl}/fields`);
    await page.getByRole("button", { name: /Create Farm/ }).click();

    // Open the crop type dropdown
    const cropSelect = page.locator('[data-testid="crop-type-select"]');
    await cropSelect.click();

    // All 12 crop codes from the training set must be present
    const expectedCodes = [
      "SW",
      "SB",
      "SC",
      "SP",
      "WW",
      "WB",
      "WP",
      "WC",
      "WL",
      "AL",
      "WT",
      "GB",
    ];
    for (const code of expectedCodes) {
      await expect(
        page.getByRole("option", { name: new RegExp(code) }),
      ).toBeVisible();
    }
  });

  test("User can select a crop type and it persists in the form", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    await page.goto(`${baseUrl}/fields`);
    await page.getByRole("button", { name: /Create Farm/ }).click();

    // Open the crop type dropdown and pick Spring Barley (SB)
    const cropSelect = page.locator('[data-testid="crop-type-select"]');
    await cropSelect.click();
    await page.getByRole("option", { name: /Spring Barley/ }).click();

    // The select should now display "Spring Barley (SB)"
    await expect(cropSelect).toContainText("Spring Barley");
  });

  test("Field appears in table automatically after submission", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    // Navigate to /fields
    await page.goto(`${baseUrl}/fields`);

    // Verify the table starts empty
    await expect(page.locator("text=No fields found")).toBeVisible({
      timeout: 5_000,
    });

    // Click "Create Farm"
    await page.getByRole("button", { name: /Create Farm/ }).click();

    // Enter biochar settings
    await page.getByTestId("biochar-rate-input").locator("input").fill("20");
    await page.getByTestId("biochar-cost-input").locator("input").fill("150");

    // Set crop selling price
    await page.getByLabel("Price").fill("10");

    // Fill in field name and description
    await page
      .getByTestId("field-name-input")
      .locator("input")
      .fill("Auto Test Field");
    await page
      .getByTestId("field-description-input")
      .locator("textarea")
      .first()
      .fill("Auto test description");

    // Open coordinate modal and add markers
    await page.getByTestId("open-manual-coordinates").click();

    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-0")
      .locator("input")
      .fill("46.75520514295208");
    await page
      .getByTestId("marker-lng-0")
      .locator("input")
      .fill("-116.97727203369142");

    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-1")
      .locator("input")
      .fill("46.75214798439814");
    await page
      .getByTestId("marker-lng-1")
      .locator("input")
      .fill("-116.94499969482423");

    await page.getByTestId("add-marker-button").click();
    await page
      .getByTestId("marker-lat-2")
      .locator("input")
      .fill("46.74591554718295");
    await page
      .getByTestId("marker-lng-2")
      .locator("input")
      .fill("-116.96405410766603");

    // Save boundaries
    await page.getByTestId("save-boundaries-button").click();

    // Submit the field
    await page.getByRole("button", { name: "Submit request" }).click();

    // Verify the field appears in the table automatically WITHOUT page.goto or page.reload
    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("td", { hasText: "WW" })).toBeVisible({
      timeout: 15_000,
    });

    // Verify name and description columns are visible in the table
    await expect(
      page.locator("td", { hasText: "Auto Test Field" }),
    ).toBeVisible({ timeout: 5_000 });

    // Verify the dialog is closed
    await expect(
      page.getByRole("heading", { name: "Create New Field" }),
    ).not.toBeVisible();
  });

  test("User can view profile information", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    // Open profile menu
    await page.click('[data-testid="profile-menu-button"]');

    // Click Profile link
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/profile/);

    // Verify profile information is displayed
    await expect(page.getByTestId("profile-username")).toHaveText(
      uniqueUsername,
    );
    await expect(page.getByTestId("profile-name")).toContainText(
      uniqueUsername,
    );
    await expect(page.getByTestId("profile-email")).toContainText(
      `testuser${uniqueUsername}@example.com`,
    );
  });

  test("User can change password", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";
    const newPassword = "NewPassword456!";

    await registerUser(page, uniqueUsername, password, baseUrl);

    // Navigate to profile
    await page.click('[data-testid="profile-menu-button"]');
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/profile/);

    // Fill in password change form
    await page.fill('[data-testid="current-password-input"]', password);
    await page.fill('[data-testid="new-password-input"]', newPassword);
    await page.fill('[data-testid="confirm-new-password-input"]', newPassword);

    // Submit password change
    await page.click('[data-testid="change-password-button"]');

    // Verify success
    await expect(page.getByTestId("password-success-alert")).toBeVisible({
      timeout: 10_000,
    });

    // Logout and login with new password to verify it works
    await page.click('[data-testid="profile-menu-button"]');
    await page.click('[data-testid="logout-button"]');
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    await loginUser(page, uniqueUsername, newPassword, baseUrl);
  });

  test("User can delete account", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password, baseUrl);

    // Navigate to profile
    await page.click('[data-testid="profile-menu-button"]');
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/profile/);

    // Click delete account button
    await page.click('[data-testid="delete-account-button"]');

    // Verify confirmation dialog appears
    await expect(page.getByText("Confirm Account Deletion")).toBeVisible();

    // Enter password and confirm
    await page.fill('[data-testid="delete-confirm-password-input"]', password);
    await page.click('[data-testid="delete-confirm-button"]');

    // Verify redirected to landing page and logged out
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({
      timeout: 10_000,
    });

    // Verify cannot login with deleted account
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/\/login/);
    await page.fill('input[name="username"]', uniqueUsername);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should see an error
    await expect(page.locator(".MuiAlert-root")).toBeVisible({
      timeout: 5_000,
    });
  });
});
