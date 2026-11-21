import { type Locator, type Page } from '@playwright/test';

/**
 * The navigation bar that appears on every page.
 * Other page objects extend this class (inheritance), so this code lives in one place.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly navCart: Locator;
  readonly cartQuantity: Locator;
  readonly navSignIn: Locator;
  readonly navMenu: Locator;
  readonly navSignOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navCart = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navMenu = page.getByTestId('nav-menu'); // shows the logged-in user's name
    this.navSignOut = page.getByTestId('nav-sign-out');
  }

  async openCart(): Promise<void> {
    await this.navCart.click();
  }

  async signOut(): Promise<void> {
    await this.navMenu.click();
    await this.navSignOut.click();
  }
}
