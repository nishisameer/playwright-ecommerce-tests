# Practice exercises

Each exercise is something a real team would add to this suite. Try them in order. Create a branch for each one (`git checkout -b exercise-1`), open a pull request, and watch the smoke workflow run on it.

---

### 1. Run and explore (warm-up)
- Run `npm run list:smoke` and `npm run list:regression`. How many tests are in each, and why is smoke smaller?
- Run `npm run test:headed` and watch the browser.
- Break a test on purpose (change `'Products'` to `'Product'` in `inventory.spec.ts`), run it, and open the report and trace. Then undo the change.

### 2. Add a regression test
Add a test to `inventory.spec.ts`: **sort by name A to Z** (`'az'`). Tag it `@regression` only. Run it with `--repeat-each=5`.

### 3. Add a locator to a page object
The checkout overview page shows each item's quantity (`data-test="item-quantity"`). Add a `itemQuantities` locator to `CheckoutPage` and write a test that checks both items show quantity `1`.

### 4. Data-driven test
In `cart.spec.ts`, write a loop that generates one test per product in `src/data/products.ts`: add that product, open the cart, and check the name and price.

### 5. Is it smoke or regression?
For each of these, decide `@smoke` or `@regression` only, and explain why:
- Product details page shows the right price
- User can log out
- Checkout shows an error for a missing postal code
- Product API returns products

### 6. Manage a known bug
Log in as `problem_user` and try sorting by price. Write a test that documents the bug using `test.fail()`, an `issue` annotation and the `@known-bug` tag.

### 7. API test
Add a test for `GET /api/brandsList` that checks every brand has an `id` (number) and a `brand` (string). Add the request method to `ProductsApi` if needed.

### 8. Make CI cross-browser
Trigger the **Regression Tests** workflow manually from the Actions tab and choose `firefox`. Download the merged report artifact. Did anything behave differently?

### 9. Branch protection (quality gate)
In your GitHub repo settings, add a branch protection rule for `main` that requires the **smoke** check to pass. Open a PR with a deliberately failing smoke test and confirm it can't be merged.

### 10. Interview practice
Explain out loud, in under 2 minutes:
- How this suite decides what's smoke vs. regression
- What happens from "developer opens a PR" to "tests pass or fail"
- How you'd triage a regression run where 12 tests failed overnight
