import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests serially to prevent rate limiting from parallel workers */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["./reporters/customReporter.ts"]],
  /* Timeout for individual tests to handle rate limiting backoffs */
  timeout: 120000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for test types and browsers */
  projects: [
    // API Tests (no browser needed)
    {
      name: "api tests",
      testMatch: "**/api/**",
      testDir: "./tests",
    },

    // UI Tests - Chromium
    {
      name: "ui tests - chromium",
      testMatch: "**/ui/**",
      testDir: "./tests",
      fullyParallel: false,
      workers: 1,
      use: { ...devices["Desktop Chrome"], headless: false },
    },

    // // UI Tests - Firefox
    // {
    //   name: "ui tests - firefox",
    //   testMatch: "**/ui/**",
    //   testDir: "./tests",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // // UI Tests - Webkit
    // {
    //   name: "ui tests - webkit",
    //   testMatch: "**/ui/**",
    //   testDir: "./tests",
    //   use: { ...devices["Desktop Safari"] },
    // },

    // Integration Tests (UI + API)
    {
      name: "integration tests",
      testMatch: "**/integration/**",
      testDir: "./tests",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
