const express = require("express");
const router = express.Router();

const {
  getSiteSettings,
  getSiteSettingByKey,
} = require("../controllers/siteSettingsController");

router.get("/", getSiteSettings);
router.get("/:key", getSiteSettingByKey);

module.exports = router;