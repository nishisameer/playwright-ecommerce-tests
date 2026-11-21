/** "$14.15" or "14.15" -> 14.15 */
export function parsePrice(text: string | null): number {
  const match = (text ?? '').replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`Could not find a price in "${text}"`);
  return Number(match[1]);
}

/** Rounds to cents, the way money should be compared. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Escapes text so it can be used inside a RegExp. */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Matches an element whose whole text is exactly `text` (ignoring spaces around it). */
export function exactText(text: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`);
}
