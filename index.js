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
const express = require("express");
const bodyParser = require("body-parser");

const { updateWooCommerceInventory } = require("./woocommerce-api");
const handleWooOrder = require("./woo-to-shopify");

const app = express();
app.use(bodyParser.json());

// ✅ Shopify → WooCommerce: Product update webhook
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
    // Update WooCommerce inventory
    await updateWooCommerceInventory(shopifyProductId, inventory_quantity);
    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error updating WooCommerce inventory:", err.message);
    return res.status(500).send("Internal server error");
  }
});

// ✅ WooCommerce → Shopify: Order created webhook
app.post("/woocommerce/order-created", async (req, res) => {
  const order = req.body;

  if (!order || !order.id) {
    console.error("❌ Invalid order payload", order);
    return res.status(400).send("Invalid order payload");
  }

  console.log(`📦 Received WooCommerce Order ID: ${order.id}`);

  try {
    // Reduce Shopify inventory based on WooCommerce order
    await handleWooOrder(order);
    return res.status(200).send("Order received and processed");
  } catch (err) {
    console.error("❌ Error processing WooCommerce order:", err.message);
    return res.status(500).send("Internal server error");
  }
});

// 🚀 Start the server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
