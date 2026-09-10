const express = require("express");

const {
  getHero,
  updateHero,
} = require("../controllers/heroController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ============================================================
// HERO IMAGE UPLOAD
// ============================================================

const heroUpload =
  createImageUpload(
    "hero",
    "hero"
  );

// ============================================================
// GET HERO
// ============================================================

router.get(
  "/",
  getHero
);

// ============================================================
// UPDATE HERO
// ============================================================
//
// Supports two separate images:
//
// background_image_desktop
// background_image_mobile
//
// ============================================================

router.put(
  "/",
  authMiddleware,
  heroUpload.fields([
    {
      name: "background_image_desktop",
      maxCount: 1,
    },
    {
      name: "background_image_mobile",
      maxCount: 1,
    },
  ]),
  updateHero
);

module.exports = router;