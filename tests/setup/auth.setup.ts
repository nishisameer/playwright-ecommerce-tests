import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { users } from '../../src/data/users';
import { STORAGE_STATE } from '../../src/config/storage-state';

/**
 * Runs once before the UI and hybrid tests (the "setup" project in playwright.config.ts).
 * Logs in through the UI and saves the browser state (the login token in local storage)
 * to a file. Tests then start already logged in, which is much faster than
 * logging in through the UI in every test.
 */
setup('log in as customer and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // If the login form never shows up, fail with a message that says WHAT page
  // we landed on. A clear failure message saves a lot of triage time.
  try {
    await expect(loginPage.emailInput).toBeVisible({ timeout: 20_000 });
  } catch {
    const bodyText = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
    throw new Error(
      `Login form not found.\n  URL: ${page.url()}\n  Title: ${await page.title()}\n  Page text: ${bodyText}`,
    );
  }

  await loginPage.login(users.customer.email, users.customer.password);

  await expect(page).toHaveURL(/\/account/);
  await expect(loginPage.navMenu).toContainText(users.customer.fullName);

  await page.context().storageState({ path: STORAGE_STATE });
});
