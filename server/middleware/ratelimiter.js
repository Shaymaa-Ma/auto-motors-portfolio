const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// ============================================================
// LOGIN RATE LIMIT CONFIGURATION
// ============================================================

const MAX_LOGIN_ATTEMPTS =
  Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;

const LOGIN_BLOCK_MINUTES =
  Number(process.env.LOGIN_BLOCK_MINUTES) || 10;


// ============================================================
// LOGIN LIMITER
// ============================================================

const loginLimiter = rateLimit({

  windowMs:
    LOGIN_BLOCK_MINUTES *
    60 *
    1000,

  max:
    MAX_LOGIN_ATTEMPTS,

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

    req.loginClientIp =
      ip;

    return ipKeyGenerator(ip);
  },

  message: {
    success: false,

    message:
      `Too many failed login attempts. ` +
      `Login is temporarily blocked for ` +
      `${LOGIN_BLOCK_MINUTES} minutes.`,
  },

  handler: (req, res) => {

    return res.status(429).json({

      success: false,

      message:
        `Too many failed login attempts. ` +
        `Login is temporarily blocked for ` +
        `${LOGIN_BLOCK_MINUTES} minutes.`,

      loginBlocked:
        true,

      blockMinutes:
        LOGIN_BLOCK_MINUTES,
    });
  },
});


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  loginLimiter,
};