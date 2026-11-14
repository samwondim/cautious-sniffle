/**
 * Formats a stored amount for people. Shared by the public confirmation
 * messages, the staff alert emails and the admin, so a gift reads the same
 * everywhere it appears.
 *
 * Birr has no widely supported symbol, so every currency is shown by its
 * ISO code ("ETB 5,000", "USD 250") rather than mixing "$250" with
 * "ETB 5,000" — consistent, and unambiguous between USD and other dollars.
 */
export function formatMoney(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  // Intl puts a non-breaking space after the code; keep it, so the code
  // never wraps away from its number.
  return formatted;
}
