import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import {
  chooseFileType,
  registerUser,
  submitCoordinateFile,
  uploadCoordinateFile,
} from "./helpers";

const fixture = (testInfo: any, filename: string) => {
  return path.join(path.dirname(testInfo.file), "fixtures", filename);
};

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// Mirrors scenarios from CharAI.feature.file-parser so Playwright Test UI can display them.
test.describe("CharAI.feature.file-parser", () => {
  test("User can upload and parse valid CSV file", async ({
    page,
  }, testInfo) => {
    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "valid_coordinates.csv",
      baseUrl,
      "text",
    );

    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });

    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("User can upload and parse valid JSON file", async ({
    page,
  }, testInfo) => {
    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "valid_coordinates.json",
      baseUrl,
      "text",
    );

    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });

    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("User can upload and parse valid GeoJSON file", async ({
    page,
  }, testInfo) => {
    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "valid_coordinates.geojson",
      baseUrl,
      "visual",
    );
    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });

    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("User can upload and parse valid KML file", async ({
    page,
  }, testInfo) => {
    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "valid_coordinates.kml",
      baseUrl,
      "visual",
    );

    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });

    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("User can upload and parse valid SHP file", async ({
    page,
  }, testInfo) => {
    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "valid_coordinates.shp",
      baseUrl,
      "visual",
    );

    // Wait for render then attach a screenshot to the HTML report
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });

    await test.info().attach("prescription-map", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("User sees error when uploading CSV with insufficient coordinates", async ({
    page,
  }, testInfo) => {
    await uploadCoordinateFile(
      page,
      baseUrl,
      "text",
      fixture,
      testInfo,
      "invalid_coordinates_insufficient.csv",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "text",
      fixture,
      testInfo,
      "invalid_coordinates_missing_columns.csv",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "text",
      fixture,
      testInfo,
      "invalid_coordinates_non_numeric.csv",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "text",
      fixture,
      testInfo,
      "invalid_coordinates_insufficient.json",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "invalid_geojson_no_geometry.geojson",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "invalid_geojson_insufficient_coords.geojson",
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
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "invalid_coordinates.kml",
    );

    // Expect error about geometry or coordinates
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("features without geometry", { timeout: 5_000 });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });
});
