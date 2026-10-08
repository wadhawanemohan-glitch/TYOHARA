// =====================================================
// SECURITY MIDDLEWARE (no extra packages needed)
//
// - securityHeaders: the important headers `helmet` sets
// - createRateLimiter: simple in-memory limiter per IP
//
// If you later run more than one server instance, swap
// these for `helmet` and `express-rate-limit` (with a
// shared store such as Redis).
// =====================================================

const securityHeaders = (req, res, next) => {

  res.removeHeader("X-Powered-By");

  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "DENY");

  res.setHeader("Referrer-Policy", "no-referrer");

  res.setHeader("X-DNS-Prefetch-Control", "off");

  // This server only returns JSON, so no content may load.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  }

  next();
};


const MAX_TRACKED_CLIENTS = 50000;

const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later."
}) => {

  const hits = new Map();

  // Remove expired entries regularly
  const cleanup = setInterval(() => {

    const now = Date.now();

    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }

  }, windowMs);

  cleanup.unref();

  return (req, res, next) => {

    const now = Date.now();

    const key = req.ip || "unknown";

    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {

      if (hits.size >= MAX_TRACKED_CLIENTS) {
        hits.clear();
      }

      entry = {
        count: 0,
        resetAt: now + windowMs
      };

      hits.set(key, entry);
    }

    entry.count += 1;

    res.setHeader("RateLimit-Limit", String(max));

    res.setHeader(
      "RateLimit-Remaining",
      String(Math.max(0, max - entry.count))
    );

    if (entry.count > max) {

      res.setHeader(
        "Retry-After",
        String(Math.ceil((entry.resetAt - now) / 1000))
      );

      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

module.exports = {
  securityHeaders,
  createRateLimiter
};
