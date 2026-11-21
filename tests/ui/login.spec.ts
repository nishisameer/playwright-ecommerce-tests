import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

// Login tests must start logged OUT, so they ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', { tag: '@login' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', { tag: ['@smoke', '@regression'] }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', { tag: '@regression' }, async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.errorMessage).toContainText('this user has been locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password shows an error', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.login(users.standard, 'wrong_password');

    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  // Data-driven tests: one test is generated per row.
  const missingFields = [
    { case: 'empty username', username: '', password: 'secret_sauce', error: 'Username is required' },
    { case: 'empty password', username: users.standard, password: '', error: 'Password is required' },
  ];

  for (const row of missingFields) {
    test(`validation: ${row.case}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(row.username, row.password);
      await expect(loginPage.errorMessage).toContainText(row.error);
    });
  }

  test('user can log out', { tag: '@regression' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);
    await inventoryPage.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('performance glitch user can still log in', { tag: '@regression' }, async ({ loginPage, inventoryPage }) => {
    test.slow(); // this user is intentionally slow, so triple the timeout for this test only
    await loginPage.login(users.performanceGlitch);

    await expect(inventoryPage.title).toHaveText('Products', { timeout: 15_000 });
  });

  test('logged-out user cannot open the inventory page directly', { tag: '@regression' }, async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.errorMessage).toContainText('You can only access');
  });
});
