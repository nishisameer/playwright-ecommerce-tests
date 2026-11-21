import { test, expect } from '../../src/fixtures/test';
import { type Cart } from '../../src/api/ToolshopApi';
import { productNames } from '../../src/data/products';

/**
 * Each test creates its OWN cart, so tests never share state
 * and can run in parallel or alone.
 */
test.describe('Cart API', { tag: '@api' }, () => {
  test('create a cart', { tag: '@regression' }, async ({ api }) => {
    const response = await api.createCart();

    expect(response.status()).toBe(201);
    expect((await response.json()).id).toEqual(expect.any(String));
  });

  test('add a product to a cart', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
    const product = await api.findProductByName(productNames.combinationPliers);
    const cartId = (await (await api.createCart()).json()).id as string;

    const addResponse = await api.addToCart(cartId, product.id, 2);
    expect(addResponse.ok()).toBeTruthy();

    const cart = (await (await api.getCart(cartId)).json()) as Cart;
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0].product_id).toBe(product.id);
    expect(cart.cart_items[0].quantity).toBe(2);
  });

  test('adding the same product again increases the quantity', { tag: '@regression' }, async ({ api }) => {
    const product = await api.findProductByName(productNames.combinationPliers);
    const cartId = (await (await api.createCart()).json()).id as string;

    await api.addToCart(cartId, product.id, 1);
    await api.addToCart(cartId, product.id, 1);

    const cart = (await (await api.getCart(cartId)).json()) as Cart;
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0].quantity).toBe(2);
  });
});
