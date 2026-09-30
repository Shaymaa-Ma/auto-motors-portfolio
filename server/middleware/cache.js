
/*
Reusable in-memory caching middleware for API responses.

This cache temporarily stores successful GET request responses in memory
to reduce repeated database queries and improve API response performance.
When a request is received, the middleware first checks whether a valid
cached response exists. If it does, the cached data is returned without
querying the database. If no valid cache exists, the request continues to
the controller, and the successful response is stored in the cache for the
configured TTL.

Cached entries automatically expire after the defined TTL. The cache can
also be manually cleared when related database data is created, updated,
or deleted, ensuring that the next request retrieves the latest data from
the database and refreshes the cache.

The cache uses the request method and URL as the cache key, allowing
different API endpoints and query parameters to maintain separate
cached responses.
*/


const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Use the request method and URL as the cache key.
const getCacheKey = (req) => {
  return `${req.method}:${req.originalUrl}`;
};

const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return (req, res, next) => {
    const key = getCacheKey(req);
    const cached = cache.get(key);

    // Return the cached response if it is still valid.
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(cached.statusCode).json(cached.data);
    }

    // Remove expired cache entries.
    if (cached) {
      cache.delete(key);
    }

    const originalJson = res.json.bind(res);

    // Store successful API responses in the cache.
    res.json = (data) => {
      cache.set(key, {
        data,
        statusCode: res.statusCode,
        expiresAt: Date.now() + ttl,
      });

      return originalJson(data);
    };

    next();
  };
};

// Clear cached data when the related database data changes.
const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Clear all cached responses.
const clearAllCache = () => {
  cache.clear();
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
};