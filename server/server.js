const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;
const currencyCodes = [
  "AED", "AUD", "BDT", "BRL", "CAD", "CHF", "CNY", "DKK", "EGP", "EUR",
  "GBP", "HKD", "IDR", "ILS", "JPY", "KRW", "LKR", "MYR", "NOK", "NZD",
  "PHP", "PKR", "QAR", "RUB", "SAR", "SEK", "SGD", "THB", "TRY", "USD",
  "VND", "ZAR"
];

app.get("/api/exchange-rates", async (req, res) => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR", {
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Rates provider returned ${response.status}`);

    const data = await response.json();
    const rates = Object.fromEntries(currencyCodes.map((code) => {
      const foreignPerInr = Number(data.rates?.[code]);
      const inrPerUnit = foreignPerInr > 0 ? 1 / foreignPerInr : null;
      return [code, inrPerUnit !== null ? Number(inrPerUnit.toFixed(8)) : null];
    }));

    res.set("Cache-Control", "no-store");
    res.json({ rates, updatedAt: data.time_last_update_utc || new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ error: "Live exchange rates are temporarily unavailable." });
  }
});

// Serve static files (HTML, CSS, JS) from the main folder
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
