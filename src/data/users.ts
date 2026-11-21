/**
 * Demo accounts published by the Practice Software Testing site.
 * They're public practice credentials, not real secrets. At a real company,
 * these would come from environment variables / CI secrets instead.
 */
export interface User {
  email: string;
  password: string;
  fullName: string;
}

export const users = {
  /** Used by the login-once setup, so most UI tests start logged in as Jane. */
  customer: { email: 'customer@practicesoftwaretesting.com', password: 'welcome01', fullName: 'Jane Doe' },
  /** Used by login tests and API tests, to spread activity across accounts. */
  customer2: { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01', fullName: 'Jack Howe' },
} satisfies Record<string, User>;

/**
 * For negative login tests we use an email that doesn't exist.
 * Repeated wrong passwords on a REAL account can lock it, which would
 * break other tests: a good example of tests needing to be designed carefully.
 */
export const unknownUser = { email: 'no-such-user@example.com', password: 'not-a-real-password' };
