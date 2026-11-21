import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parsePrice } from '../utils/price';

export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantityInput: Locator;
  readonly increaseQuantity: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantityInput = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  /** Opens a product directly by its id (ids come from the API). */
  async goto(productId: string): Promise<void> {
    await this.page.goto(`/product/${productId}`);
  }

  async getPrice(): Promise<number> {
    return parsePrice(await this.unitPrice.innerText());
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
