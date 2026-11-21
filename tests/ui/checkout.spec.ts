import { test, expect } from '../../src/fixtures/test';
import { productNames } from '../../src/data/products';
import { users } from '../../src/data/users';

/**
 * The most important business flow: can a logged-in customer buy something?
 * One test with steps (not several dependent tests), so it can run alone,
 * in parallel and on retry. The steps still show up in the report.
 *
 * The customer is already logged in thanks to the setup project.
 */
test('logged-in customer can complete a purchase', { tag: ['@smoke', '@regression', '@e2e', '@checkout'] }, async ({
  api,
  productPage,
  cartPage,
  checkoutPage,
  page,
}) => {
  const product = await api.findProductByName(productNames.combinationPliers);

  await test.step('add a product to the cart', async () => {
    await productPage.goto(product.id);
    await productPage.addToCart();
    await expect(productPage.cartQuantity).toHaveText('1');
  });

  await test.step('review the cart', async () => {
    await productPage.openCart();
    await expect(cartPage.productTitles).toHaveText([productNames.combinationPliers]);
    await cartPage.proceed();
  });

  await test.step('confirm the signed-in customer', async () => {
    await expect(page.getByText(`Hello ${users.customer.fullName}`)).toBeVisible();
    await checkoutPage.proceedToAddress.click();
  });

  await test.step('billing address', async () => {
    await checkoutPage.completeBillingAddress();
  });

  await test.step('pay with cash on delivery', async () => {
    await checkoutPage.pay('cash-on-delivery');
    await expect(checkoutPage.paymentSuccess).toContainText('Payment was successful');
  });

  await test.step('order is confirmed with an invoice number', async () => {
    await checkoutPage.finishButton.click();
    await expect(checkoutPage.orderConfirmation).toContainText(/INV-\d+/);
  });
});
