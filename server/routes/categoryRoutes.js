const express = require("express");

const {
  getCategories,
  getCategoryById,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
  reorderCategory,
  normalizeCategoryOrders,
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

const categoryUpload =
  createImageUpload("categories", "category");

/* =========================================================
   PUBLIC
========================================================= */

router.get(
  "/",
  getCategories
);

/* =========================================================
   ADMIN
========================================================= */

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

/* =========================================================
   ADMIN ORDERING
   IMPORTANT:
   These must come before "/:id"
========================================================= */

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

/* =========================================================
   PUBLIC SINGLE CATEGORY
========================================================= */

router.get(
  "/:id",
  getCategoryById
);

/* =========================================================
   ADMIN CREATE / UPDATE
========================================================= */

router.post(
  "/",
  authMiddleware,
  categoryUpload.single("image"),
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  categoryUpload.single("image"),
  updateCategory
);

module.exports = router;