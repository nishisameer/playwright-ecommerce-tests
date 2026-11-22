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
  readonly houseNumber: Locator;
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
    this.houseNumber = page.getByLabel('House number');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  /** Use a supported country/postcode pair so the site can resolve the full address. */
  async completeBillingAddress(): Promise<void> {
    await this.postalCode.fill('');
    await this.country.selectOption({ label: testAddress.country });
    await this.postalCode.fill(testAddress.postalCode);
    await this.houseNumber.fill(testAddress.houseNumber);
    await this.proceedToPayment.click();
  }

  async pay(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
    await this.finishButton.click();
  }
}
