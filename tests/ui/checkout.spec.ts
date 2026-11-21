import { test, expect } from '../../src/fixtures/test';
import { products, TAX_RATE } from '../../src/data/products';
import { validCustomer } from '../../src/data/customers';
import { roundMoney } from '../../src/utils/price';

test.describe('Checkout', { tag: '@checkout' }, () => {
  // Setup: every checkout test starts with the same items in the cart
  // and is already on the "Your Information" step.
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack.slug, products.bikeLight.slug);
    await inventoryPage.openCart();
    await cartPage.checkout();
  });

  test('order totals are calculated correctly', { tag: '@regression' }, async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo(validCustomer);

    const expectedSubtotal = roundMoney(products.backpack.price + products.bikeLight.price);
    const expectedTax = roundMoney(expectedSubtotal * TAX_RATE);

    const totals = await checkoutPage.getTotals();
    expect(totals.subtotal).toBe(expectedSubtotal);
    expect(totals.tax).toBe(expectedTax);
    expect(totals.total).toBe(roundMoney(expectedSubtotal + expectedTax));
  });

  // Data-driven validation tests: one test per required field.
  const requiredFields = [
    { field: 'first name', data: { ...validCustomer, firstName: '' }, error: 'First Name is required' },
    { field: 'last name', data: { ...validCustomer, lastName: '' }, error: 'Last Name is required' },
    { field: 'postal code', data: { ...validCustomer, postalCode: '' }, error: 'Postal Code is required' },
  ];

  for (const row of requiredFields) {
    test(`validation: ${row.field} is required`, { tag: '@regression' }, async ({ checkoutPage, page }) => {
      await checkoutPage.fillCustomerInfo(row.data);

      await expect(checkoutPage.errorMessage).toContainText(row.error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test('cancel returns to the cart with items kept', { tag: '@regression' }, async ({ checkoutPage, cartPage, page }) => {
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(2);
  });

  test('cart is empty after a completed order', { tag: '@regression' }, async ({ checkoutPage, inventoryPage }) => {
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.finish();
    await checkoutPage.backHomeButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
