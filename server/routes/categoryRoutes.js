// Categories routes
const express = require("express");

const {
  getCategories,
  getCategoryById,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router =
  express.Router();

// Configure Category image upload
const categoryUpload =
  createImageUpload(
    "categories",
    "category"
  );

// Get active categories for the client
router.get(
  "/",
  getCategories
);

// Get all categories for Admin
router.get(
  "/admin",
  authMiddleware,
  getAdminCategories
);

// Get one category for Admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminCategoryById
);

// Get one active category for the client
router.get(
  "/:id",
  getCategoryById
);

// Create a category
router.post(
  "/",
  authMiddleware,
  categoryUpload.single(
    "image"
  ),
  createCategory
);

// Update a category
router.put(
  "/:id",
  authMiddleware,
  categoryUpload.single(
    "image"
  ),
  updateCategory
);

module.exports = router;