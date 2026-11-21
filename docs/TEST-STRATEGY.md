# Test Strategy: how this suite is managed

This document is the "rules of the road" for the suite. On a real team, a doc like this is how everyone agrees on what goes where, when things run, and what to do when something fails.

---

## 1. Suites and tags

We keep **one codebase** and use **tags** to build different suites from it.

| Tag | Meaning | Rule of thumb |
|---|---|---|
| `@smoke` | Critical paths. If one fails, the site is basically broken. | Keep it small and fast: login, product list, add to cart, purchase, key APIs |
| `@regression` | Everything we expect to keep working | **Every** test gets this tag, including smoke tests |
| `@login`, `@catalog`, `@cart`, `@checkout`, `@e2e` | Feature area | Lets you run just one area: `--grep @cart` |
| `@api`, `@hybrid` | Test type | API-only tests, or tests that combine API and UI |
| `@security` | Access-control checks | Protected pages/endpoints refuse access without login |
| `@known-bug` | Test documents a bug that isn't fixed yet | Uses `test.fail()` plus an `issue` annotation (see section 6) |

### What belongs in smoke?

Ask: **"If this breaks, would we stop a release or wake someone up?"**

- ✅ Customer can log in (UI) and get a token (API)
- ✅ Products load and search works
- ✅ Customer can add to cart and complete a purchase
- ✅ Product list, search and cart APIs respond
- ❌ Sorting Z to A (important, but not "site is down")
- ❌ Each validation message (covered by regression)
- ❌ Hybrid data checks (valuable, but slower; they run nightly)

### Which layer should a test live in?

Push each check to the **lowest layer that can catch the bug**:

| Check | Best layer | Why |
|---|---|---|
| Search returns the right products | API | Fast, no browser needed |
| Sorting order is correct | API (plus one UI check) | Logic lives in the backend |
| Unauthorized requests are refused | API | Direct and reliable |
| Cart total shown to the customer is right | Hybrid | Expected price from API, displayed total from UI |
| Customer can complete checkout | UI | Only the browser shows the real customer journey |

Smoke should stay under about 5 minutes. If it grows, move tests to regression-only.

---

## 2. When each suite runs

| Trigger | Suite | Browsers | Workflow |
|---|---|---|---|
| Pull request to `main` | Smoke | Chromium + API | `smoke.yml` |
| Push / merge to `main` | Smoke | Chromium + API | `smoke.yml` |
| Every night (08:00 UTC) | Full regression | Chromium + API (sharded ×3) | `regression.yml` |
| Manual ("Run workflow") | Full regression | Your choice: Chromium, Firefox or WebKit | `regression.yml` |
| Locally, before pushing | Whatever you changed, then smoke | Chromium | `npm run test:smoke` |

**Quality gate:** make the `smoke` job a **required status check** (GitHub → Settings → Branches → Branch protection rule for `main` → "Require status checks to pass"). Then a PR with failing smoke tests can't be merged.

---

## 3. Rules for writing tests

1. **Every test is independent.** It creates its own state (cart items, form data) in the test or in `beforeEach`. Never rely on another test having run first. No shared `let` variables passed between tests.
2. **Use page objects.** No raw locators inside spec files. If a locator is needed, add it to the page class.
3. **Locator priority:** `getByRole` / `getByLabel` → `getByTestId` → CSS. Never XPath based on layout.
4. **No fixed waits.** Never `page.waitForTimeout()`. Use web-first assertions (`await expect(locator).toBeVisible()`), which retry automatically, or `expect.poll` for async processes.
5. **Every test asserts something meaningful.** Clicking through a flow without checking the result isn't a test.
6. **Synthetic data only.** Never real customer names, emails, addresses or card numbers, in tests or in AI tools.
7. **Tag every test.** At least `@regression` and a feature-area tag. Add `@smoke` only if it passes the smoke rule above.
8. **One behavior per test.** The test name should say what is being checked: `remove product from the cart page`, not `test cart 3`.

### Checklist for adding a new test

- [ ] Placed in the right spec file (or a new one in `tests/ui/` or `tests/api/`)
- [ ] Uses fixtures and page objects; new locators added to the page class
- [ ] Independent: passes when run alone (`npx playwright test -g "test name"`)
- [ ] Passes several times in a row (`--repeat-each=5`) to catch flakiness early
- [ ] Tagged (`@regression` + area, and `@smoke` only if critical)
- [ ] Test data comes from `src/data/`, not hard-coded values scattered in the test

---

## 4. When a test fails: triage

**Step 1: look at the pattern.**
- Many tests failed at once → probably the **environment** (site down, deploy broken, login service failing).
- Every test in one area failed → probably a **real change** in that feature.
- A single test failed → check if it's new or a known flaky test.

**Step 2: open the evidence.** In the HTML report: error message, screenshot, video and **trace** (`trace: 'on-first-retry'` in the config means a trace is recorded whenever a test is retried in CI).

**Step 3: classify it.**

| Type | Signs | Action |
|---|---|---|
| **Product bug** | Reproduces every time; matches a recent code change | Log a bug with the trace/screenshot attached; hold the release; add `test.fail()` + issue annotation only if the fix will take a while |
| **Test issue** | Locator or expected text changed on purpose | Fix the test (usually the page object) |
| **Environment / data** | Timeouts, 5xx errors, site down | Re-run after it's fixed; notify whoever owns the environment |
| **Flaky** | Passes on retry ("flaky" in the report) | See section 5 |

**Step 4: close the loop.** Post the status to the team. If a real bug escaped to production, add a regression test for it.

---

## 5. Flaky tests

A flaky test passes and fails without any code change. It's dangerous because people stop trusting the suite.

- CI retries failed tests up to 2 times (`retries` in `playwright.config.ts`). A test that passes only on retry is marked **flaky** in the report.
- Retries are a **safety net, not a fix**. Every flaky test gets a ticket.
- Common causes: fixed waits, tests sharing data, checking a result before an async process finishes, animations, test order dependencies.
- If a flaky test can't be fixed quickly, quarantine it with `test.fixme()` and a ticket number, so it stops blocking others. Then fix it.
- Check for flakiness before merging new tests: `npx playwright test -g "my new test" --repeat-each=10`.

---

## 6. Known bugs

When a real bug is confirmed but won't be fixed right away:

```ts
test('cart total includes all items', {
  tag: ['@regression', '@known-bug'],
  annotation: { type: 'issue', description: 'BUG-101: cart total ignores the second item' },
}, async ({ ... }) => {
  test.fail(); // we EXPECT this to fail until BUG-101 is fixed
  ...
});
```

Related: `test.fixme()` marks a test as **not runnable yet** (planned work, or quarantined because it's flaky). It's skipped, but it still shows up in the report so nobody forgets it. See the placeholder in `tests/hybrid/product-data.hybrid.spec.ts`.

- The suite stays green, and the bug stays visible in the report with its ticket number.
- When the bug is fixed, the test unexpectedly **passes**, so Playwright marks it red. That reminds us to remove `test.fail()`.
- Tag with `@known-bug` so these are easy to find and review.

---

## 7. Test data

- **Expected data comes from the API at test time** (product ids and prices), not hard-coded values. `src/data/` only keeps stable things like product names.
- **Accounts:** the site's published demo accounts (`src/data/users.ts`). Most browser tests reuse the login session of `customer`; login and API tests use `customer2`, to spread activity.
- **Negative login tests use an email that doesn't exist.** Repeated wrong passwords on a real account could lock it and break every other test.
- **Each test creates its own cart**, so parallel tests never collide.
- Addresses and other personal data are synthetic and obviously fake (`100 Test Street`, postal code `00000`, `example.com` emails).
- **Be polite to shared environments.** This is a public site, so we keep workers low and avoid large data volumes. On a real team, tests run against a dedicated test or staging environment.

---

## 8. Reporting

- **Locally:** HTML report opens automatically on failure (`npm run report` to reopen).
- **Smoke in CI:** HTML report uploaded as the `smoke-report` artifact; failures also show inline on the PR (GitHub reporter).
- **Regression in CI:** each shard produces a blob report; the `merge-reports` job combines them into one `regression-report` artifact.
- Reports are kept for 14 days.

---

## 9. Ownership and maintenance

- QA owns the test code, tags, quality gates and triage. Developers own fixing product bugs and are welcome to add tests.
- Review the `@known-bug` and `test.fixme()` lists every sprint. Old ones should be fixed or deleted.
- When the UI changes, update the **page object**, not every test.
- Keep dependencies current (`@playwright/test`), and run the full regression after upgrading.
