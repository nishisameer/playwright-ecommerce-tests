/**
 * Test users provided by the SauceDemo practice site.
 * These are public demo credentials, not real secrets. In a real company,
 * passwords would come from environment variables / CI secrets instead.
 */
export const PASSWORD = 'secret_sauce';

export const users = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user', // the site intentionally has bugs for this user
  performanceGlitch: 'performance_glitch_user', // login is intentionally slow
} as const;
