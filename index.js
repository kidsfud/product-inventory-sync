require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { updateWooCommerceInventory } = require("./woocommerce-api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// 🧠 In-memory cache to track last updated stock
const lastUpdatedStock = new Map();

// 🔥 Shopify Product Update Webhook Handler
app.post("/shopify/product-update-webhook", async (req, res) => {
  const { id: shopifyProductId, variants } = req.body;

  if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).send("Invalid product payload");
  }

  const { inventory_quantity } = variants[0];

  if (inventory_quantity == null) {
    return res.status(400).send("Missing inventory quantity");
  }

  const previousQuantity = lastUpdatedStock.get(shopifyProductId);

  if (previousQuantity === inventory_quantity) {
    console.log(`⚠️ Ignored duplicate update for Product ID ${shopifyProductId}, quantity: ${inventory_quantity}`);
    return res.status(200).send("Duplicate stock update ignored");
  }

  // Update cache and proceed
  lastUpdatedStock.set(shopifyProductId, inventory_quantity);

  console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

  await updateWooCommerceInventory(shopifyProductId, inventory_quantity);

  res.status(200).send("OK");
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
