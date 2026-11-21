/**
 * Product names used by the tests. We keep only NAMES here, not prices:
 * prices are read from the API at test time (see tests/hybrid), so a price
 * change on the site doesn't break the suite.
 */
export const productNames = {
  combinationPliers: 'Combination Pliers',
  boltCutters: 'Bolt Cutters',
} as const;

/** A search term that matches several products. */
export const SEARCH_TERM = 'pliers';

/** A search term that should match nothing. */
export const NO_RESULTS_TERM = 'zzz-no-such-product';
