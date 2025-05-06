
// const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// require("dotenv").config();

// const api = new WooCommerceRestApi({
//   url: process.env.WOOCOMMERCE_SITE_URL,
//   consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
//   consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
//   version: "wc/v3"
// });

// async function getAllProducts() {
//   const allProducts = [];
//   let page = 1;
//   let keepFetching = true;

//   while (keepFetching) {
//     const { data } = await api.get("products", {
//       per_page: 100,
//       page
//     });

//     allProducts.push(...data);
//     if (data.length < 100) keepFetching = false;
//     else page++;
//   }

//   return allProducts;
// }

// // async function updateWooCommerceInventory(shopifyProductId, quantity) {
// //   try {
// //     const products = await getAllProducts();

// //     const matchingProduct = products.find(p =>
// //       p.meta_data?.some(
// //         m => m.key === "shopify_product_id" && m.value == shopifyProductId
// //       )
// //     );

// //     if (!matchingProduct) {
// //       console.log("❌ Matching product not found for Shopify ID:", shopifyProductId);
// //       return;
// //     }

// //     await api.put(`products/${matchingProduct.id}`, {
// //       stock_quantity: quantity,
// //       manage_stock: true
// //     });

// //     console.log(`✅ Stock updated for WooCommerce Product ID ${matchingProduct.id} to ${quantity}`);
// //   } catch (err) {
// //     console.error("❌ WooCommerce update failed:", err.response?.data || err.message);
// //   }
// // }




// async function updateWooCommerceInventory(shopifyProductId, quantity) {
//   try {
//     const products = await getAllProducts();

//     const matchingProduct = products.find(p =>
//       p.meta_data?.some(
//         m => m.key === "shopify_product_id" && m.value == shopifyProductId
//       )
//     );

//     if (!matchingProduct) {
//       console.log("❌ Matching product not found for Shopify ID:", shopifyProductId);
//       return;
//     }

//     await api.put(`products/${matchingProduct.id}`, {
//       stock_quantity: quantity,
//       manage_stock: true
//     });

//     console.log(`✅ Stock updated for WooCommerce Product ID ${matchingProduct.id} to ${quantity}`);
//   } catch (err) {
//     console.error("❌ WooCommerce update failed:", err.response?.data || err.message);
//     console.error(err.toJSON ? err.toJSON() : err); 
//   }
// }
// module.exports = { updateWooCommerceInventory };



/// -------------------------------------❌ ❌❌❌❌❌  previous version code ❌❌❌❌❌❌❌❌ ---------------------------------------------------


// // woocommerce-api.js
// require("dotenv").config();
// const axios = require("axios");

// // woocommerce-api.js
// // woocommerce-api.js
// ["WOOCOMMERCE_SITE_URL","WOOCOMMERCE_CONSUMER_KEY","WOOCOMMERCE_CONSUMER_SECRET"]
//   .forEach(key => {
//     console.log(`env ${key} =`, process.env[key]);
//     if (!process.env[key]) {
//       console.error(`❌ Missing environment variable: ${key}`);
//       process.exit(1);
//     }
//   });


// const {
//   WOOCOMMERCE_SITE_URL,
//   WOOCOMMERCE_CONSUMER_KEY,
//   WOOCOMMERCE_CONSUMER_SECRET
// } = process.env;

// // axios client for WooCommerce REST
// const woo = axios.create({
//   baseURL: `${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/`,
//   auth: {
//     username: WOOCOMMERCE_CONSUMER_KEY,
//     password: WOOCOMMERCE_CONSUMER_SECRET
//   },
//   headers: { "Content-Type": "application/json" },
// });

// /**
//  * Find the WooCommerce variation with meta key `shopify_variant_id === variantId`
//  * and update its stock_quantity to newQty.
//  */
// async function updateWooInventoryByVariant(variantId, newQty) {
//   // 1️⃣ Fetch first page of products (paginated if you have many)
//   const { data: products } = await woo.get("products", {
//     params: { per_page: 100, page: 1, context: "edit", _fields: "id,variations" }
//   });

//   let match = null;
//   for (const prod of products) {
//     if (!Array.isArray(prod.variations)) continue;
//     for (const varId of prod.variations) {
//       const { data: variation } = await woo.get(
//         `products/${prod.id}/variations/${varId}`,
//         { params: { context: "edit" } }
//       );

//       const shopifyMeta = variation.meta_data.find(m => m.key === "shopify_variant_id");
//       if (shopifyMeta && String(shopifyMeta.value).trim() === String(variantId)) {
//         match = { product_id: prod.id, variation_id: variation.id };
//         break;
//       }
//     }
//     if (match) break;
//   }

//   if (!match) {
//     console.warn(`⚠️ No Woo variation matched shopify_variant_id=${variantId}`);
//     return;
//   }

//   console.log(`🛠 Updating Woo variation ${match.variation_id} (product ${match.product_id}) to ${newQty}`);

//   // 2️⃣ Update that variation's stock
//   await woo.put(
//     `products/${match.product_id}/variations/${match.variation_id}`,
//     { stock_quantity: newQty }
//   );

//   console.log(`✅ Woo variation ${match.variation_id} stock set to ${newQty}`);
// }

// module.exports = { updateWooInventoryByVariant };


///-------------------------------------------------------------------------------------------------------------------------------------------------
require("dotenv").config();
const axios = require("axios");

// Read your WooCommerce creds & site URL
const WOO_BASE = (process.env.WOOCOMMERCE_SITE_URL || "")
  // strip any trailing slash
  .replace(/\/$/, "");
const WOO_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOO_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

// Debug‐log on startup
console.log("🔍 WooCommerce base URL:", WOO_BASE || "(missing)");
console.log("🔍 Consumer Key present?", !!WOO_KEY);
console.log("🔍 Consumer Secret present?", !!WOO_SECRET);

if (!WOO_BASE || !WOO_KEY || !WOO_SECRET) {
  console.error("❌ Missing one of WOOCOMMERCE_SITE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET");
  process.exit(1);
}

/**
 * Fetches all products, finds the one whose `meta_data`
 * includes a key "shopify_product_id" matching the Shopify variant ID,
 * and updates its stock_quantity.
 */
async function updateWooInventoryByVariant(shopifyVariantId, available) {
  try {
    // 1️⃣ Fetch all products
    const resp = await axios.get(
      `${WOO_BASE}/wp-json/wc/v3/products`,
      { auth: { username: WOO_KEY, password: WOO_SECRET } }
    );
    const products = resp.data;

    // 2️⃣ Find matching product
    for (const product of products) {
      const metadata = product.meta_data || [];
      if (metadata.some(m => m.key === "shopify_product_id" && m.value == shopifyVariantId)) {
        // 3️⃣ Update its stock
        await axios.put(
          `${WOO_BASE}/wp-json/wc/v3/products/${product.id}`,
          { stock_quantity: available },
          { auth: { username: WOO_KEY, password: WOO_SECRET } }
        );
        console.log(`✅ Woo stock updated for product ${product.id}`);
        return;
      }
    }

    console.warn(`⚠️ No Woo product matched Shopify variant ${shopifyVariantId}`);
  } catch (err) {
    console.error("❌ Failed to update WooCommerce:", err.message);
    throw err;
  }
}

module.exports = { updateWooInventoryByVariant };
