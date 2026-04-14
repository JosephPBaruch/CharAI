import { Page, TestInfo, expect } from "@playwright/test";

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

export const uploadCoordinateFile = async (
  page: Page,
  baseUrl: string,
  fileType: "visual" | "text",
  fixture: (arg0: any, arg1: string) => string,
  testInfo: TestInfo,
  fileName: string,
) => {
  const timestamp = Date.now();
  const uniqueUsername = `testuser${timestamp}`;
  const password = "TestPassword123";

  await registerUser(page, uniqueUsername, password, baseUrl);

  await setupBasicFieldInfo(page, baseUrl);

  await openCoordinateUploadStepper(page);

  await chooseFileType(page, fileType);

  await uploadFile(page, fixture, testInfo, fileName);
};

export const openCoordinateUploadStepper = async (page: Page) => {
  // Scroll down in the MUI Dialog to find the coordinate upload button
  const dialogContent = page.locator("[role='dialog']").first();
  await dialogContent.evaluate((el: Element) => {
    el.scrollTop = el.scrollHeight;
  });

  await page.waitForTimeout(300);

  // Click button to open coordinate modal
  // This could be "Edit Coordinates", "Add Coordinates", "Draw Boundaries", "Set Farm Coordinates", etc.
  const coordButton = page
    .getByRole("button")
    .filter({ hasText: /Coordin|Boundar|Draw|Edit|Set Farm|Upload/i })
    .first();
  await coordButton.click();

  // Wait for stepper to appear
  await expect(page.getByText("Choose file type")).toBeVisible({
    timeout: 5_000,
  });
};

export const chooseFileType = async (page: Page, type: "text" | "visual") => {
  // Click the appropriate file type button in step 0
  if (type === "text") {
    await page
      .getByRole("button", { name: /CSV|JSON|text/i })
      .first()
      .click();
  } else {
    await page
      .getByRole("button", { name: /KML|GeoJSON|Shapefile|visual/i })
      .first()
      .click();
  }

  // Click Next to proceed to file upload
  await page.getByTestId("coordinate-upload-next-button").click();

  // Verify we're on the upload step
  await expect(
    page.getByRole("heading", { name: "Upload your file" }),
  ).toBeVisible({
    timeout: 5_000,
  });
};

export const setupBasicFieldInfo = async (page: Page, baseUrl: string) => {
  // Navigate to `/fields`
  await page.goto(`${baseUrl}/fields`);

  // Click "Create Farm"
  await page.getByRole("button", { name: /Create Farm/ }).click();

  // Enter biochar settings: application rate (t/ha) and cost per ton
  await page.getByTestId("biochar-rate-input").locator("input").fill("20");
  await page.getByTestId("biochar-cost-input").locator("input").fill("150");

  // Set crop selling price = 12
  await page.getByLabel("Price").fill("12");

  // Fill in field name and description
  await page
    .getByTestId("field-name-input")
    .locator("input")
    .fill("Test North Field");
  await page
    .getByTestId("field-description-input")
    .locator("textarea")
    .first()
    .fill("Northern section for testing");
};

export const verifyMapStatus = async (page: Page) => {
  // Verify the new field appears in the table automatically (no manual page reload)
  await expect(page.locator("table")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("td", { hasText: "WW" })).toBeVisible({
    timeout: 15_000,
  });

  // Verify name and description are visible in the table
  await expect(page.locator("td", { hasText: "Test North Field" })).toBeVisible(
    { timeout: 5_000 },
  );

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
};

export const checkMapValidity = async (page: Page) => {
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
};

export const uploadFile = async (
  page: Page,
  fixture: (arg0: any, arg1: string) => string,
  testInfo: TestInfo,
  fileName: string,
) => {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(fixture(testInfo, `${fileName}`));

  await page.waitForTimeout(500);
};

export const submitCoordinateFile = async (
  page: Page,
  testInfo: TestInfo,
  fixture: (arg0: any, arg1: string) => string,
  fileName: string,
  baseUrl: string,
  fileType: "visual" | "text",
) => {
  await uploadCoordinateFile(
    page,
    baseUrl,
    fileType,
    fixture,
    testInfo,
    fileName,
  );

  await expect(
    page.locator("button:has-text('Next'), button:has-text('Finish')"),
  ).toBeEnabled({ timeout: 5_000 });

  // Click Next to proceed from file upload to visualization step
  await page.getByTestId("coordinate-upload-next-button").click();

  // Verify we're on the visualization step
  await expect(
    page.getByRole("heading", { name: "Visualize your farm" }),
  ).toBeVisible({ timeout: 5_000 });

  // Verify the map is displayed with uploaded coordinates
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 5_000,
  });

  // Click Finish to complete the coordinate upload stepper
  await page.getByTestId("coordinate-upload-next-button").click();

  // Wait for the stepper to close (visualize step disappears)
  await expect(
    page.getByRole("heading", { name: "Visualize your farm boundary" }),
  ).not.toBeVisible({ timeout: 5_000 });

  // Brief pause for toast and animations to settle
  await page.waitForTimeout(500);

  // Click "Submit request" to submit the field for processing
  await page.getByRole("button", { name: "Submit request" }).click();

  await verifyMapStatus(page);

  await checkMapValidity(page);
};

// TODO: YOU LEFT OFF HERE!!!
// LASTLY, CHANGE LOGIC IN file-parser.spec.ts, THEN ADD .SHP FILES, VALID AND INVALID, AND TESTS FOR THEM AS WELL
// THEN, THAT PR COMMENT SHOULD BE DONE.
