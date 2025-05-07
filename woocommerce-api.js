
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

// // woocommerce-api.js
// // Wrapper around @woocommerce/woocommerce-rest-api for updating WooCommerce stock
// const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// require("dotenv").config();

// const api = new WooCommerceRestApi({
//   url: process.env.WOOCOMMERCE_SITE_URL,
//   consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
//   consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
//   version: "wc/v3"
// });

// async function updateWooCommerceInventory(shopifyProductId, quantity) {
//   try {
//     // Fetch all products
//     const all = [];
//     for (let page = 1;; page++) {
//       const { data } = await api.get("products", { per_page: 100, page });
//       all.push(...data);
//       if (data.length < 100) break;
//     }

//     const match = all.find(p =>
//       p.meta_data?.some(m => m.key === "shopify_product_id" && String(m.value) === String(shopifyProductId))
//     );

//     if (!match) {
//       console.warn(`⚠️ No Woo product with shopify_product_id=${shopifyProductId}`);
//       return;
//     }

//     await api.put(`products/${match.id}`, {
//       stock_quantity: quantity,
//       manage_stock: true
//     });

//     console.log(`✅ Woo stock updated for product ${match.id} → ${quantity}`);
//   } catch (err) {
//     console.error("❌ WooCommerce update failed:", err.response?.data || err.message);
//   }
// }

// module.exports = { updateWooCommerceInventory };


///--------------------------ABOVE CODE IS WORKING FOR MANUAL UPDATE ----------------------------------------



// woocommerce-api.js
// Wraps @woocommerce/woocommerce-rest-api to update Woo stock by Shopify variant ID

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
require("dotenv").config();

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_SITE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3"
});

async function updateWooCommerceInventory(shopifyProductId, quantity) {
  try {
    // paginate through all products (or preload in memory if you prefer)
    const all = [];
    for (let page = 1; ; page++) {
      const { data } = await api.get("products", { per_page: 100, page });
      all.push(...data);
      if (data.length < 100) break;
    }

    // find the one with matching meta_data.shopify_product_id
    const match = all.find(p =>
      p.meta_data?.some(m =>
        m.key === "shopify_product_id" && String(m.value) === String(shopifyProductId)
      )
    );

    if (!match) {
      console.warn(`⚠️ No Woo product with shopify_product_id=${shopifyProductId}`);
      return;
    }

    await api.put(`products/${match.id}`, {
      stock_quantity: quantity,
      manage_stock: true
    });

    console.log(`✅ Woo stock updated for product ${match.id} → ${quantity}`);
  } catch (err) {
    console.error("❌ WooCommerce update failed:", err.response?.data || err.message);
  }
}

module.exports = { updateWooCommerceInventory };
