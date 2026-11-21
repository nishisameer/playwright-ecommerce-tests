import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { testAddress } from '../data/addresses';

export type PaymentMethod = 'cash-on-delivery' | 'bank-transfer' | 'credit-card' | 'buy-now-pay-later' | 'gift-card';

/**
 * Steps 2-4 of checkout:
 *   2. Sign in (or "you are already logged in")
 *   3. Billing address
 *   4. Payment
 */
export class CheckoutPage extends BasePage {
  readonly proceedToAddress: Locator;
  readonly proceedToPayment: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.proceedToAddress = page.getByTestId('proceed-2');
    this.proceedToPayment = page.getByTestId('proceed-3');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  /**
   * For a logged-in customer the address is usually pre-filled from their profile.
   * We only fill fields that are empty, so the test works either way.
   */
  async completeBillingAddress(): Promise<void> {
    const fields: [Locator, string][] = [
      [this.street, testAddress.street],
      [this.city, testAddress.city],
      [this.state, testAddress.state],
      [this.country, testAddress.country],
      [this.postalCode, testAddress.postalCode],
    ];
    await this.street.waitFor();
    for (const [field, value] of fields) {
      if ((await field.count()) === 0 || (await field.inputValue()) !== '') continue;

      const tag = await field.evaluate((el) => el.tagName);
      if (tag === 'SELECT') {
        await field.selectOption({ index: 1 }); // a dropdown: pick the first real option
      } else {
        await field.fill(value);
      }
    }
    await this.proceedToPayment.click();
  }

  async pay(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
    await this.finishButton.click();
  }
}
