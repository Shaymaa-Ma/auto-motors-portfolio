const express = require("express");

const {
  getCompany,
  updateCompany,
} = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

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