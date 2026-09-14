const express = require("express");

const {
  login,
  registrationStatus,
  register,
  me,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* Public authentication routes */
router.post("/login", login);

router.get(
  "/registration-status",
  registrationStatus
);

router.post(
  "/register",
  register
);

/* Protected authentication routes */
router.get(
  "/me",
  authMiddleware,
  me
);

router.post(
  "/logout",
  authMiddleware,
  logout
);

module.exports = router;