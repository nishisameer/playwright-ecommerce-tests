import { test, expect } from '../../src/fixtures/test';
import { type Paginated, type Product } from '../../src/api/ToolshopApi';
import { SEARCH_TERM } from '../../src/data/products';

/**
 * HYBRID tests use the API and the UI together. This is common on real teams:
 *
 *  - The API is the "source of truth" for data (names, prices, ids).
 *  - The UI test checks that the website SHOWS that data correctly.
 *
 * It's faster and more reliable than doing everything through the UI,
 * and it catches bugs where the frontend displays the wrong data.
 */
test.describe('UI shows the same data as the API', { tag: '@hybrid' }, () => {
  test('product page matches the API (name and price)', { tag: '@regression' }, async ({ api, productPage }) => {
    const list = (await (await api.getProducts()).json()) as Paginated<Product>;
    const product = list.data[0];

    await productPage.goto(product.id);

    await expect(productPage.name).toHaveText(product.name);
    expect(await productPage.getPrice()).toBe(product.price);
  });

  test('UI search results match the API search results', { tag: '@regression' }, async ({ api, homePage }) => {
    const apiResults = (await (await api.searchProducts(SEARCH_TERM)).json()) as Paginated<Product>;
    const apiNames = apiResults.data.map((p) => p.name);

    await homePage.goto();
    await homePage.search(SEARCH_TERM);
    await expect(homePage.productNames).toHaveText(apiNames);
  });

  test('an order placed in the UI appears in the API invoices', { tag: ['@regression', '@checkout'] }, async () => {
    // Exercise for you: see docs/EXERCISES.md (#7).
    // Place an order through the UI, then log in through the API and
    // check GET /invoices contains the new invoice number.
    test.fixme(true, 'Left as a learning exercise');
  });
});
