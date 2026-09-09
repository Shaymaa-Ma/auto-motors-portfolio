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

// Configure Hero image upload
const heroUpload =
  createImageUpload(
    "hero",
    "hero"
  );

// Get Hero information
router.get(
  "/",
  getHero
);

// Update Hero information
router.put(
  "/",
  authMiddleware,
  heroUpload.single(
    "background_image"
  ),
  updateHero
);

module.exports = router;