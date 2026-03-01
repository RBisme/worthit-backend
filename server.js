import 'dotenv/config';

import express from "express";
import cors from "cors";
import { runValuation } from "./services/runValuation.js";
import { getEbayAccessToken } from "./services/ebayAuth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send("Worth-It backend is live");
});
/* =========================
   VALUATION ENDPOINT
========================= */
app.post("/api/valuation", async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log("Incoming:", { title, description });

    if (!title && !description) {
      console.log("Rejected: missing both fields");
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
      return res.status(400).json({ status: "ERROR", message: "Missing title" });
    }

    const cleanTitle = String(title).trim();

    const formattedTitle =
      cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const price = Number(value) || 0;

    const draft = {
      status: "OK",
      suggestedTitle: formattedTitle,
      description: description || "",
      price: price
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