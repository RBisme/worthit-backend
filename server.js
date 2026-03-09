import express from "express";
import cors from "cors";
import { runValuation } from "./services/runValuation.js";
import { getEbayAccessToken } from "./services/ebayAuth.js";

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
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ status: "ERROR" });
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Worth-It backend running on port ${PORT}`);
});