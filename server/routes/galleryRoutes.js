const express = require("express");

const {
  getGallery,
  getGalleryItemById,
  getAdminGallery,
  getAdminGalleryItemById,
  createGalleryItem,
  updateGallerySection,
  updateGalleryItem,
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
// PUBLIC
// =========================================================

// Get all ACTIVE gallery items
router.get(
  "/",
  getGallery
);

// =========================================================
// ADMIN - GET
// =========================================================

// Get ALL gallery items
// Includes active + inactive
router.get(
  "/admin",
  authMiddleware,
  getAdminGallery
);

// Get ONE gallery item for admin
router.get(
  "/admin/:id",
  authMiddleware,
  getAdminGalleryItemById
);

// =========================================================
// ADMIN - UPDATE SECTION
// IMPORTANT:
// /section MUST be BEFORE /:id
// =========================================================

router.put(
  "/section",
  authMiddleware,
  galleryUpload.none(),
  updateGallerySection
);

// =========================================================
// PUBLIC SINGLE ITEM
// =========================================================

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