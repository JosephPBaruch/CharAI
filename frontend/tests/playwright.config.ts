import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["**/*.spec.ts"],
  timeout: 30 * 1000,
  use: {
    headless: process.env.HEADLESS !== "false",
    baseURL: process.env.BASE_URL || "http://localhost:5173",
  },
});
