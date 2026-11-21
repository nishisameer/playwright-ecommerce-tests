# Playwright E-commerce Tests

A learning project that shows **how a real e-commerce test suite is built and managed**: smoke tests, a regression suite, page objects, fixtures, API tests, tags, and CI pipelines in GitHub Actions.

- **UI tests** run against [SauceDemo](https://www.saucedemo.com), a public practice store (login, products, cart, checkout).
- **API tests** run against the [AutomationExercise](https://automationexercise.com/api_list) practice API.

> Both are public practice sites built for test automation. All test data in this project is synthetic.

---

## Quick start

```bash
npm install
npx playwright install        # downloads the browsers

npm run test:smoke            # fast smoke suite (Chromium + API)
npm run test:regression       # full regression suite (Chromium + API)
npm run report                # open the last HTML report
```

Other useful commands:

| Command | What it does |
|---|---|
| `npm run test:headed` | Watch the UI tests run in a visible browser |
| `npm run test:debug` | Step through tests with the Playwright Inspector |
| `npm run test:api` | Only the API tests |
| `npm run list:smoke` | List which tests are in the smoke suite (without running them) |
| `npm run list:regression` | List which tests are in the regression suite |
| `npm run test:regression:all-browsers` | Regression on Chromium, Firefox and WebKit |
| `npx playwright test --grep @cart` | Only tests tagged `@cart` |
| `npx playwright test --grep-invert @known-bug` | Everything except known-bug tests |

---

## Smoke vs. regression: the core idea

| | **Smoke** | **Regression** |
|---|---|---|
| Question it answers | "Is the core of the site working at all?" | "Does *everything* still work?" |
| Size | Small (~6 tests) | Everything (~35+ tests) |
| Speed | A few minutes | Longer, so it's sharded across machines |
| When it runs | Every PR and every push to `main` | Nightly + on demand, across browsers |
| If it fails | PR is blocked | Team triages the next morning, release is held |

Every smoke test is **also** tagged `@regression`. Smoke is a subset of regression, not a separate set of tests.

```ts
test('customer can complete a purchase', { tag: ['@smoke', '@regression'] }, async (...) => { ... });
test('sort by price high to low',       { tag: '@regression' },              async (...) => { ... });
```

---

## Project structure

```
playwright-ecommerce-tests/
├── .github/workflows/
│   ├── smoke.yml              # runs smoke on every PR / push
│   └── regression.yml         # nightly regression, sharded, merged report
├── src/
│   ├── pages/                 # Page Object Model: one class per page
│   │   ├── BasePage.ts        #   shared header (cart, menu, logout)
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailsPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── api/ProductsApi.ts     # small API client used by API tests
│   ├── fixtures/test.ts       # custom fixtures: tests receive page objects ready to use
│   ├── data/                  # test data in one place (users, products, synthetic customers)
│   └── utils/price.ts         # helpers (parse "$29.99" -> 29.99)
├── tests/
│   ├── setup/auth.setup.ts    # logs in ONCE, saves the session for all UI tests
│   ├── ui/
│   │   ├── login.spec.ts
│   │   ├── inventory.spec.ts  # includes a "known bug" example with test.fail()
│   │   ├── cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   └── e2e-purchase.spec.ts
│   └── api/products.api.spec.ts
├── docs/
│   ├── TEST-STRATEGY.md       # HOW the suite is managed (read this!)
│   └── EXERCISES.md           # practice tasks to learn by extending the suite
├── playwright.config.ts       # projects, retries, reporters, trace settings
└── package.json               # npm scripts for each suite
```

---

## Key techniques used (and where to find them)

| Technique | Where | Why |
|---|---|---|
| Page Object Model | `src/pages/` | Locators live in one place; a UI change is fixed once |
| Inheritance | `BasePage` → other pages | Shared header code isn't repeated |
| Custom fixtures | `src/fixtures/test.ts` | Tests ask for `inventoryPage`, `cartPage`... and get fresh instances |
| Login once with `storageState` | `tests/setup/auth.setup.ts` | UI tests start logged in, which is much faster |
| Independent tests | every spec | Each test sets up its own state, so tests can run in parallel, on retry, alone |
| Tags | `{ tag: '@smoke' }` | One codebase, several suites |
| Data-driven tests | `login.spec.ts`, `checkout.spec.ts` | One test generated per row of data |
| `test.step` | `e2e-purchase.spec.ts` | One end-to-end test with readable steps in the report |
| Known bug with `test.fail()` | `inventory.spec.ts` | Bug stays visible without turning the suite red |
| `test.slow()` | `login.spec.ts` | Longer timeout only where it's genuinely needed |
| `getByTestId` with `data-test` | `playwright.config.ts` | Stable locators that don't break on styling changes |
| API client | `src/api/ProductsApi.ts` | Hides API quirks so tests stay readable |
| Sharding + merged reports | `regression.yml` | Big suites run in parallel across machines |
| Traces, screenshots, video on failure | `playwright.config.ts` | Evidence for analyzing failures |

---

## How to read a failure

1. Open the report: `npm run report` locally, or download the `smoke-report` / `regression-report` artifact from the GitHub Actions run.
2. Click the failed test, then check the error, the screenshot and the **trace** (a full timeline of every action, network call and DOM snapshot).
3. Decide what it is: product bug, test issue, environment problem, or flaky test. See [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md#4-when-a-test-fails-triage).

---

## Next steps

Work through [docs/EXERCISES.md](docs/EXERCISES.md). Each exercise adds something a real team would add to this suite.
