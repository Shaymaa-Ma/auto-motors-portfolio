const express = require("express");

const {
  getGallery,
  getGalleryItemById,
  getAdminGallery,
  getAdminGalleryItemById,
  createGalleryItem,
  updateGallerySection,
  updateGalleryItem,
  reorderGalleryItem,
  normalizeGalleryOrders,
  deleteGalleryItem,
} = require("../controllers/galleryController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// =========================================================
// UPLOAD CONFIGURATION
// =========================================================

const galleryUpload =
  createImageUpload(
    "gallery",
    "gallery"
  );

// =========================================================
// ADMIN - GET
// IMPORTANT:
// Admin routes MUST come before /:id
// =========================================================

// Get paginated gallery items
router.get(
  "/admin",
  authMiddleware,
  getAdminGallery
);

// Get one gallery item for admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminGalleryItemById
);

// =========================================================
// ADMIN - UPDATE SECTION
// IMPORTANT:
// /section MUST be before /:id
// =========================================================

router.put(
  "/section",
  authMiddleware,
  galleryUpload.none(),
  updateGallerySection
);

// =========================================================
// ADMIN - REORDER
// IMPORTANT:
// /:id/order MUST be before /:id
// =========================================================

router.put(
  "/:id/order",
  authMiddleware,
  reorderGalleryItem
);

// =========================================================
// ADMIN - NORMALIZE ORDERS
// =========================================================

router.post(
  "/normalize-orders",
  authMiddleware,
  normalizeGalleryOrders
);

// =========================================================
// PUBLIC
// =========================================================

// Get all ACTIVE gallery items
router.get(
  "/",
  getGallery
);

// Get ONE active gallery item
router.get(
  "/:id",
  getGalleryItemById
);

// =========================================================
// ADMIN - CREATE
// =========================================================

router.post(
  "/",
  authMiddleware,
  galleryUpload.single("image"),
  createGalleryItem
);

// =========================================================
// ADMIN - UPDATE ITEM
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  galleryUpload.single("image"),
  updateGalleryItem
);

// =========================================================
// ADMIN - DELETE
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteGalleryItem
);

module.exports = router;