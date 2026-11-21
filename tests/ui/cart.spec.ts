import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';

/**
 * Every test starts with an EMPTY cart, because each test gets a fresh
 * browser context. No test depends on items another test added.
 */
test.describe('Shopping cart', { tag: '@cart' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('add one product to the cart', { tag: ['@smoke', '@regression'] }, async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
  });

  test('add multiple products updates the badge', { tag: '@regression' }, async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug, products.bikeLight.slug, products.onesie.slug);

    await expect(inventoryPage.cartBadge).toHaveText('3');
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(3);
  });

  test('add button switches to remove', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.boltTShirt.slug);

    await expect(inventoryPage.removeButton(products.boltTShirt.slug)).toBeVisible();
    await expect(inventoryPage.addToCartButton(products.boltTShirt.slug)).toBeHidden();
  });

  test('remove product from the inventory page', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.removeFromCart(products.backpack.slug);

    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('remove product from the cart page', { tag: '@regression' }, async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug, products.bikeLight.slug);
    await inventoryPage.openCart();
    await cartPage.remove(products.backpack.slug);

    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name]);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('cart keeps items after a page reload', { tag: '@regression' }, async ({ inventoryPage, page }) => {
    await inventoryPage.addToCart(products.fleeceJacket.slug);
    await page.reload();

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('continue shopping returns to the product list', { tag: '@regression' }, async ({ cartPage, inventoryPage }) => {
    await cartPage.goto();
    await cartPage.continueShoppingButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
  });
});
