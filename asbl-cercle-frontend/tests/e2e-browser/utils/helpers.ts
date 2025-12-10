import { Page, expect } from "@playwright/test";

const BASE_URL = process.env.FRONT_URL || "http://localhost:5173";

/**
 * Ensures user is logged out before starting a test
 */
export async function ensureLoggedOut(page: Page) {
  await page.goto(BASE_URL);

  // Check if there's a logout button visible (meaning user is logged in)
  const logoutButton = page.locator('button, a').filter({ hasText: /logout|déconnexion|se déconnecter/i }).first();

  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Login helper
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for successful login (redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Try to find and click logout button
  const logoutButton = page.locator('button, a').filter({ hasText: /logout|déconnexion|se déconnecter/i }).first();

  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Navigate using navbar link (first match in nav)
 */
export async function navigateViaNavbar(page: Page, linkText: RegExp) {
  const navLink = page.locator('nav').getByRole('link', { name: linkText }).first();
  await navLink.click();
}
