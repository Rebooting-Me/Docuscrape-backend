import express from "express";
import cors from "cors";
import scrapeDocumentation from "./scrape.js";

const port = 3000; // !! DO NOT CHANGE THE PORT !!

const app = express();

app.use(cors());

app.use(express.json());

app.post("/scrape", async (req, res) => {
  console.log(req.body);
  const { firstUrl } = req.body;
  if (!firstUrl) {
    return res.status(400).json({ message: "Oi! Can't find the first URL!" });
  }
  const scrapedContent = await scrapeDocumentation(firstUrl);
  res.json({ content: scrapedContent, message: "Success!" });
});

app.listen(port, () => {
  console.log(`Server running on port 3000`);
});