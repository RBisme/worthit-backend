import 'dotenv/config';

import express from "express";
import cors from "cors";

import { runValuation } from "./services/runValuation.js";
import { getEbayAccessToken } from "./services/ebayAuth.js";
import { supabase } from "./services/supabase.js";
import { validatePlaySubscription } from "./services/playValidation.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Worth-It backend is live");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   VALUATION ENDPOINT
========================= */
app.post("/api/valuation", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      throw new Error("Missing title/description");
    }

    const ebayToken = await getEbayAccessToken();

    const result = await runValuation({
      title,
      description,
      ebayToken
    });

    res.json(result);

  } catch (err) {
    console.error("Valuation error:", err.message);
    res.status(500).json({ status: "ERROR" });
  }
});

/* =========================
   LISTING DRAFT ENDPOINT
========================= */
app.post("/api/listing-draft", async (req, res) => {
  try {
    const { title, value, description } = req.body;

    if (!title) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing title"
      });
    }

    const cleanTitle = String(title).trim();
    const formattedTitle =
      cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const draft = {
      status: "OK",
      suggestedTitle: formattedTitle,
      description: description || "",
      price: Number(value) || 0
    };

    res.json(draft);

  } catch (err) {
    console.error("Listing draft error:", err.message);
    res.status(500).json({ status: "ERROR" });
  }
});

/* =========================
   PLAY SUBSCRIPTION VALIDATION
========================= */
app.post("/api/validate-play-subscription", async (req, res) => {
  try {
    const { userId, productId, purchaseToken } = req.body;

    if (!userId || !productId || !purchaseToken) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing required fields"
      });
    }

    const result = await validatePlaySubscription({
      productId,
      purchaseToken
    });

    if (!result.valid) {
      return res.status(400).json({ status: "INVALID" });
    }

    const now = new Date();

    const { error } = await supabase
      .from("users")
      .update({
        tier: "pro",
        play_subscription_id: productId,
        subscription_period_start: now,
        subscription_period_end: result.expiry
      })
      .eq("id", userId);

    if (error) throw error;

    res.json({
      status: "OK",
      tier: "pro",
      subscription_period_end: result.expiry
    });

  } catch (err) {
    console.error("Subscription endpoint error:", err.message);
    res.status(500).json({ status: "ERROR" });
  }
});

/* =========================
   DAILY WIN ENDPOINT
========================= */
app.get("/api/daily-win", (req, res) => {

  const wins = [
    {
      title: "Vintage Pyrex Bowl",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pyrex_bowls.jpg",
      foundPrice: 3,
      valueLow: 80,
      valueHigh: 120,
      soldPrice: 97,
      quote: "Almost donated it!"
    },
    {
      title: "Milwaukee Impact Driver",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Milwaukee_impact_driver.jpg",
      foundPrice: 20,
      valueLow: 120,
      valueHigh: 180,
      soldPrice: 150,
      quote: "Found it at a garage sale!"
    },
    {
      title: "Vintage Baseball Glove",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Baseball_glove.jpg",
      foundPrice: 5,
      valueLow: 60,
      valueHigh: 110,
      soldPrice: 85,
      quote: "Almost threw it away!"
    }
  ];

  const randomWin = wins[Math.floor(Math.random() * wins.length)];

  res.json(randomWin);

});

    res.json(dailyWin);

  } catch (err) {
    console.error("Daily win error:", err.message);
    res.status(500).json({ status: "ERROR" });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Worth-It backend running on port ${PORT}`);
});