# Practice exercises

Each exercise is something a real team would add to this suite. Try them in order. Create a branch for each one (`git checkout -b exercise-1`), open a pull request, and watch the smoke workflow run on it.

---

### 1. Explore the app first (like a real SDET)
- Click through https://practicesoftwaretesting.com: search, filter, add to cart, check out (log in with `customer@practicesoftwaretesting.com` / `welcome01`).
- Open the Swagger docs at https://api.practicesoftwaretesting.com/api/documentation and try `GET /products` with **Try it out**.
- Open the browser DevTools **Network** tab while using the site. Which API calls does the website make when you search? This is how you discover what to test at the API layer.

### 2. Run and read the suites
- Run `npm run list:smoke` and `npm run list:regression`. Why is smoke smaller?
- Run `npm run test:headed` and watch the browser.
- Break a test on purpose (change `'My account'` to `'My acount'` in `login.spec.ts`), run it, and open the report and trace. Then undo the change.

### 3. API test: sort by price descending
In `products.api.spec.ts`, add a test for `sort: 'price,desc'`. Tag it `@regression` only.

### 4. API test: products by brand
`GET /brands` returns brands with ids. Write a test that takes the first brand, calls `GET /products?by_brand=<id>`, and checks every product returned has that brand. Add any new method to `ToolshopApi`.

### 5. UI test: category filter
On the home page, the left sidebar filters by category. Add a locator to `HomePage`, filter by one category, and check the results. Then make it **hybrid**: compare the UI results with `GET /products?by_category=<id>`.

### 6. Make a flaky test stable
Run `npx playwright test tests/ui/cart.spec.ts --repeat-each=5`. Read the `addProducts()` helper and explain in your own words why it waits for the cart counter before navigating. What would happen without that wait?

### 7. Finish the hybrid order test
In `tests/hybrid/product-data.hybrid.spec.ts`, replace the `test.fixme` placeholder:
1. Place an order through the UI (reuse the steps from `checkout.spec.ts`).
2. Read the invoice number from the confirmation message.
3. Log in through the API and check `GET /invoices` contains that invoice number.

### 8. Is it smoke or regression?
Decide `@smoke` or `@regression` only for each, and explain why:
- Product page shows the same price as the API
- Customer can sign out
- `GET /invoices` without a token returns 401
- Search returns matching products

### 9. Cross-browser run and branch protection
- Trigger **Regression Tests** manually from the Actions tab and choose `firefox`. Download the merged report artifact.
- Add a branch protection rule for `main` that requires the **smoke** check. Open a PR with a deliberately failing smoke test and confirm it can't be merged.

### 10. Interview practice
Explain out loud, in under 2 minutes:
- Why some checks are API tests, some are UI tests, and some are hybrid
- What happens from "developer opens a PR" to "tests pass or fail"
- How you'd triage a regression run where 8 tests failed overnight against a live site
