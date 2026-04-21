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

// Mirrors scenarios from CharAI.feature.file-parser so Playwright Test UI can display them.
test.describe("CharAI.file-parser", () => {
  test("User can upload and parse valid CSV file", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);

    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "csv_valid.csv",
      baseUrl,
      "text",
      fieldInformation,
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
    test.setTimeout(120_000);

    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "json_valid.json",
      baseUrl,
      "text",
      fieldInformation,
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
    test.setTimeout(120_000);

    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "geojson_valid.geojson",
      baseUrl,
      "visual",
      fieldInformation,
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
    test.setTimeout(120_000);

    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "kml_valid.kml",
      baseUrl,
      "visual",
      fieldInformation,
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
    test.setTimeout(120_000);

    await submitCoordinateFile(
      page,
      testInfo,
      fixture,
      "shp_valid.zip",
      baseUrl,
      "visual",
      fieldInformation,
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
      "csv_invalid_not_a_polygon.csv",
      fieldInformation,
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
      "csv_invalid_missing_columns.csv",
      fieldInformation,
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
      "csv_invalid_non_numeric.csv",
      fieldInformation,
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
      "json_invalid_coordinates_insufficient.json",
      fieldInformation,
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

  test("User sees error when GeoJSON has insufficient coordinates", async ({
    page,
  }, testInfo) => {
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "geojson_invalid_not_a_polygon.geojson",
      fieldInformation,
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

  test("User sees error when GeoJSON has insufficient coordinates (variant 2)", async ({
    page,
  }, testInfo) => {
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "geojson_invalid_not_a_polygon_2.geojson",
      fieldInformation,
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
      "kml_invalid_not_a_polygon.kml",
      fieldInformation,
    );

    // Expect error about geometry or coordinates
    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText("features without geometry", { timeout: 5_000 });

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when SHP zip contains multiple layers", async ({
    page,
  }, testInfo) => {
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "shp_invalid_multiple_layers.zip",
      fieldInformation,
    );

    await expect(
      page.locator('[role="alert"] .MuiAlert-message').last(),
    ).toContainText(
      "Shapefile must contain a single layer. Your file contains multiple layers.",
      { timeout: 5_000 },
    );

    await expect(
      page.getByTestId("coordinate-upload-next-button"),
    ).toBeDisabled();
  });

  test("User sees error when SHP zip does not contain a polygon", async ({
    page,
  }, testInfo) => {
    await uploadCoordinateFile(
      page,
      baseUrl,
      "visual",
      fixture,
      testInfo,
      "shp_invalid_not_a_polygon.zip",
      fieldInformation,
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
});
