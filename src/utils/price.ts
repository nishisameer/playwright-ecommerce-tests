/** "$29.99" or "Item total: $29.99" -> 29.99 */
export function parsePrice(text: string | null): number {
  const match = (text ?? '').match(/\$?(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`Could not find a price in "${text}"`);
  return Number(match[1]);
}

/** Rounds to cents, the way money should be compared. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
