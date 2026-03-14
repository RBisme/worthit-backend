import 'dotenv/config';
import express from "express";
import cors from "cors";
import { runValuation } from "./services/runValuation.js";
import { getEbayAccessToken } from "./services/ebayAuth.js";
import { identifyItem } from "./services/identifyItem.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Worth-It backend alive");
});

/* =========================
   VALUATION ENDPOINT
========================= */

app.post("/api/valuation", async (req, res) => {
  try {

    const { title, description, imageBase64 } = req.body || {};

    /* =========================
       STRUCTURAL GUARDRAIL
       Ensures valuation never crashes
    ========================= */

    if (!title || typeof title !== "string") {
      return res.json({
        status: "OK",
        value: 0,
        soldCount: 0,
        lowRange: 0,
        highRange: 0,
        recentSoldCount: 0,
        confidenceLevel: 0
      });
    }

    // Run identifier
    let identified;
    try {
      identified = await identifyItem(title, imageBase64);
    } catch (e) {
      console.log("Identifier fallback:", e.message);
      identified = { itemName: title };
    }

    const cleanTitle = identified.itemName || title;

    const ebayToken = await getEbayAccessToken();

    const result = await runValuation({
      title: cleanTitle,
      description,
      ebayToken
    });

    res.json(result);

  } catch (err) {
    console.error("Valuation error:", err.message);

    /* =========================
       SAFE FALLBACK RESPONSE
    ========================= */

    res.json({
      status: "OK",
      value: 0,
      soldCount: 0,
      lowRange: 0,
      highRange: 0,
      recentSoldCount: 0,
      confidenceLevel: 0
    });
  }
});

/* =========================
   LISTING DRAFT ENDPOINT
========================= */

app.post("/api/listing-draft", async (req, res) => {
  try {
    const { title, value } = req.body;

    if (!title) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing title"
      });
    }

    const cleanTitle = String(title).trim();
    const formattedTitle =
      cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const price = Math.round(Number(value) || 0);

    const description = `Pre-owned ${formattedTitle} 

See photos for condition and details.

Estimated resale value based on recent sold comps.`;

    const draft = {
      status: "OK",
      suggestedTitle: formattedTitle,
      description,
      price
    };

    res.json(draft);

  } catch (err) {
    console.error("Listing draft error:", err.message);
    res.status(500).json({ status: "ERROR" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Worth-It backend running on port ${PORT}`);
});