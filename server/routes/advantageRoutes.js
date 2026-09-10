const express = require("express");

const {
  getAdvantages,
  getAdvantageById,
  getAdminAdvantages,
  getAdminAdvantageById,
  createAdvantage,
  updateAdvantage,
  deleteAdvantage,
} = require("../controllers/advantageController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// Get active advantages for the client
router.get(
  "/",
  getAdvantages
);

// Get all advantages for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminAdvantages
);

// Get one advantage for Admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminAdvantageById
);

// Get one active advantage for the client
router.get(
  "/:id",
  getAdvantageById
);

// Create an advantage
router.post(
  "/",
  authMiddleware,
  createAdvantage
);

// Update an advantage
router.put(
  "/:id",
  authMiddleware,
  updateAdvantage
);

// Delete an advantage
router.delete(
  "/:id",
  authMiddleware,
  deleteAdvantage
);

module.exports = router;