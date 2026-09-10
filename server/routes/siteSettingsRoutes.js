const express = require("express");

const {
  getSiteSettings,
  getSiteSettingByKey,
  updateSiteSetting,
  deleteSiteSetting,
} = require("../controllers/siteSettingsController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

// Get all site settings
router.get(
  "/",
  getSiteSettings
);

// Update a site setting
router.put(
  "/:key",
  authMiddleware,
  updateSiteSetting
);

// Delete a site setting
router.delete(
  "/:key",
  authMiddleware,
  deleteSiteSetting
);

// Get one site setting by key
router.get(
  "/:key",
  getSiteSettingByKey
);

module.exports = router;