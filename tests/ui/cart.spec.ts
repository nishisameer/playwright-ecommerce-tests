import { test, expect } from '../../src/fixtures/test';
import { productNames } from '../../src/data/products';
import { roundMoney } from '../../src/utils/price';
import { type ProductPage } from '../../src/pages/ProductPage';

/**
 * Adds several products one by one. After each click we WAIT for the cart
 * counter to update before navigating away; otherwise the "add" request
 * could be cut off by the navigation, which is a classic cause of flaky tests.
 */
async function addProducts(productPage: ProductPage, productIds: string[]): Promise<void> {
  for (const [index, id] of productIds.entries()) {
    await productPage.goto(id);
    await productPage.addToCart();
    await expect(productPage.cartQuantity).toHaveText(String(index + 1));
  }
}

/**
 * Every test starts with an EMPTY cart, because each test gets a fresh
 * browser context. No test depends on items another test added.
 *
 * Product ids and prices come from the API: the UI tests use the API
 * to get reliable test data instead of hard-coding it.
 */
test.describe('Shopping cart', { tag: '@cart' }, () => {
  test('add a product to the cart', { tag: ['@smoke', '@regression'] }, async ({ api, productPage, cartPage }) => {
    const product = await api.findProductByName(productNames.combinationPliers);

    await productPage.goto(product.id);
    await productPage.addToCart();

    await expect(productPage.cartQuantity).toHaveText('1');
    await productPage.openCart();
    await expect(cartPage.productTitles).toHaveText([productNames.combinationPliers]);
  });

  test('quantity is reflected in the line total', { tag: '@regression' }, async ({ api, productPage, cartPage }) => {
    const product = await api.findProductByName(productNames.combinationPliers);

    await productPage.goto(product.id);
    await productPage.setQuantity(3);
    await productPage.addToCart();
    await expect(productPage.cartQuantity).toHaveText('3');

    await cartPage.goto();
    expect(await cartPage.getLinePrice(productNames.combinationPliers)).toBe(roundMoney(product.price * 3));
  });

  test('cart total is the sum of all lines', { tag: '@regression' }, async ({ api, productPage, cartPage }) => {
    const pliers = await api.findProductByName(productNames.combinationPliers);
    const cutters = await api.findProductByName(productNames.boltCutters);

    await addProducts(productPage, [pliers.id, cutters.id]);

    await cartPage.goto();
    await expect(cartPage.productTitles).toHaveCount(2);
    expect(await cartPage.getTotal()).toBe(roundMoney(pliers.price + cutters.price));
  });

  test('remove a product from the cart', { tag: '@regression' }, async ({ api, productPage, cartPage }) => {
    const pliers = await api.findProductByName(productNames.combinationPliers);
    const cutters = await api.findProductByName(productNames.boltCutters);

    await addProducts(productPage, [pliers.id, cutters.id]);

    await cartPage.goto();
    await cartPage.remove(productNames.combinationPliers);

    await expect(cartPage.productTitles).toHaveText([productNames.boltCutters]);
  });
});
