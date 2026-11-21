import { test, expect } from '../../src/fixtures/test';
import { NO_RESULTS_TERM, SEARCH_TERM, productNames } from '../../src/data/products';

test.describe('Product catalog', { tag: '@catalog' }, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('home page shows products with prices', { tag: ['@smoke', '@regression'] }, async ({ homePage }) => {
    await expect(homePage.productNames.first()).toBeVisible();
    expect(await homePage.productNames.count()).toBeGreaterThan(0);
    await expect(homePage.productPrices.first()).toContainText('$');
  });

  test('search finds matching products', { tag: ['@smoke', '@regression'] }, async ({ homePage }) => {
    await homePage.search(SEARCH_TERM);

    await expect(homePage.product(productNames.combinationPliers)).toBeVisible();
    const names = await homePage.getNames();
    expect(names.length).toBeGreaterThan(0);
    // Most results should have the term in their name (search may also match descriptions).
    expect(names.some((name) => name.toLowerCase().includes(SEARCH_TERM))).toBeTruthy();
  });

  test('search with no match shows a message', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.search(NO_RESULTS_TERM);

    await expect(homePage.noResults).toBeVisible();
    await expect(homePage.productNames).toHaveCount(0);
  });

  test('sort by price low to high', { tag: '@regression' }, async ({ homePage }) => {
    const firstNameBefore = await homePage.productNames.first().innerText();
    await homePage.sortBy('price,asc');
    // Wait until the list has re-rendered before reading it.
    await expect(homePage.productNames.first()).not.toHaveText(firstNameBefore);

    const prices = await homePage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by name Z to A', { tag: '@regression' }, async ({ homePage }) => {
    const firstNameBefore = await homePage.productNames.first().innerText();
    await homePage.sortBy('name,desc');
    await expect(homePage.productNames.first()).not.toHaveText(firstNameBefore);

    const names = await homePage.getNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('opening a product shows its details page', { tag: '@regression' }, async ({ homePage, productPage, page }) => {
    await homePage.search(productNames.boltCutters);
    await homePage.openProduct(productNames.boltCutters);

    await expect(page).toHaveURL(/\/product\//);
    await expect(productPage.name).toHaveText(productNames.boltCutters);
    await expect(productPage.addToCartButton).toBeVisible();
  });
});
