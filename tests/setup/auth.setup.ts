import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { users } from '../../src/data/users';
import { STORAGE_STATE } from '../../playwright.config';

/**
 * Runs once before the UI and hybrid tests (the "setup" project in playwright.config.ts).
 * Logs in through the UI and saves the browser state (the login token in local storage)
 * to a file. Tests then start already logged in, which is much faster than
 * logging in through the UI in every test.
 */
setup('log in as customer and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.customer.email, users.customer.password);

  await expect(page).toHaveURL(/\/account/);
  await expect(loginPage.navMenu).toContainText(users.customer.fullName);

  await page.context().storageState({ path: STORAGE_STATE });
});
