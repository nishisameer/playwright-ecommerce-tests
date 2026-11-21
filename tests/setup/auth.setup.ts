import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { users } from '../../src/data/users';
import { STORAGE_STATE } from '../../playwright.config';

/**
 * Runs once before the UI tests (see "setup" project in playwright.config.ts).
 * Logs in through the UI and saves the session cookies to a file.
 * Every UI test then starts already logged in, which is much faster
 * than logging in through the UI in every single test.
 */
setup('log in as standard user and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standard);

  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
