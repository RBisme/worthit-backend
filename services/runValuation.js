import { getSoldCompsPipeline } from './ebaySoldComps.js';

export async function runValuation({ title, description, ebayToken }) {
  const soldComps = await getSoldCompsPipeline(title, description, ebayToken);

  if (!soldComps || soldComps.length === 0) {
    return {
      status: 'OK',
      value: 0,
      soldCount: 0,
      lowRange: 0,
      highRange: 0,
      recentSoldCount: 0,
      confidenceLevel: 0
    };
  }

  const prices = soldComps
    .map(item => parseFloat(item.price))
    .filter(price => !isNaN(price));

  if (prices.length === 0) {
    return {
      status: 'OK',
      value: 0,
      soldCount: 0,
      lowRange: 0,
      highRange: 0,
      recentSoldCount: 0,
      confidenceLevel: 0
    };
  }

  prices.sort((a, b) => a - b);

  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 !== 0
      ? prices[mid]
      : (prices[mid - 1] + prices[mid]) / 2;

  const soldCount = prices.length;
  // Trimmed range using 25th–75th percentile
  // Tight core band (40%–60%)
  const lowerIndex = Math.floor(prices.length * 0.4);
  const upperIndex = Math.floor(prices.length * 0.6);

  const lowRange = Math.round(prices[lowerIndex]);
  const highRange = Math.round(prices[upperIndex]);

  // Recency (14 days)
  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  const recentSoldCount = soldComps.filter(item => {
    if (!item.soldDate) return false;
    const soldTime = new Date(item.soldDate).getTime();
    return !isNaN(soldTime) && now - soldTime <= FOURTEEN_DAYS;
  }).length;

  // Confidence scale (0–3)
  let confidenceLevel = 0;

  if (soldCount >= 5) confidenceLevel = 1;
  if (soldCount >= 11) confidenceLevel = 2;
  if (soldCount > 20 && recentSoldCount >= 3) confidenceLevel = 3;

  return {
    status: 'OK',
    value: Math.round(median),
    soldCount,
    lowRange,
    highRange,
    recentSoldCount,
    confidenceLevel
  };
}