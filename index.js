/// -----------------------------------------------------------------------------------


// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const { updateWooCommerceInventory } = require("./woocommerce-api");
// const handleWooOrder = require("./woo-to-shopify.js");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(bodyParser.json());

// // 🧠 In-memory cache to track last updated stock
// const lastUpdatedStock = new Map();

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

//   const previousQuantity = lastUpdatedStock.get(shopifyProductId);

//   if (previousQuantity === inventory_quantity) {
//     console.log(`⚠️ Ignored duplicate update for Product ID ${shopifyProductId}, quantity: ${inventory_quantity}`);
//     return res.status(200).send("Duplicate stock update ignored");
//   }

//   // Update cache and proceed
//   lastUpdatedStock.set(shopifyProductId, inventory_quantity);

//   console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

//   await updateWooCommerceInventory(shopifyProductId, inventory_quantity);

//   res.status(200).send("OK");
// });

// // ──────────────────────────────────────────────────────────────────
// // 1️⃣ Preload WooCommerce→Shopify mapping into memory
// // ──────────────────────────────────────────────────────────────────
// const wooProductMap = new Map();  // shopify_product_id → { id, stock }

// async function loadWooMap() {
//   let page = 1;
//   while (true) {
//     const { data: products } = await axios.get(
//       `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products`,
//       {
//         params: {
//           consumer_key: process.env.WOOCOMMERCE_CONSUMER_KEY,
//           consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
//           per_page: 100,
//           page,
//           context: "edit"
//         }
//       }
//     );

//     if (!Array.isArray(products) || products.length === 0) break;

//     for (const prod of products) {
//       if (!Array.isArray(prod.meta_data)) continue;
//       const entry = prod.meta_data.find(m => m.key === "shopify_product_id");
//       if (entry) {
//         wooProductMap.set(String(entry.value), {
//           id: prod.id,
//           stock: parseInt(prod.stock_quantity, 10) || 0
//         });
//       }
//     }

//     page++;
//   }

//   console.log(`✅ Loaded ${wooProductMap.size} products into Woo→Shopify map`);
// }

// // 2️⃣ Webhook: WooCommerce → Shopify
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🔥 WooCommerce webhook hit");
//   res.sendStatus(200); // ACK immediately
//   handleWooOrder(req.body, wooProductMap);
// });

// // 🚀 Start the server only after Woo→Shopify map is loaded
// loadWooMap()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error("❌ Failed to load WooCommerce product map :", err.message);
//     process.exit(1);
//   });


/// ---------------------------------------Above is getting 2 webhook calls--------------------------------------------------------------------------



// // index.js
// // Main server: handles Shopify product-update and WooCommerce order webhooks
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const { lastUpdatedStock } = require("./sync-cache");
// const { updateWooCommerceInventory } = require("./woocommerce-api");
// const handleWooOrder = require("./woo-to-shopify");

// const app = express();
// const PORT = process.env.PORT || 3000;
// app.use(bodyParser.json());

// // Shopify → WooCommerce sync
// app.post("/shopify/product-update-webhook", async (req, res) => {
//   const { id: shopifyProductId, variants } = req.body;
//   if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
//     return res.status(400).send("Invalid Shopify product payload");
//   }

//   const newQty = variants[0].inventory_quantity;
//   if (newQty == null) return res.status(400).send("Missing inventory quantity");

//   // Skip our own updates
//   if (lastUpdatedStock.get(shopifyProductId) === newQty) {
//     console.log(`🔁 Skipping looped update for Product ${shopifyProductId}, Qty ${newQty}`);
//     return res.status(200).send("Loop skip");
//   }

//   // Record and push to WooCommerce
//   lastUpdatedStock.set(shopifyProductId, newQty);
//   console.log(`🛒 Shopify → Woo: Product ${shopifyProductId}, New Stock ${newQty}`);

//   try {
//     await updateWooCommerceInventory(shopifyProductId, newQty);
//   } catch (err) {
//     console.error("❌ WooCommerce update failed:", err.message);
//   }

//   res.status(200).send("OK");
// });

// // WooCommerce → Shopify order sync
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🚚 WooCommerce order webhook received");
//   res.sendStatus(200);
//   handleWooOrder(req.body);
// });

// app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));


// // ------------------------------ABOVE IS WORKING FOR MANUAL UPDATE NOT FOR AUTOMATIC ORDER UPDATE-----------------------------------------------------

// index.js
// Main server: handles Shopify product-update, inventory-level, and Woo order webhooks

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const { lastUpdatedStock } = require("./sync-cache");
const { updateWooCommerceInventory } = require("./woocommerce-api");
const { handleWooOrder, handleShopifyInventoryWebhook } = require("./woo-to-shopify");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// ─── 1) Manual & App-driven edits ────────────────────────────────
app.post("/shopify/product-update-webhook", async (req, res) => {
  const { id: shopifyProductId, variants } = req.body;
  if (!shopifyProductId || !Array.isArray(variants) || !variants.length) {
    return res.status(400).send("Invalid Shopify product payload");
  }
  const newQty = variants[0].inventory_quantity;
  if (newQty == null) return res.status(400).send("Missing inventory quantity");

  // skip our own adjustments
  if (lastUpdatedStock.get(shopifyProductId) === newQty) {
    console.log(`🔁 Skipping loop update for Product ${shopifyProductId}, Qty ${newQty}`);
    return res.status(200).send("Loop skip");
  }

  lastUpdatedStock.set(shopifyProductId, newQty);
  console.log(`🛒 [Product] Shopify→Woo: ${shopifyProductId} → ${newQty}`);

  try {
    await updateWooCommerceInventory(shopifyProductId, newQty);
  } catch (err) {
    console.error("❌ Woo update failed:", err.message);
  }

  res.status(200).send("OK");
});

// ─── 2) Order-driven decrements ───────────────────────────────────
app.post("/shopify/inventory-levels-webhook", async (req, res) => {
  const lvl = req.body.inventory_level;
  if (!lvl || lvl.available == null) {
    return res.status(400).send("Invalid inventory payload");
  }

  console.log(`⚙️ [InventoryLevel] item ${lvl.inventory_item_id} → available ${lvl.available}`);
  try {
    await handleShopifyInventoryWebhook(lvl.inventory_item_id, lvl.available);
  } catch (err) {
    console.error("❌ Woo update failed:", err.message);
  }
  res.status(200).send("OK");
});

// ─── 3) WooCommerce order hook ───────────────────────────────────
app.post("/woo-order-webhook", (req, res) => {
  console.log("🚚 Woo order webhook received");
  res.sendStatus(200);
  handleWooOrder(req.body);
});

app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
