
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
require("dotenv").config();

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_SITE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3"
});

async function getAllProducts() {
  const allProducts = [];
  let page = 1;
  let keepFetching = true;

  while (keepFetching) {
    const { data } = await api.get("products", {
      per_page: 100,
      page
    });

    allProducts.push(...data);
    if (data.length < 100) keepFetching = false;
    else page++;
  }

  return allProducts;
}

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
//   }
// }




async function updateWooCommerceInventory(shopifyProductId, quantity) {
  try {
    const products = await getAllProducts();

    const matchingProduct = products.find(p =>
      p.meta_data?.some(
        m => m.key === "shopify_product_id" && m.value == shopifyProductId
      )
    );

    if (!matchingProduct) {
      console.log("❌ Matching product not found for Shopify ID:", shopifyProductId);
      return;
    }

    await api.put(`products/${matchingProduct.id}`, {
      stock_quantity: quantity,
      manage_stock: true
    });

    console.log(`✅ Stock updated for WooCommerce Product ID ${matchingProduct.id} to ${quantity}`);
  } catch (err) {
    console.error("❌ WooCommerce update failed:", err.response?.data || err.message);
    console.error(err.toJSON ? err.toJSON() : err); 
  }
}
module.exports = { updateWooCommerceInventory };
