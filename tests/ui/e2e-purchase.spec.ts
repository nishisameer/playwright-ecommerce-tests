import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';
import { validCustomer } from '../../src/data/customers';

/**
 * The single most important business flow: can a customer buy something?
 * It's one test with steps (not several dependent tests), so it can run
 * on its own, in parallel, and on retry. Steps still show up in the report.
 */
test('customer can complete a purchase end to end', { tag: ['@smoke', '@regression', '@e2e'] }, async ({
  inventoryPage,
  cartPage,
  checkoutPage,
  page,
}) => {
  await test.step('add a product to the cart', async () => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack.slug);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  await test.step('review the cart', async () => {
    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
    await cartPage.checkout();
  });

  await test.step('enter customer information', async () => {
    await checkoutPage.fillCustomerInfo(validCustomer);
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  await test.step('place the order', async () => {
    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
