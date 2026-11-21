import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Where the logged-in browser state is saved by tests/setup/auth.setup.ts.
 * UI tests reuse it, so they don't log in through the UI every time.
 */
export const STORAGE_STATE = 'playwright/.auth/customer.json';

const isCI = !!process.env.CI;

/** UI tests and hybrid (API + UI) tests both need a browser. */
const BROWSER_TESTS = /(ui|hybrid)\/.*\.spec\.ts/;

export default defineConfig({
  testDir: './tests',

  // Every test is independent, so they can all run in parallel.
  fullyParallel: true,

  // Fail the CI build if someone accidentally leaves test.only in the code.
  forbidOnly: isCI,

  // Retries are a safety net in CI only. A test that passes only on retry
  // is reported as "flaky" and should be fixed (see docs/TEST-STRATEGY.md).
  retries: isCI ? 2 : 0,

  // A public practice site: be polite and don't hammer it with many workers.
  workers: isCI ? 2 : 3,

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: isCI
    ? [['blob'], ['github'], ['list']] // blob reports from shards are merged into one HTML report
    : [['html', { open: 'on-failure' }], ['list']],

  use: {
    baseURL: env.baseUrl,

    // Evidence for analyzing failures.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. Logs in once and saves the session for the browser projects.
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },

    // 2. UI + hybrid tests: Chromium on every PR; Firefox/WebKit in the nightly regression.
    {
      name: 'chromium',
      testMatch: BROWSER_TESTS,
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: BROWSER_TESTS,
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testMatch: BROWSER_TESTS,
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // 3. API tests: no browser, requests go straight to the API base URL.
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { baseURL: env.apiBaseUrl },
    },
  ],
});
