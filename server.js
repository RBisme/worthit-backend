import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Worth-It backend alive");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Worth-It backend running on port ${PORT}`);
});
