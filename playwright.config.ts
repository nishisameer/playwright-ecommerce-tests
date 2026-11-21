import { defineConfig, devices } from '@playwright/test';

/**
 * Where the logged-in browser state is saved by tests/setup/auth.setup.ts.
 * UI tests reuse it, so they don't log in through the UI every time.
 */
export const STORAGE_STATE = 'playwright/.auth/standard-user.json';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // Every test is independent, so they can all run in parallel.
  fullyParallel: true,

  // Fail the CI build if someone accidentally leaves test.only in the code.
  forbidOnly: isCI,

  // Retries are a safety net in CI only. A test that passes only on retry
  // is reported as "flaky" and should be fixed (see docs/TEST-STRATEGY.md).
  retries: isCI ? 2 : 0,

  workers: isCI ? 2 : undefined,

  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [['blob'], ['github'], ['list']] // blob reports from shards are merged into one HTML report
    : [['html', { open: 'on-failure' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',

    // SauceDemo uses data-test="..." attributes, so getByTestId() looks for those.
    testIdAttribute: 'data-test',

    // Evidence for analyzing failures.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. Logs in once and saves the session for the UI projects.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // 2. UI tests: Chromium runs on every PR; Firefox/WebKit run in the nightly regression.
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // 3. API tests: no browser needed, different base URL.
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: process.env.API_BASE_URL ?? 'https://automationexercise.com' },
    },
  ],
});
