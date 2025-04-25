// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const { updateWooCommerceInventory } = require("./woocommerce-api");

// const app = express();
// app.use(bodyParser.json());

// // 🔥 Shopify Product Update Webhook Handler
// app.post("/shopify/product-update-webhook", async (req, res) => {
//   const { id: shopifyProductId, variants } = req.body;

//   if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
//     return res.status(400).send("Invalid product payload");
//   }

//   // For now, just handle the first variant (you can loop through all if needed)
//   const { inventory_quantity } = variants[0];

//   if (inventory_quantity == null) {
//     return res.status(400).send("Missing inventory quantity");
//   }

//   console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

//   await updateWooCommerceInventory(shopifyProductId, inventory_quantity);

//   res.status(200).send("OK");
// });

// // 🚀 Start the server
// app.listen(process.env.PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
// });


// ---------------------------------------------------------------------------------------
require("dotenv").config();
const express    = require("express");
const bodyParser = require("body-parser");
const axios      = require("axios");

const handleWooOrder     = require("./woo-to-shopify");
const { updateWooCommerceInventory } = require("./woocommerce-api");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create WooCommerce → Shopify product map
const wooProductMap = new Map();

async function loadWooMap() {
  let page = 1;
  while (true) {
    const { data: products } = await axios.get(
      `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products`,
      {
        params: {
          consumer_key:    process.env.WOOCOMMERCE_CONSUMER_KEY,
          consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
          per_page:        100,
          page,
          context:         "edit"
        }
      }
    );
    if (!Array.isArray(products) || products.length === 0) break;

    for (const prod of products) {
      const entry = prod.meta_data.find(m => m.key === "shopify_product_id");
      if (entry) {
        wooProductMap.set(String(entry.value), {
          id:    prod.id,
          stock: parseInt(prod.stock_quantity, 10) || 0
        });
      }
    }
    page++;
  }
  console.log(`✅ Loaded ${wooProductMap.size} WooCommerce → Shopify products`);
}

// Start server after map is ready
loadWooMap().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

// 🔁 WooCommerce → Shopify: Order webhook
app.post("/woo-order-webhook", (req, res) => {
  console.log("🔥 WooCommerce Order Webhook Hit");
  res.sendStatus(200); // ACK
  handleWooOrder(req.body, wooProductMap); // Decrease Shopify stock
});

// 🔁 Shopify → WooCommerce: Inventory update webhook
app.post("/shopify/product-update-webhook", async (req, res) => {
  const { id: shopifyProductId, variants } = req.body;

  if (!shopifyProductId || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).send("Invalid product payload");
  }

  const { inventory_quantity } = variants[0];

  if (inventory_quantity == null) {
    return res.status(400).send("Missing inventory quantity");
  }

  console.log(`🛒 Shopify Product ID: ${shopifyProductId}, New Stock: ${inventory_quantity}`);

  try {
    await updateWooCommerceInventory(shopifyProductId, inventory_quantity);
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error updating WooCommerce inventory:", err.message);
    res.status(500).send("Internal server error");
  }
});
