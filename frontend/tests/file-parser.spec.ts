import { test, expect, Page } from "@playwright/test";
import * as path from "path";

const fixture = (testInfo: any, filename: string) => {
  return path.join(path.dirname(testInfo.file), "fixtures", filename);
};

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// Mirrors scenarios from CharAI.feature.file-parser so Playwright Test UI can display them.
test.describe("CharAI.feature.file-parser", () => {
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

  const openCoordinateUploadStepper = async (page: Page) => {
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

  const chooseFileType = async (page: Page, type: "text" | "visual") => {
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

  const setupFieldFormAndOpenUpload = async (page: Page) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const password = "TestPassword123";

    await registerUser(page, uniqueUsername, password);
    await page.goto(`${baseUrl}/fields`);
    await page.getByRole("button", { name: /Create Farm/ }).click();

    // Fill basic field info
    await page.getByTestId("biochar-rate-input").locator("input").fill("20");
    await page.getByTestId("biochar-cost-input").locator("input").fill("150");
    await page.getByLabel("Price").fill("12");
    await page
      .getByTestId("field-name-input")
      .locator("input")
      .fill("Upload Test Field");
    await page
      .getByTestId("field-description-input")
      .locator("textarea")
      .first()
      .fill("Testing file upload parsing");

    await openCoordinateUploadStepper(page);
  };

  test("User can upload and parse valid CSV file", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    // Upload CSV file via dropzone
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture(testInfo, "valid_coordinates.csv"));

    // Wait for file to be processed
    await page.waitForTimeout(500);

    // Verify success state appears (green checkmark, file name)
    await expect(
      page.locator("button:has-text('Next'), button:has-text('Finish')"),
    ).toBeEnabled({ timeout: 5_000 });
  });

  test("User can upload and parse valid JSON file", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture(testInfo, "valid_coordinates.json"));

    await page.waitForTimeout(500);

    await expect(
      page.locator("button:has-text('Next'), button:has-text('Finish')"),
    ).toBeEnabled({ timeout: 5_000 });
  });

  test("User can upload and parse valid GeoJSON file", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "visual");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "valid_coordinates.geojson"),
    );

    await page.waitForTimeout(500);

    await expect(
      page.locator("button:has-text('Next'), button:has-text('Finish')"),
    ).toBeEnabled({ timeout: 5_000 });
  });

  test("User can upload and parse valid KML file", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "visual");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture(testInfo, "valid_coordinates.kml"));

    await page.waitForTimeout(500);

    await expect(
      page.locator("button:has-text('Next'), button:has-text('Finish')"),
    ).toBeEnabled({ timeout: 5_000 });
  });

  test("User sees error when uploading CSV with insufficient coordinates", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_coordinates_insufficient.csv"),
    );
    // Wait longer for validation error to appear after file processing
    await page.waitForTimeout(1000);

    // Wait for validation error to appear - check for the exact error message
    const errorAlert = page.locator('[role="alert"] .MuiAlert-message').last();
    await expect(errorAlert).toContainText(
      "Farm boundary must have at least 3 coordinate points",
      {
        timeout: 5_000,
      },
    );

    // Next button should remain disabled
    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when CSV is missing required lat/lng columns", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_coordinates_missing_columns.csv"),
    );

    // Expect error about missing columns
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("CSV file must contain columns named 'lat' and 'lng'", {
      timeout: 5_000,
    });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when CSV contains non-numeric coordinates", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_coordinates_non_numeric.csv"),
    );

    // Should show validation error about lat/lng columns
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("CSV file must contain columns named 'lat' and 'lng'", {
      timeout: 5_000,
    });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when JSON has insufficient coordinates", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "text");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_coordinates_insufficient.json"),
    );

    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("Farm boundary must have at least 3 coordinate points", {
      timeout: 5_000,
    });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when GeoJSON has null geometry", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "visual");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_geojson_no_geometry.geojson"),
    );

    // Expect geometry-related error - null geometry results in 0 coordinates
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("Farm boundary must have at least 3 coordinate points", {
      timeout: 5_000,
    });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when GeoJSON has insufficient coordinates", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "visual");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      fixture(testInfo, "invalid_geojson_insufficient_coords.geojson"),
    );

    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("Farm boundary must have at least 3 coordinate points", {
      timeout: 5_000,
    });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when KML has no valid geometry", async ({
    page,
  }, testInfo) => {
    await setupFieldFormAndOpenUpload(page);

    await chooseFileType(page, "visual");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixture(testInfo, "invalid_coordinates.kml"));

    // Expect error about geometry or coordinates
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("features without geometry", { timeout: 5_000 });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });
});
