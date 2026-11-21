/**
 * Product catalog used by the tests. Keeping expected data in one place means
 * a price change is fixed here once, not in every test.
 */
export interface Product {
  name: string;
  slug: string; // used in data-test ids, e.g. add-to-cart-sauce-labs-backpack
  price: number;
}

export const products = {
  backpack: { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', slug: 'sauce-labs-bolt-t-shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', slug: 'sauce-labs-fleece-jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', slug: 'sauce-labs-onesie', price: 7.99 },
} satisfies Record<string, Product>;

export const TOTAL_PRODUCT_COUNT = 6;

/** SauceDemo charges 8% tax on the item total. */
export const TAX_RATE = 0.08;
