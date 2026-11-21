import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/account');
  }
}
