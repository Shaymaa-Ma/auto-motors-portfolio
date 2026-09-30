const express = require("express");

const {
  getCategories,
  getCategoryById,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
  updateCategorySection,
  deleteCategory,
  reorderCategory,
  normalizeCategoryOrders,
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  cacheMiddleware,
} = require("../middleware/cache");

const router = express.Router();

// =========================================================
// PUBLIC
// =========================================================

router.get(
  "/",
  cacheMiddleware(),
  getCategories
);

// =========================================================
// ADMIN
// =========================================================

router.get(
  "/admin",
  authMiddleware,
  getAdminCategories
);

router.get(
  "/admin/:id",
  authMiddleware,
  getAdminCategoryById
);

// =========================================================
// GLOBAL CATEGORY SECTION
// IMPORTANT: before /:id
// =========================================================

router.put(
  "/section",
  authMiddleware,
  updateCategorySection
);

// =========================================================
// ORDERING
// =========================================================

router.post(
  "/normalize-orders",
  authMiddleware,
  normalizeCategoryOrders
);

router.put(
  "/:id/order",
  authMiddleware,
  reorderCategory
);

// =========================================================
// DELETE
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteCategory
);

// =========================================================
// PUBLIC SINGLE CATEGORY
// =========================================================

router.get(
  "/:id",
  cacheMiddleware(),
  getCategoryById
);

// =========================================================
// CREATE / UPDATE
// =========================================================

router.post(
  "/",
  authMiddleware,
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  updateCategory
);

module.exports = router;