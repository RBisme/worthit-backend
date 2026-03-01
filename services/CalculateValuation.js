/**
 * Calculate valuation from sold comps.
 * Input: array of comps with sold_price_usd
 * Output: single numeric valuation
 */
export function calculateValuation(comps) {
  if (!comps || comps.length === 0) return null;

  // sort by price
  const prices = comps
    .map(c => Number(c.price?.value))

    .filter(p => typeof p === 'number' && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  // median is safest default
  const mid = Math.floor(prices.length / 2);

  return prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];
}
