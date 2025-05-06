// sync-cache.js
// Shared in-memory cache to prevent sync loops
const lastUpdatedStock = new Map();
module.exports = { lastUpdatedStock };