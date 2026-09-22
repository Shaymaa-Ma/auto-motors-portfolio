const express = require("express");

const {
  getAdvantages,
  getAdvantageById,
  getAdminAdvantages,
  getAdminAdvantageById,
  createAdvantage,
  updateAdvantage,
  reorderAdvantage,
  normalizeAdvantageOrders,
  deleteAdvantage,
} = require("../controllers/advantageController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// Admin - Protected
// IMPORTANT:
// Admin routes MUST come before /:id
// ============================================================

// Get paginated advantages for Admin
// GET /api/advantages/admin?page=1&limit=10
router.get(
  "/admin",
  authMiddleware,
  getAdminAdvantages
);

// Get one advantage for Admin
// GET /api/advantages/admin/:id
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminAdvantageById
);

// Reorder one advantage
// PUT /api/advantages/:id/order
router.put(
  "/:id/order",
  authMiddleware,
  reorderAdvantage
);

// Normalize all advantage orders
// POST /api/advantages/normalize-orders
router.post(
  "/normalize-orders",
  authMiddleware,
  normalizeAdvantageOrders
);

// ============================================================
// Public
// ============================================================

// Get active advantages for the client
// GET /api/advantages
router.get(
  "/",
  getAdvantages
);

// Get one active advantage for the client
// GET /api/advantages/:id
router.get(
  "/:id",
  getAdvantageById
);

// ============================================================
// Admin CRUD
// ============================================================

// Create an advantage
// POST /api/advantages
router.post(
  "/",
  authMiddleware,
  createAdvantage
);

// Update an advantage
// PUT /api/advantages/:id
router.put(
  "/:id",
  authMiddleware,
  updateAdvantage
);

// Delete an advantage
// DELETE /api/advantages/:id
router.delete(
  "/:id",
  authMiddleware,
  deleteAdvantage
);

module.exports = router;