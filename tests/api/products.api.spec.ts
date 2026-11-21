import { test, expect } from '../../src/fixtures/test';

/**
 * API tests for the AutomationExercise practice API.
 * They run without a browser, so they're fast: good candidates for smoke.
 *
 * Reminder: this API returns HTTP 200 for everything and puts the real
 * result in body.responseCode, so we assert on both.
 */
test.describe('Products API', { tag: '@api' }, () => {
  test('GET productsList returns products', { tag: ['@smoke', '@regression'] }, async ({ productsApi }) => {
    const { response, body } = await productsApi.getAllProducts();

    expect(response.ok()).toBeTruthy();
    expect(body.responseCode).toBe(200);
    expect(body.products?.length).toBeGreaterThan(0);
  });

  test('every product has the required fields', { tag: '@regression' }, async ({ productsApi }) => {
    const { body } = await productsApi.getAllProducts();

    for (const product of body.products ?? []) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.any(String),
          brand: expect.any(String),
        }),
      );
    }
  });

  test('POST productsList is not allowed', { tag: '@regression' }, async ({ productsApi }) => {
    const { body } = await productsApi.postToProductsList();

    expect(body.responseCode).toBe(405);
    expect(body.message).toContain('not supported');
  });

  test('GET brandsList returns brands', { tag: '@regression' }, async ({ productsApi }) => {
    const { body } = await productsApi.getAllBrands();

    expect(body.responseCode).toBe(200);
    expect(body.brands?.length).toBeGreaterThan(0);
  });

  test('search returns matching products', { tag: ['@smoke', '@regression'] }, async ({ productsApi }) => {
    const { body } = await productsApi.searchProduct('top');

    expect(body.responseCode).toBe(200);
    expect(body.products?.length).toBeGreaterThan(0);

    const names = (body.products ?? []).map((p) => p.name.toLowerCase());
    expect(names.some((name) => name.includes('top'))).toBeTruthy();
  });

  test('search without a search term is a bad request', { tag: '@regression' }, async ({ productsApi }) => {
    const { body } = await productsApi.searchProduct();

    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('search_product parameter is missing');
  });

  test('login with unknown user is rejected', { tag: '@regression' }, async ({ productsApi }) => {
    // Synthetic, obviously fake credentials: never real user data.
    const { body } = await productsApi.verifyLogin('no-such-user@example.com', 'not-a-real-password');

    expect(body.responseCode).toBe(404);
    expect(body.message).toContain('User not found');
  });
});
