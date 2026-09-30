//no cache needed here

/*
Your current route only has one login limiter.

Now the login request goes through:

Browser ID
     ↓
Browser limiter
     ↓
IP limiter
     ↓
Account limiter
     ↓
Controller
*/

const express = require("express");

const {
  login,
  me,
  logout,
} = require("../controllers/authController");


const authMiddleware =
  require("../middleware/authMiddleware");


const {
  browserLoginLimiter,
  ipLoginLimiter,
  accountLoginLimiter,
} = require("../middleware/rateLimiter");


const {
  ensureBrowserId,
} = require("../middleware/browserId");


const router =
  express.Router();


// ============================================================
// LOGIN
// ============================================================
//
// Security layers:
//
// 1. ensureBrowserId
//    Identifies the browser using a random HttpOnly cookie.
//
// 2. browserLoginLimiter
//    Strict per-browser failed-login protection.
//
// 3. ipLoginLimiter
//    Broader network-level protection.
//
// 4. accountLoginLimiter
//    Protects the specific email/account.
//
// 5. login controller
//    Performs validation, bcrypt password verification,
//    JWT generation, and HttpOnly cookie creation.
//
// All four protections must pass before the password is
// actually processed by the controller.
// ============================================================

router.post(
  "/login",

  ensureBrowserId,

  browserLoginLimiter,

  ipLoginLimiter,

  accountLoginLimiter,

  login
);


// ============================================================
// GET CURRENT ADMIN
// ============================================================
//
// Requires a valid JWT stored in the HttpOnly admin_token
// cookie.
//

router.get(
  "/me",

  authMiddleware,

  me
);


// ============================================================
// LOGOUT
// ============================================================

router.post(
  "/logout",

  authMiddleware,

  logout
);


module.exports =
  router;