import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { exactText, parsePrice } from '../utils/price';

/** Sort values used by the product sort dropdown. */
export type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

/** The home page is the product catalog: product cards, search and sorting. */
export class HomePage extends BasePage {
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly noResults: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.noResults = page.getByTestId('no-results');
    this.sortDropdown = page.getByTestId('sort');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  product(name: string): Locator {
    return this.productNames.filter({ hasText: exactText(name) });
  }

  async openProduct(name: string): Promise<void> {
    await this.product(name).click();
  }

  async getNames(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((n) => n.trim());
  }

  async getPrices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map(parsePrice);
  }
}
