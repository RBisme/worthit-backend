import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { ebayGet } from "./services/ebayClient.js";
import { runValuation } from "./services/runValuation.js";

dotenv.config();

const ebayCache = new Map();
const EBAY_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.post("/api/valuation", async (req, res) => {
  try {
    const result = await runValuation(req.body);

    if (result.status === "NEEDS_MORE_INPUT") {
      return res.json({
        status: "NEEDS_MORE_INPUT",
        actions: ["ADD_PHOTOS", "ADD_DESCRIPTION"]
      });
    }

    return res.json({
      status: "OK",
      value: result.value
    });
  } catch (err) {
    console.error("Valuation error:", err);
    res.status(500).json({ status: "ERROR" });
  }
});


/**
async function fetchEbaySoldComps(query) {
  const cacheKey = query.toLowerCase().trim();
  const cached = ebayCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < EBAY_CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await ebayGet("/item_summary/search", {
      q: query,
      filter: "soldItems",
      limit: 30
    });

    ebayCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (err) {
    // graceful degrade
    if (cached) {
      console.warn("EBAY DOWN — USING CACHED COMPS");
      return cached.data;
    }

    console.warn("EBAY DOWN — NO CACHE AVAILABLE");
    return null; // downstream AI already handles this
  }
}

,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("eBay API error:", text);
    throw new Error("eBay Browse API failed");
  }

  const data = await res.json();

  const prices = (data.itemSummaries || [])
    .map((i) => Number(i?.price?.value))
    .filter((v) => Number.isFinite(v));

  if (prices.length === 0) return null;

  prices.sort((a, b) => a - b);

  return {
    low: Math.round(prices[Math.floor(prices.length * 0.25)]),
    high: Math.round(prices[Math.floor(prices.length * 0.75)]),
    sampleSize: prices.length,
  };
}

/**
 * Valuation endpoint
 */
app.post("/api/valuate", async (req, res) => {
  try {
    const { titleHint } = req.body;

    if (!titleHint) {
      return res.status(400).json({ error: "Missing title hint" });
    }

    const result = await fetchEbaySoldComps(titleHint);

 if (!result) {
  return res.status(422).json({
    error: "NO_COMPARABLE_SALES"
  });
}


    res.json({
      source: "ebay_sold",
      low: result.low,
      high: result.high,
      sampleSize: result.sampleSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Valuation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Worth-It backend running on port ${PORT}`);
});

// LISTING ROUTE (INTENTIONAL INTEGRATION)
import listingRouter from './routes/listing/index.js';

app.use('/api/listing', listingRouter);

