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

// Remove extreme outliers (top and bottom 10%)
prices.sort((a, b) => a - b);

const trimCount = Math.floor(prices.length * 0.1);
const trimmedPrices =
  prices.length > 10
    ? prices.slice(trimCount, prices.length - trimCount)
    : prices;

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

  /* =========================
     OUTLIER FILTER (NEW)
     Prevents extreme prices
  ========================= */

  const filtered = prices.filter(
    p => p > median * 0.5 && p < median * 2
  );

  const finalPrices =
    filtered.length >= 3 ? filtered : prices;

  /* =========================
     RANGE CALCULATION
  ========================= */

  const lowerIndex = Math.floor(finalPrices.length * 0.25);
  const upperIndex = Math.floor(finalPrices.length * 0.75);

  const lowRange = Math.round(finalPrices[lowerIndex]);
  const highRange = Math.round(finalPrices[upperIndex]);

  /* =========================
     RECENCY (14 DAYS)
  ========================= */

  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  const recentSoldCount = soldComps.filter(item => {
    if (!item.soldDate) return false;
    const soldTime = new Date(item.soldDate).getTime();
    return !isNaN(soldTime) && now - soldTime <= FOURTEEN_DAYS;
  }).length;

  /* =========================
     CONFIDENCE
  ========================= */

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