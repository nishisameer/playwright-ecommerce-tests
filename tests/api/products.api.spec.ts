import { test, expect } from '../../src/fixtures/test';
import { type Paginated, type Product } from '../../src/api/ToolshopApi';
import { NO_RESULTS_TERM, SEARCH_TERM } from '../../src/data/products';

/**
 * API tests run without a browser, so they're fast and very stable:
 * a good place to check business data (prices, search, sorting).
 */
test.describe('Products API', { tag: '@api' }, () => {
  test('GET /products returns a paginated product list', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
    const response = await api.getProducts();

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Paginated<Product>;
    expect(body.current_page).toBe(1);
    expect(body.total).toBeGreaterThan(0);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('every product has the required fields', { tag: '@regression' }, async ({ api }) => {
    const body = (await (await api.getProducts()).json()) as Paginated<Product>;

    for (const product of body.data) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          brand: expect.objectContaining({ name: expect.any(String) }),
          category: expect.objectContaining({ name: expect.any(String) }),
        }),
      );
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('GET /products/{id} returns the same product as the list', { tag: '@regression' }, async ({ api }) => {
    const list = (await (await api.getProducts()).json()) as Paginated<Product>;
    const first = list.data[0];

    const response = await api.getProduct(first.id);
    expect(response.status()).toBe(200);
    const product = (await response.json()) as Product;
    expect(product.name).toBe(first.name);
    expect(product.price).toBe(first.price);
  });

  test('GET /products/{id} with an unknown id returns 404', { tag: '@regression' }, async ({ api }) => {
    const response = await api.getProduct('00000000000000000000000000');
    expect(response.status()).toBe(404);
  });

  test('search returns matching products', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
    const response = await api.searchProducts(SEARCH_TERM);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Paginated<Product>;
    expect(body.data.length).toBeGreaterThan(0);
    const names = body.data.map((p) => p.name.toLowerCase());
    expect(names.some((name) => name.includes(SEARCH_TERM))).toBeTruthy();
  });

  test('search with no match returns an empty list', { tag: '@regression' }, async ({ api }) => {
    const body = (await (await api.searchProducts(NO_RESULTS_TERM)).json()) as Paginated<Product>;
    expect(body.data).toHaveLength(0);
  });

  test('sort by price ascending', { tag: '@regression' }, async ({ api }) => {
    const body = (await (await api.getProducts({ sort: 'price,asc' })).json()) as Paginated<Product>;

    const prices = body.data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('brands and categories are available', { tag: '@regression' }, async ({ api }) => {
    const brands = await api.getBrands();
    const categories = await api.getCategories();

    expect(brands.status()).toBe(200);
    expect(categories.status()).toBe(200);
    expect(((await brands.json()) as unknown[]).length).toBeGreaterThanOrEqual(2);
    expect(((await categories.json()) as unknown[]).length).toBeGreaterThan(0);
  });
});
