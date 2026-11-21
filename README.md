# Playwright E-commerce Tests

A learning project that shows **how a real e-commerce test suite is built and managed** by an SDET: smoke tests, a regression suite, UI tests, API tests and **hybrid tests that use both**, page objects, fixtures, tags and CI pipelines in GitHub Actions.

**App under test:** [Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com), a public online tool store built for practicing test automation. Its **website and REST API belong to the same application**, like at a real company:

| Layer | URL | What we test |
|---|---|---|
| Website (UI) | https://practicesoftwaretesting.com | Login, catalog, search, sorting, cart, checkout |
| REST API | https://api.practicesoftwaretesting.com ([Swagger docs](https://api.practicesoftwaretesting.com/api/documentation)) | Products, search, auth tokens, protected endpoints, carts |

> The site publishes demo accounts for practice. All other test data in this project is synthetic.

---

## Quick start

```bash
npm install
npx playwright install        # downloads the browsers

npm run test:smoke            # fast smoke suite (UI on Chromium + API)
npm run test:regression       # full regression suite
npm run report                # open the last HTML report
```

| Command | What it does |
|---|---|
| `npm run test:api` | Only API tests (no browser) |
| `npm run test:ui` | Only UI tests |
| `npm run test:hybrid` | Only hybrid (API + UI) tests |
| `npm run test:headed` | Watch the browser tests run |
| `npm run test:debug` | Step through tests with the Playwright Inspector |
| `npm run list:smoke` | List the smoke tests without running them |
| `npm run list:regression` | List the regression tests |
| `npm run test:regression:all-browsers` | Regression on Chromium, Firefox and WebKit |
| `npx playwright test --grep @cart` | Only tests tagged `@cart` |
| `npx playwright test --grep @security` | Only security-related checks |

---

## The three kinds of tests

```
            ┌──────────────────────────────────────────┐
            │          Toolshop application            │
            │                                          │
 UI tests ─►│  Website  ──calls──►  REST API  ──► DB   │◄─ API tests
            │                                          │
            └──────────────────────────────────────────┘
                      ▲                    ▲
                      └──── hybrid tests ──┘
             (get data/setup from the API, check it in the UI)
```

| Type | Folder | Speed | What it's good for |
|---|---|---|---|
| **API** | `tests/api/` | Very fast, very stable | Business rules and data: prices, search, sorting, auth, carts |
| **UI** | `tests/ui/` | Slower | What the customer actually experiences: pages, forms, the checkout flow |
| **Hybrid** | `tests/hybrid/` (and the UI cart tests) | In between | Use the API for setup and expected data, then check the UI shows it correctly |

Example of the hybrid idea, from `tests/ui/cart.spec.ts`:

```ts
// 1. Get reliable test data from the API (id + current price)
const product = await api.findProductByName('Combination Pliers');

// 2. Use it in the UI
await productPage.goto(product.id);
await productPage.setQuantity(3);
await productPage.addToCart();

// 3. Check the UI calculated the total correctly against the API price
await cartPage.goto();
expect(await cartPage.getLinePrice('Combination Pliers')).toBe(roundMoney(product.price * 3));
```

No prices are hard-coded, so a price change on the site doesn't break the suite.

---

## Smoke vs. regression

| | **Smoke** | **Regression** |
|---|---|---|
| Question it answers | "Is the core of the store working at all?" | "Does *everything* still work?" |
| Size | 10 tests | 38 tests (includes all smoke tests) |
| When it runs | Every PR and every push to `main` | Nightly + on demand, across browsers |
| If it fails | The PR is blocked | Team triages the next morning; release is held |

Every smoke test is **also** tagged `@regression`. Smoke is a subset, not a separate set of tests:

```ts
test('logged-in customer can complete a purchase', { tag: ['@smoke', '@regression', '@e2e'] }, ...)
test('sort by name Z to A',                         { tag: '@regression' },                    ...)
```

---

## Project structure

```
playwright-ecommerce-tests/
├── .github/workflows/
│   ├── smoke.yml               # smoke on every PR / push to main
│   └── regression.yml          # nightly regression: sharded, merged report
├── src/
│   ├── config/env.ts           # BASE_URL / API_BASE_URL in one place
│   ├── api/ToolshopApi.ts      # API client: endpoints + token handling
│   ├── pages/                  # Page Object Model: one class per page
│   │   ├── BasePage.ts         #   shared nav bar (cart, user menu, sign out)
│   │   ├── LoginPage.ts  AccountPage.ts  HomePage.ts
│   │   ├── ProductPage.ts  CartPage.ts  CheckoutPage.ts
│   ├── fixtures/test.ts        # custom fixtures: api client + page objects
│   ├── data/                   # demo users, product names, synthetic address
│   └── utils/price.ts          # helpers ("$14.15" -> 14.15, money rounding)
├── tests/
│   ├── setup/auth.setup.ts     # logs in ONCE, saves the session for browser tests
│   ├── api/                    # products, auth, cart: no browser
│   ├── ui/                     # login, catalog, cart, checkout
│   └── hybrid/                 # UI must show the same data as the API
├── docs/
│   ├── TEST-STRATEGY.md        # HOW the suite is managed (read this!)
│   └── EXERCISES.md            # practice tasks
├── playwright.config.ts        # projects, retries, reporters, traces
└── package.json                # npm scripts for each suite
```

---

## Key techniques (and where to find them)

| Technique | Where | Why |
|---|---|---|
| Page Object Model + inheritance | `src/pages/` | Locators in one place; a UI change is fixed once |
| API client | `src/api/ToolshopApi.ts` | The API version of a page object |
| Custom fixtures | `src/fixtures/test.ts` | Tests ask for `api`, `homePage`, `cartPage`... and get fresh instances |
| Log in once (`storageState`) | `tests/setup/auth.setup.ts` | Browser tests start logged in, which is much faster |
| Token-based API auth | `tests/api/auth.api.spec.ts` | Log in → get `access_token` → send `Authorization: Bearer ...` |
| Security checks | `@security` tag | Protected endpoints and pages refuse access without login |
| Independent tests | every spec | Each test creates its own cart and state, so tests can run in parallel, retry or alone |
| Tags | `{ tag: '@smoke' }` | One codebase, several suites |
| Data-driven tests | `login.spec.ts`, `auth.api.spec.ts` | One test generated per row of data |
| `test.step` | `checkout.spec.ts` | One end-to-end test with readable steps in the report |
| `test.fixme` | `product-data.hybrid.spec.ts` | Placeholder for planned work, visible in the report |
| Avoiding flaky navigation | `addProducts()` in `cart.spec.ts` | Wait for the cart counter before leaving the page |
| Sharding + merged reports | `regression.yml` | Big suites run in parallel across machines |
| Traces, screenshots, video | `playwright.config.ts` | Evidence for analyzing failures |

---

## How to read a failure

1. Open the report: `npm run report` locally, or download the `smoke-report` / `regression-report` artifact from the GitHub Actions run.
2. Click the failed test and check the error, screenshot and **trace** (a timeline of every action, network call and page snapshot).
3. Classify it: product bug, test issue, environment problem or flaky test. See [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md#4-when-a-test-fails-triage).

> This suite runs against a **live public site** that can change or be slow. When a test fails, deciding *why* is part of the learning.

---

## Next steps

Work through [docs/EXERCISES.md](docs/EXERCISES.md). Each exercise adds something a real team would add to this suite.
