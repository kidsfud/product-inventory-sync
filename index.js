require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { updateWooCommerceInventory } = require("./woocommerce-api");

const app = express();
app.use(bodyParser.json());

// 🔥 Shopify Product Update Webhook Handler
app.post("/shopify/product-update-webhook", async (req, res) => {
  const { id: shopifyProductId, variants } = req.body;

  if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).send("Invalid product payload");
  }

  // For now, just handle the first variant (you can loop through all if needed)
  const { inventory_quantity } = variants[0];

  if (inventory_quantity == null) {
    return res.status(400).send("Missing inventory quantity");
  }

  console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

  await updateWooCommerceInventory(shopifyProductId, inventory_quantity);

  res.status(200).send("OK");
});

// 🚀 Start the server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});


// ---------------------------------------------------------------------------------------

// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const { updateWooCommerceInventory } = require("./woocommerce-api");

// const app = express();
// app.use(bodyParser.json());

// // ⏱️ In-memory deduplication cache
// const recentUpdates = new Map(); // Key: Shopify product ID, Value: Timestamp
// const DEDUPLICATION_WINDOW = 5000; // 5 seconds

// // 🔥 Shopify Product Update Webhook Handler
// app.post("/shopify/product-update-webhook", async (req, res) => {
//   const { id: shopifyProductId, variants } = req.body;

//   if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
//     return res.status(400).send("Invalid product payload");
//   }

//   const { inventory_quantity } = variants[0];

//   if (inventory_quantity == null) {
//     return res.status(400).send("Missing inventory quantity");
//   }

//   console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

//   // ✅ Deduplication check
//   const now = Date.now();
//   const lastUpdateTime = recentUpdates.get(shopifyProductId);

//   if (lastUpdateTime && now - lastUpdateTime < DEDUPLICATION_WINDOW) {
//     console.log(`⏩ Skipping duplicate update for Shopify Product ID: ${shopifyProductId}`);
//     return res.status(200).send("Duplicate update skipped");
//   }

//   // ✅ Record this update time
//   recentUpdates.set(shopifyProductId, now);

//   // 🔄 Proceed to update WooCommerce
//   await updateWooCommerceInventory(shopifyProductId, inventory_quantity);

//   res.status(200).send("OK");
// });

// // 🚀 Start the server
// app.listen(process.env.PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
// });
