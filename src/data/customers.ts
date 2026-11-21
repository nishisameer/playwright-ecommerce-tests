/**
 * Synthetic customer data. Obviously fake on purpose:
 * never use real customer names, addresses or payment details in tests.
 */
export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const validCustomer: Customer = {
  firstName: 'Test',
  lastName: 'Customer',
  postalCode: '00000',
};

/** Builds a unique customer so parallel tests never collide on data. */
export function uniqueCustomer(): Customer {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { firstName: `Test${id}`, lastName: 'Customer', postalCode: '00000' };
}
