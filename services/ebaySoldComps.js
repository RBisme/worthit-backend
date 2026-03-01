import fetch from 'node-fetch';
import { getEbayAccessToken } from './ebayAuth.js';

// ---- Simple in-memory cache ----
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map();

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---- eBay fetch SOLD listings ----
export async function fetchSoldComps(query) {
  const cacheKey = query.toLowerCase().trim();
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const token = await getEbayAccessToken();

  const url =
    'https://api.ebay.com/buy/browse/v1/item_summary/search' +
    '?q=' + encodeURIComponent(query) +
    '&filter=soldItems:true' +
    '&limit=20';

  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error('eBay API error ' + response.status + ': ' + text);
  }

  const data = await response.json();
  const results = data.itemSummaries || [];

  setCache(cacheKey, results);
  return results;
}

// ---- Clean price extraction ----
export async function getSoldCompsPipeline(title, description) {
  const query = (title + ' ' + description).trim();

  if (!query) return [];

  const items = await fetchSoldComps(query);

 return items
  .filter(item => item.price && item.price.value)
  .map(item => ({
    price: Number(item.price.value),
    soldDate: item.itemEndDate || item.itemEndDateTime || null
  }));
}
