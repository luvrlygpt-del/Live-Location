import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const SELF_URL = "https://live-location-z40f.onrender.com";

/* ================= CORS ================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* ================= TILE PROXY ================= */
app.get("/tile/:layer/:z/:x/:y.png", async (req, res) => {
  const { layer, z, x, y } = req.params;

  const allowedLayers = [
    "clouds",
    "precipitation",
    "snow",
    "temperature"
  ];

  if (!allowedLayers.includes(layer)) {
    return res.status(400).send("Invalid layer");
  }

  const tileURL = `https://maps.open-meteo.com/weather/${layer}/${z}/${x}/${y}.png`;

  try {
    const response = await fetch(tileURL);
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).send("Tile fetch failed");
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Weather tile proxy is running 🚀");
});

/* ================= AUTO PING ================= */
setInterval(async () => {
  try {
    await fetch(SELF_URL);
    console.log("🔁 Auto-ping OK");
  } catch {
    console.log("⚠️ Auto-ping failed");
  }
}, 1000 * 60 * 10); // 10 phút

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
