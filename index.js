// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const { updateWooCommerceInventory } = require("./woocommerce-api");
// const handleWooOrder     = require("./woo-to-shopify");


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

// // --------------------------------------------------------------------------------------------------------------

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
//           consumer_key:    process.env.WOOCOMMERCE_CONSUMER_KEY,
//           consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
//           per_page:        100,
//           page,
//           context:         "edit"
//         }
//       }
//     );
//     if (!Array.isArray(products) || products.length === 0) break;

//     for (const prod of products) {
//       if (!Array.isArray(prod.meta_data)) continue;
//       const entry = prod.meta_data.find(m => m.key === "shopify_product_id");
//       if (entry) {
//         wooProductMap.set(String(entry.value), {
//           id:    prod.id,
//           stock: parseInt(prod.stock_quantity, 10) || 0
//         });
//       }
//     }
//     page++;
//   }
//   console.log(`✅ Loaded ${wooProductMap.size} products into Woo→Shopify map`);
// }

// // Start the server only after loading the map
// loadWooMap().then(() => {
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// });

// // ───────────────────────────────────────────────────────────────
// // 2️⃣ Webhook: WooCommerce → Shopify
// // ───────────────────────────────────────────────────────────────
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🔥 WooCommerce webhook hit");
//   res.sendStatus(200);                    // ACK immediately
//   handleWooOrder(req.body, wooProductMap);
// });

// // 🚀 Start the server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


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
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { handleShopifyInventoryWebhook } = require("./woo-to-shopify");

const app = express();
const PORT = process.env.PORT || 3000;

// In‐memory cache to dedupe identical inventory updates
const lastUpdatedQty = new Map();

app.use(bodyParser.json());

app.post("/shopify/product-update-webhook", async (req, res) => {
  const variants = req.body.variants;
  if (!Array.isArray(variants)) {
    return res.status(400).send("Invalid payload");
  }

  for (const v of variants) {
    const variantId = v.id;
    const newQty    = v.inventory_quantity;

    if (lastUpdatedQty.get(variantId) === newQty) continue;
    lastUpdatedQty.set(variantId, newQty);

    console.log(`🔄 Variant ${variantId} new inventory: ${newQty}`);

    try {
      await handleShopifyInventoryWebhook(variantId, newQty);
    } catch (err) {
      console.error("❌ Woo update failed:", err.message);
    }
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => console.log(`🚀 Listening on ${PORT}`));
