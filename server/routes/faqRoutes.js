const express = require("express");

const {
  getFaqs,
  getFaqById,

  getAdminFaqs,
  getAdminFaqById,

  reorderFaq,
  normalizeFaqOrders,

  createFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  cacheMiddleware,
} = require("../middleware/cache");

const router =
  express.Router();

// =========================================================
// ADMIN - PROTECTED
// =========================================================

// Get paginated FAQs for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminFaqs
);

// Get one FAQ for Admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminFaqById
);

// Reorder FAQ
router.put(
  "/:id/order",
  authMiddleware,
  reorderFaq
);

// Normalize all FAQ orders
router.post(
  "/normalize-orders",
  authMiddleware,
  normalizeFaqOrders
);

// =========================================================
// PUBLIC
// =========================================================

// Get active FAQs for client
router.get(
  "/",
  cacheMiddleware(),
  getFaqs
);

// Get one active FAQ for client
router.get(
  "/:id",
  cacheMiddleware(),
  getFaqById
);

// =========================================================
// ADMIN CRUD
// =========================================================

// Create FAQ
router.post(
  "/",
  authMiddleware,
  createFaq
);

// Update FAQ
router.put(
  "/:id",
  authMiddleware,
  updateFaq
);

// Delete FAQ
router.delete(
  "/:id",
  authMiddleware,
  deleteFaq
);

module.exports = router;