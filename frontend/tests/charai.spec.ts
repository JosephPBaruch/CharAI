import { test, expect, Page } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";
const defaultFieldCoordinates = [
  { lat: "46.75520514295208", lng: "-116.97727203369142" },
  { lat: "46.75214798439814", lng: "-116.94499969482423" },
  { lat: "46.74591554718295", lng: "-116.96405410766603" },
];

// Mirrors scenarios from CharAI.feature so Playwright Test UI can display them.
test.describe("CharAI.feature", () => {
  const registerUser = async (
    page: Page,
    username: string,
    password: string,
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

  const loginUser = async (page: Page, username: string, password: string) => {
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

  const logoutUser = async (page: Page) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/localhost/);

    await page.click('[data-testid="profile-menu-button"]');
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(baseUrl);

    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  };

  const createField = async (
    page: Page,
    fieldName: string,
    description: string,
    price = "12",
  ) => {
    await page.goto(`${baseUrl}/fields`);

    await page
      .getByRole("button", { name: /Create Farm/ })
      .click();

    await page.getByTestId("biochar-rate-input").locator("input").fill("20");
    await page.getByTestId("biochar-cost-input").locator("input").fill("150");
    await page.getByLabel("Price").fill(price);

    await page.getByTestId("field-name-input").locator("input").fill(fieldName);
    await page
      .getByTestId("field-description-input")
      .locator("textarea")
      .first()
      .fill(description);

    await page.getByTestId("open-manual-coordinates").click();

    for (const [index, coordinate] of defaultFieldCoordinates.entries()) {
      await page.getByTestId("add-marker-button").click();
      await page
        .getByTestId(`marker-lat-${index}`)
        .locator("input")
        .fill(coordinate.lat);
      await page
        .getByTestId(`marker-lng-${index}`)
        .locator("input")
        .fill(coordinate.lng);
    }

    await page.getByTestId("save-boundaries-button").click();
    await page.getByRole("button", { name: "Submit request" }).click();

    await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
    const fieldRow = page.locator("tr").filter({ hasText: fieldName });
    await expect(fieldRow).toBeVisible({ timeout: 15_000 });

    return fieldRow;
  };

  const waitForFieldStatusComplete = async (page: Page, fieldName: string) => {
    await expect(async () => {
      await page.reload();
      const fieldRow = page.locator("tr").filter({ hasText: fieldName });
      await expect(fieldRow).toContainText("Complete");
    }).toPass({ intervals: [3_000], timeout: 120_000 });
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

  test("User creates field and views prescription map", async ({ page }) => {
    test.setTimeout(180_000); // allow up to 3 minutes for prescription processing

    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";
    const fieldName = `Test North Field ${timestamp}`;
    const fieldDescription = "Northern section for testing";

    await registerUser(page, uniqueUsername, password);

    await createField(page, fieldName, fieldDescription);
    await expect(page.locator("td", { hasText: fieldName })).toBeVisible({
      timeout: 5_000,
    });
    await waitForFieldStatusComplete(page, fieldName);

    // Click "Get Map" for that row
    const fieldRow = page.locator("tr").filter({ hasText: fieldName });
    await fieldRow.getByRole("button", { name: "Get Map" }).click();

    // Verify the prescription map dialog is displayed with field name and description
    await expect(page.getByText(fieldName)).toBeVisible();
    await expect(page.getByText(fieldDescription)).toBeVisible();
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

    // Verify the Export Data button is visible
    await expect(page.getByTestId("export-prescription-data")).toBeVisible();

    // Click Export Data and verify a JSON file is downloaded
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-prescription-data").click();
    const download = await downloadPromise;

    // Verify the filename is a JSON file
    expect(download.suggestedFilename()).toMatch(/^prescription-map-.*\.json$/);

    // Read and validate the downloaded content
    const filePath = await download.path();
    const fs = await import("fs");
    const content = fs.readFileSync(filePath!, "utf-8");
    const parsed = JSON.parse(content);

    // Verify it is a GeoJSON FeatureCollection with raw map data
    expect(parsed.type).toBe("FeatureCollection");
    expect(Array.isArray(parsed.features)).toBe(true);
    expect(parsed.features.length).toBeGreaterThan(0);

    // Verify features contain expected raw data properties
    const gridCells = parsed.features.filter(
      (f: { properties: { featureType: string } }) => f.properties.featureType === "gridCell",
    );
    expect(gridCells.length).toBeGreaterThan(0);
    expect(gridCells[0].properties).toHaveProperty("paybackPeriod");

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

    await registerUser(page, uniqueUsername, password);

    // Navigate to /fields and open the form
    await page.goto(`${baseUrl}/fields`);
    await page
      .getByRole("button", { name: /Create Farm/ })
      .click();

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

    await registerUser(page, uniqueUsername, password);

    await page.goto(`${baseUrl}/fields`);
    await page
      .getByRole("button", { name: /Create Farm/ })
      .click();

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
    const fieldName = `Auto Test Field ${timestamp}`;
    const fieldDescription = "Auto test description";

    await registerUser(page, uniqueUsername, password);

    // Navigate to /fields
    await page.goto(`${baseUrl}/fields`);

    // Verify the table starts empty
    await expect(
      page.locator("text=No fields found"),
    ).toBeVisible({ timeout: 5_000 });

    await createField(page, fieldName, fieldDescription, "10");

    // Verify name and description columns are visible in the table
    await expect(page.locator("td", { hasText: fieldName })).toBeVisible({
      timeout: 5_000,
    });

    // Verify the dialog is closed
    await expect(
      page.getByRole("heading", { name: "Create New Field" }),
    ).not.toBeVisible();
  });

  test("User can access previous prescription maps after signing in", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";
    const fieldName = `Previous Map Field ${timestamp}`;
    const fieldDescription = "Prescription map retained after sign in";

    await registerUser(page, uniqueUsername, password);
    await createField(page, fieldName, fieldDescription);
    await waitForFieldStatusComplete(page, fieldName);

    await logoutUser(page);
    await loginUser(page, uniqueUsername, password);

    await page.goto(`${baseUrl}/fields`);
    const fieldRow = page.locator("tr").filter({ hasText: fieldName });
    await expect(fieldRow).toBeVisible({ timeout: 15_000 });

    await fieldRow.getByRole("button", { name: "Get Map" }).click();
    await expect(page.getByText(fieldName)).toBeVisible();
    await expect(page.getByText(fieldDescription)).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.getByTestId("export-prescription-data")).toBeVisible();
  });

  test("System supports multiple users", async ({ browser }) => {
    test.setTimeout(120_000);

    const timestamp = Date.now();
    const firstUsername = `testusera${timestamp}`;
    const secondUsername = `testuserb${timestamp}`;
    const password = "TestPassword123";
    const firstFieldName = `First User Field ${timestamp}`;
    const firstFieldDescription = "Owned by the first user";

    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();

    try {
      await registerUser(firstPage, firstUsername, password);
      await createField(firstPage, firstFieldName, firstFieldDescription);

      await registerUser(secondPage, secondUsername, password);

      await firstPage.goto(`${baseUrl}/fields`);
      await secondPage.goto(`${baseUrl}/fields`);

      await expect(
        firstPage.getByRole("heading", { name: "Your Fields" }),
      ).toBeVisible();
      await expect(
        secondPage.getByRole("heading", { name: "Your Fields" }),
      ).toBeVisible();
      await expect(firstPage.getByTestId("profile-menu-button")).toBeVisible();
      await expect(secondPage.getByTestId("profile-menu-button")).toBeVisible();
      await expect(
        firstPage.locator("tr").filter({ hasText: firstFieldName }),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        secondPage.locator("tr").filter({ hasText: firstFieldName }),
      ).toHaveCount(0);
      await expect(
        secondPage.locator("text=No fields found. Create a farm to get started."),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await firstContext.close();
      await secondContext.close();
    }
  });

  test("User can view profile information", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);

    // Open profile menu
    await page.click('[data-testid="profile-menu-button"]');

    // Click Profile link
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL(/\/profile/);

    // Verify profile information is displayed
    await expect(page.getByTestId("profile-username")).toHaveText(uniqueUsername);
    await expect(page.getByTestId("profile-name")).toContainText(uniqueUsername);
    await expect(page.getByTestId("profile-email")).toContainText(
      `testuser${uniqueUsername}@example.com`,
    );
  });

  test("User can change password", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";
    const newPassword = "NewPassword456!";

    await registerUser(page, uniqueUsername, password);

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

    await loginUser(page, uniqueUsername, newPassword);
  });

  test("User can delete account", async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);

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
    await expect(page.locator(".MuiAlert-root")).toBeVisible({ timeout: 5_000 });
  });
});
