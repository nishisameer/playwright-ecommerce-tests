/**
 * One place for environment settings. Tests never hard-code URLs,
 * so the same suite can run against another environment (e.g. staging):
 *
 *   BASE_URL=https://staging.example.com API_BASE_URL=https://api.staging.example.com npm run test:smoke
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
};
