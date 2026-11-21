import { test as base, expect } from '@playwright/test';
import { env } from '../config/env';
import { ToolshopApi } from '../api/ToolshopApi';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * Custom fixtures: tests ask for what they need instead of building it.
 *
 *   test('...', async ({ homePage, api }) => { ... })
 *
 * Each test gets fresh instances, so tests stay independent.
 */
type Fixtures = {
  api: ToolshopApi;
  loginPage: LoginPage;
  accountPage: AccountPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  /**
   * An API client pointed at the API base URL. Available in UI tests too,
   * which is what makes "hybrid" tests possible (API setup + UI checks).
   */
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiBaseUrl });
    await use(new ToolshopApi(context));
    await context.dispose(); // cleanup after the test
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
