import { test, expect } from '../../src/fixtures/test';
import { users, unknownUser } from '../../src/data/users';

// Login tests must start logged OUT, so they ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', { tag: '@login' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('customer can log in', { tag: ['@smoke', '@regression'] }, async ({ loginPage, accountPage, page }) => {
    await loginPage.login(users.customer2.email, users.customer2.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(accountPage.navMenu).toContainText(users.customer2.fullName);
  });

  test('unknown user sees an error', { tag: '@regression' }, async ({ loginPage, page }) => {
    await loginPage.login(unknownUser.email, unknownUser.password);

    await expect(loginPage.loginError).toContainText('Invalid email or password');
    await expect(page).not.toHaveURL(/\/account/);
  });

  // Data-driven: one test generated per row.
  const requiredFields = [
    { case: 'email is required', email: '', password: 'something', error: 'emailError' },
    { case: 'password is required', email: users.customer2.email, password: '', error: 'passwordError' },
  ] as const;

  for (const row of requiredFields) {
    test(`validation: ${row.case}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(row.email, row.password);
      await expect(loginPage[row.error]).toBeVisible();
    });
  }

  test('customer can sign out', { tag: '@regression' }, async ({ loginPage, accountPage }) => {
    await loginPage.login(users.customer2.email, users.customer2.password);
    await expect(accountPage.pageTitle).toHaveText('My account');

    await accountPage.signOut();
    await expect(accountPage.navSignIn).toBeVisible();
  });

  test('logged-out user is sent to login when opening the account page', { tag: ['@regression', '@security'] }, async ({ accountPage, page }) => {
    await accountPage.goto();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
