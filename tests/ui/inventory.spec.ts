import { test, expect } from '../../src/fixtures/test';
import { products, TOTAL_PRODUCT_COUNT } from '../../src/data/products';
import { users } from '../../src/data/users';

test.describe('Inventory / product listing', { tag: '@inventory' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto(); // already logged in via the saved session
  });

  test('product list loads with all products', { tag: ['@smoke', '@regression'] }, async ({ inventoryPage }) => {
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(TOTAL_PRODUCT_COUNT);
  });

  test('each product shows the expected price', { tag: '@regression' }, async ({ inventoryPage }) => {
    for (const product of Object.values(products)) {
      const card = inventoryPage.items.filter({ hasText: product.name });
      await expect(card.getByTestId('inventory-item-price')).toHaveText(`$${product.price}`);
    }
  });

  test('sort by name Z to A', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getNames();
    const expected = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(expected);
  });

  test('sort by price low to high', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by price high to low', { tag: '@regression' }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('product details page shows the right product', { tag: '@regression' }, async ({ inventoryPage, productDetailsPage, page }) => {
    await inventoryPage.openProduct(products.backpack.name);

    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(productDetailsPage.name).toHaveText(products.backpack.name);
    await expect(productDetailsPage.price).toHaveText(`$${products.backpack.price}`);

    await productDetailsPage.backButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});

/**
 * Example of how a KNOWN BUG is managed in a regression suite.
 * problem_user intentionally shows the same image for every product.
 *
 * test.fail() means "we expect this to fail right now". The suite stays green,
 * the bug stays visible in the report, and if someone fixes the bug this test
 * will turn red, reminding us to remove test.fail().
 */
test.describe('Known bugs', { tag: '@known-bug' }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'problem user sees a unique image for each product',
    {
      tag: '@regression',
      annotation: { type: 'issue', description: 'BUG-101: all product images are identical for problem_user' },
    },
    async ({ loginPage, inventoryPage }) => {
      test.fail();
      await loginPage.goto();
      await loginPage.login(users.problem);

      const imageSources = await inventoryPage.items.locator('img').evaluateAll((imgs) =>
        imgs.map((img) => img.getAttribute('src')),
      );
      expect(new Set(imageSources).size).toBe(imageSources.length);
    },
  );
});
