import { test, expect } from "@playwright/test";
import { ensureLoggedOut } from "./utils/helpers";

const BASE_URL = process.env.FRONT_URL || "http://localhost:5173";

test.describe.serial("E2E Navigation", () => {
  test("Home page loads correctly", async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto(BASE_URL);

    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test("Can navigate to events page via navbar", async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto(BASE_URL);

    // Click on events link in navbar (use nav to scope)
    const eventsLink = page.locator('nav').getByRole('link', { name: /^Events$/i }).first();
    await eventsLink.click();

    // Should be on events page
    await expect(page).toHaveURL(/events/);
  });

  test("Can navigate to spaces page via navbar", async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto(BASE_URL);

    // Click on spaces link in navbar
    const spacesLink = page.locator('nav').getByRole('link', { name: /^Spaces$/i }).first();
    await spacesLink.click();

    // Should be on espaces page
    await expect(page).toHaveURL(/espace/);
  });

  test("Can navigate to childcare page via navbar", async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto(BASE_URL);

    // Click on garderie link in navbar
    const garderieLink = page.locator('nav').getByRole('link', { name: /^Childcare$/i }).first();
    await garderieLink.click();

    // Should be on garderie page
    await expect(page).toHaveURL(/garderie/);
  });
});
