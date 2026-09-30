const {
  rateLimit,
  ipKeyGenerator,
} = require("express-rate-limit");


// ============================================================
// CONFIGURATION
// ============================================================
//
// These values can be changed from .env.
//
// The defaults are intentionally different for each layer:
//
// Browser:
//   5 failed attempts / 10 minutes
//
// IP:
//   20 failed attempts / 10 minutes
//
// Account:
//   10 failed attempts / 10 minutes
//
// General API:
//   600 requests / 15 minutes
//
// Burst:
//   100 requests / 10 seconds
//
// The limits work together rather than replacing one another.
// ============================================================


// ------------------------------------------------------------
// BROWSER LOGIN LIMIT
// ------------------------------------------------------------

const MAX_BROWSER_LOGIN_ATTEMPTS =
  Number(
    process.env.LOGIN_BROWSER_MAX_ATTEMPTS
  ) || 5;


// ------------------------------------------------------------
// IP LOGIN LIMIT
// ------------------------------------------------------------

const MAX_IP_LOGIN_ATTEMPTS =
  Number(
    process.env.LOGIN_IP_MAX_ATTEMPTS
  ) || 20;


// ------------------------------------------------------------
// ACCOUNT LOGIN LIMIT
// ------------------------------------------------------------
//
// This is deliberately higher than the browser limit.
//
// We do NOT permanently lock the account.
// The purpose is to slow repeated attacks against one
// particular email/account.
//
// This also reduces the risk of an attacker intentionally
// locking another administrator out.
//

const MAX_ACCOUNT_LOGIN_ATTEMPTS =
  Number(
    process.env.LOGIN_ACCOUNT_MAX_ATTEMPTS
  ) || 10;


// ------------------------------------------------------------
// LOGIN WINDOW
// ------------------------------------------------------------

const LOGIN_BLOCK_MINUTES =
  Number(
    process.env.LOGIN_BLOCK_MINUTES
  ) || 10;


// ------------------------------------------------------------
// GENERAL API LIMIT
// ------------------------------------------------------------

const API_MAX_REQUESTS =
  Number(
    process.env.API_RATE_LIMIT
  ) || 600;


// ------------------------------------------------------------
// BURST LIMIT
// ------------------------------------------------------------

const BURST_MAX_REQUESTS =
  Number(
    process.env.BURST_RATE_LIMIT
  ) || 100;


// ============================================================
// BURST LIMITER
// ============================================================
//
// Protects the API against sudden request spikes.
//
// Example:
//
// 100 requests in 10 seconds
//
// This helps with:
// - rapid page reloads
// - scripts
// - accidental request loops
// - request bursts
//
// This limiter uses the IP because it protects the API
// at the network level.
// ============================================================

const burstLimiter = rateLimit({
  windowMs:
    10 * 1000,

  limit:
    BURST_MAX_REQUESTS,

  standardHeaders: true,

  legacyHeaders: false,

  // Browser CORS preflight requests should not consume
  // the API quota.
  skip: (req) =>
    req.method === "OPTIONS",

  message: {
    success: false,
    message:
      "Too many requests. Please slow down.",
  },
});


// ============================================================
// GENERAL API LIMITER
// ============================================================
//
// Protects the API against sustained traffic.
//
// Example:
//
// 600 requests during 15 minutes
//
// This is separate from the burst limiter.
//
// Burst limiter:
//     "Too many too quickly"
//
// API limiter:
//     "Too many over a longer period"
// ============================================================

const apiLimiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  limit:
    API_MAX_REQUESTS,

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) =>
    req.method === "OPTIONS",

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});


// ============================================================
// BROWSER LOGIN LIMITER
// ============================================================
//
// This is the strictest login layer.
//
// It identifies the browser using the secure random
// login_browser_id cookie.
//
// Example:
//
// Browser A:
//     5 failed attempts
//     ↓
//     Browser A is temporarily blocked
//
// Browser B on the same Wi-Fi:
//     has another Browser ID
//     ↓
//     Browser B is not blocked by Browser A's limit.
//
// This solves the fairness problem with using ONLY an IP.
//
// Successful logins are removed from the rate-limit count.
// Failed responses such as 401 remain counted.
// ============================================================

const browserLoginLimiter = rateLimit({
  windowMs:
    LOGIN_BLOCK_MINUTES * 60 * 1000,

  limit:
    MAX_BROWSER_LOGIN_ATTEMPTS,

  skipSuccessfulRequests:
    true,

  standardHeaders:
    true,

  legacyHeaders:
    false,

  // The Browser ID middleware must run before this limiter.
  keyGenerator: (req) => {
    return (
      req.browserId ||
      "missing-browser-id"
    );
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,

      message:
        `Too many failed login attempts. ` +
        `This browser is temporarily blocked ` +
        `for ${LOGIN_BLOCK_MINUTES} minutes.`,

      loginBlocked: true,

      blockMinutes:
        LOGIN_BLOCK_MINUTES,
    });
  },
});


// ============================================================
// IP LOGIN LIMITER
// ============================================================
//
// This is a SECOND login protection layer.
//
// Why do we need it if we already have Browser ID?
//
// Because a Browser ID can be removed or bypassed by:
//
// - deleting cookies
// - private/incognito browsing
// - using another browser
// - using another device
//
// The IP layer provides broader protection.
//
// IMPORTANT:
//
// The IP limit is intentionally higher than the browser limit.
// This avoids unnecessarily blocking legitimate users who share
// one public IP address, such as an office, university, hotel,
// or household.
// ============================================================

const ipLoginLimiter = rateLimit({
  windowMs:
    LOGIN_BLOCK_MINUTES * 60 * 1000,

  limit:
    MAX_IP_LOGIN_ATTEMPTS,

  skipSuccessfulRequests:
    true,

  standardHeaders:
    true,

  legacyHeaders:
    false,

  keyGenerator: (req) => {
    const ip =
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown";


    // Save the IP so the controller can use it for logging
    // if necessary.
    req.loginClientIp = ip;


    // express-rate-limit provides this helper to correctly
    // handle IPv4 and IPv6 addresses.
    return ipKeyGenerator(ip);
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,

      message:
        `Too many login attempts from this network. ` +
        `Please try again later.`,

      loginBlocked: true,

      blockMinutes:
        LOGIN_BLOCK_MINUTES,
    });
  },
});


// ============================================================
// ACCOUNT LOGIN LIMITER
// ============================================================
//
// This limiter identifies attempts by the normalized email
// address.
//
// Example:
//
// attacker changes:
//     browser
//     device
//     IP
//
// but continues attacking:
//
//     admin@automotors.com
//
// The account limiter can still slow those attempts.
//
// IMPORTANT SECURITY DESIGN:
//
// We deliberately use a higher threshold instead of a tiny
// threshold such as 5 attempts.
//
// Otherwise an attacker could intentionally submit bad
// passwords against a legitimate account and create an easy
// denial-of-service condition.
//
// This is throttling, not permanent account locking.
// ============================================================

const accountLoginLimiter = rateLimit({
  windowMs:
    LOGIN_BLOCK_MINUTES * 60 * 1000,

  limit:
    MAX_ACCOUNT_LOGIN_ATTEMPTS,

  skipSuccessfulRequests:
    true,

  standardHeaders:
    true,

  legacyHeaders:
    false,

  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "unknown-account";


    return email;
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,

      message:
        "Too many failed login attempts for this account. " +
        "Please try again later.",

      loginBlocked: true,

      blockMinutes:
        LOGIN_BLOCK_MINUTES,
    });
  },
});


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  burstLimiter,
  apiLimiter,

  browserLoginLimiter,
  ipLoginLimiter,
  accountLoginLimiter,
};