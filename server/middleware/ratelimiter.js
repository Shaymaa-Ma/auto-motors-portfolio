const rateLimit = require("express-rate-limit");


// =========================================================
// LOGIN RATE LIMITER
// =========================================================
//
// GLOBAL / IP-BASED LOGIN SECURITY
//
// The counter is NOT connected to the email address.
//
// Example:
//
// IP: 192.168.1.10
//
// Attempt 1 → invalid
// Attempt 2 → invalid
// Attempt 3 → invalid
// Attempt 4 → invalid
// Attempt 5 → invalid + IP becomes blocked
//
// After that:
//
// Any email
// Any password
// Any login request
//       ↓
// BLOCKED
//
// The block lasts LOGIN_BLOCK_MINUTES.
//
// A successful login resets the failed-attempt counter.
//
// =========================================================


const MAX_LOGIN_ATTEMPTS =
  Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;


const LOGIN_BLOCK_MINUTES =
  Number(process.env.LOGIN_BLOCK_MINUTES) || 10;


// =========================================================
// LOGIN LIMITER
// =========================================================
//
// skipSuccessfulRequests:
//
// A successful login does NOT count as a failed attempt.
//
// Therefore:
//
// 401 → counted
// 403 → counted
// 500 → not counted
// 200 → not counted
//
// =========================================================

const loginLimiter = rateLimit({

  // -------------------------------------------------------
  // The rate-limit window is the same as the block period.
  // -------------------------------------------------------

  windowMs:
    LOGIN_BLOCK_MINUTES *
    60 *
    1000,


  // -------------------------------------------------------
  // Maximum failed login attempts per IP.
  // -------------------------------------------------------

  max:
    MAX_LOGIN_ATTEMPTS,


  // -------------------------------------------------------
  // Successful requests are removed from the counter.
  // -------------------------------------------------------

  skipSuccessfulRequests:
    true,


  // -------------------------------------------------------
  // Send standard RateLimit headers.
  // -------------------------------------------------------

  standardHeaders:
    true,

  legacyHeaders:
    false,


  // -------------------------------------------------------
  // Store the client IP.
  //
  // This is used by the controller/debugging if needed.
  // -------------------------------------------------------

  keyGenerator: (req) => {

    const ip =
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown";


    req.loginClientIp =
      ip;


    return ip;
  },


  // -------------------------------------------------------
  // Response when the IP has reached the limit.
  // -------------------------------------------------------

  message: {
    success: false,

    message:
      `Too many failed login attempts. ` +
      `Login is temporarily blocked for ` +
      `${LOGIN_BLOCK_MINUTES} minutes.`,
  },


  // -------------------------------------------------------
  // Custom handler.
  //
  // This makes the blocked response consistent.
  // -------------------------------------------------------

  handler: (req, res) => {

    return res.status(429).json({
      success: false,

      message:
        `Too many failed login attempts. ` +
        `Login is temporarily blocked for ` +
        `${LOGIN_BLOCK_MINUTES} minutes.`,

      loginBlocked: true,

      blockMinutes:
        LOGIN_BLOCK_MINUTES,
    });
  },
});


module.exports = {
  loginLimiter,
};