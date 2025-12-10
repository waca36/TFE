import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  // Run tests sequentially (1 worker)
  workers: 1,
  // Run tests in order within each file
  fullyParallel: false,
  use: {
    baseURL: process.env.FRONT_URL || "http://localhost:5173",
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [["list"]],
  projects: [
    {
      name: "api",
      testDir: "./tests/api",
    },
    {
      name: "e2e",
      testDir: "./tests/e2e-browser",
    },
  ],
});
