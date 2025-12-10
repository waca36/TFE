import { test, expect } from "@playwright/test";
import { ensureLoggedOut, login, logout } from "./utils/helpers";

const BASE_URL = process.env.FRONT_URL || "http://localhost:5173";
const USER_EMAIL = "TestUser@TestUser.TestUser";
const USER_PASSWORD = "123456@789";

test.describe.serial("E2E User Flows", () => {
  test("User can view events page", async ({ page }) => {
    // Ensure logged out, then login
    await ensureLoggedOut(page);
    await login(page, USER_EMAIL, USER_PASSWORD);

    // Navigate to events
    await page.goto(`${BASE_URL}/events`);

    // Page should load (check body is visible)
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/events/);

    // Logout
    await logout(page);
  });

  test("User can view spaces page", async ({ page }) => {
    await ensureLoggedOut(page);
    await login(page, USER_EMAIL, USER_PASSWORD);

    // Navigate to spaces
    await page.goto(`${BASE_URL}/espaces`);

    // Page should load
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/espaces/);

    await logout(page);
  });

  test("User can view their reservations", async ({ page }) => {
    await ensureLoggedOut(page);
    await login(page, USER_EMAIL, USER_PASSWORD);

    // Navigate to my reservations
    await page.goto(`${BASE_URL}/my-reservations`);

    // Page should load
    await expect(page.locator('body')).toBeVisible();

    await logout(page);
  });

  test("User can view garderie page", async ({ page }) => {
    await ensureLoggedOut(page);
    await login(page, USER_EMAIL, USER_PASSWORD);

    // Navigate to garderie
    await page.goto(`${BASE_URL}/garderie`);

    // Page should load
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/garderie/);

    await logout(page);
  });
});
