import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { exactText, parsePrice } from '../utils/price';

/** Step 1 of checkout: the cart table. */
export class CartPage extends BasePage {
  readonly productTitles: Locator;
  readonly productQuantities: Locator;
  readonly linePrices: Locator;
  readonly cartTotal: Locator;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitles = page.getByTestId('product-title');
    this.productQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  /** The table row for one product. */
  row(productName: string): Locator {
    return this.page.locator('tbody tr').filter({ has: this.page.getByTestId('product-title').filter({ hasText: exactText(productName) }) });
  }

  async getTotal(): Promise<number> {
    return parsePrice(await this.cartTotal.innerText());
  }

  async getLinePrice(productName: string): Promise<number> {
    return parsePrice(await this.row(productName).getByTestId('line-price').innerText());
  }

  async remove(productName: string): Promise<void> {
    await this.row(productName).locator('.btn-danger').click();
  }

  async proceed(): Promise<void> {
    await this.proceedButton.click();
  }
}
