const express = require("express");

const {
  getCompany,
  updateCompany,
} = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const {
  cacheMiddleware,
} = require("../middleware/cache");

const router =
  express.Router();

// =========================================================
// Configure Company logo upload
// =========================================================

const companyUpload =
  createImageUpload(
    "logo",
    "company-logo"
  );

// =========================================================
// Get Company information
// GET /api/company
// Public
// =========================================================

router.get(
  "/",
  cacheMiddleware(),
  getCompany
);

// =========================================================
// Update Company information
// PUT /api/company
// Protected
// =========================================================

router.put(
  "/",
  authMiddleware,
  companyUpload.single(
    "logo"
  ),
  updateCompany
);

module.exports = router;