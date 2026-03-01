import fetch from "node-fetch";

/**
 * Fetch recent SOLD comps from eBay Browse API
 * Returns { low, high, sampleSize } or null
 *
 * NOTE:
 * - Uses REST Browse API (correct for valuation)
 * - Requires EBAY_ACCESS_TOKEN (OAuth) in env
 * - Low friction: query-based for now
 */

export async function fetchEbaySoldComps(query) {
  const url =
    "https://api.ebay.com/buy/browse/v1/item_summary/search" +
    "?q=" + encodeURIComponent(query) +
    "&filter=soldItems" +
    "&limit=30";

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${process.env.EBAY_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("eBay error:", t);
    throw new Error("eBay Browse API failed");
  }

  const data = await res.json();

  const prices = (data.itemSummaries || [])
    .map(i => Number(i?.price?.value))
    .filter(v => Number.isFinite(v));

  if (prices.length === 0) return null;

  prices.sort((a, b) => a - b);

  const low = Math.round(prices[Math.floor(prices.length * 0.25)]);
  const high = Math.round(prices[Math.floor(prices.length * 0.75)]);

  return {
    low,
    high,
    sampleSize: prices.length,
  };
}
