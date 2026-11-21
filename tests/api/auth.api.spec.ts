import { test, expect } from '../../src/fixtures/test';
import { users, unknownUser } from '../../src/data/users';

test.describe('Auth API', { tag: '@api' }, () => {
  test('login with valid credentials returns an access token', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
    const response = await api.loginRaw(users.customer2.email, users.customer2.password);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toEqual(expect.any(String));
  });

  test('login with an unknown user is rejected', { tag: '@regression' }, async ({ api }) => {
    const response = await api.loginRaw(unknownUser.email, unknownUser.password);
    expect(response.status()).toBe(401);
  });

  test('GET /users/me returns the logged-in user', { tag: '@regression' }, async ({ api }) => {
    const token = await api.login(users.customer2.email, users.customer2.password);

    const response = await api.getMe(token);
    expect(response.status()).toBe(200);
    expect((await response.json()).email).toBe(users.customer2.email);
  });

  // Data-driven: the same security check for every protected endpoint.
  const protectedEndpoints = [
    { name: 'GET /users/me', call: 'getMe' },
    { name: 'GET /invoices', call: 'getInvoices' },
  ] as const;

  for (const endpoint of protectedEndpoints) {
    test(`${endpoint.name} without a token returns 401`, { tag: ['@regression', '@security'] }, async ({ api }) => {
      const response = await api[endpoint.call]();
      expect(response.status()).toBe(401);
    });
  }

  test('GET /invoices with a token returns the customer invoices', { tag: '@regression' }, async ({ api }) => {
    const token = await api.login(users.customer2.email, users.customer2.password);

    const response = await api.getInvoices(token);
    expect(response.status()).toBe(200);
  });
});
