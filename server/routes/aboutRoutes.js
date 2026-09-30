const express = require("express");

const {
  getAbout,
  updateAbout,
} = require("../controllers/aboutController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createImageUpload,
} = require("../middleware/uploadMiddleware");

const {
  cacheMiddleware,
} = require("../middleware/cache");

const router = express.Router();

// Configure About image upload
const aboutUpload =
  createImageUpload(
    "about",
    "about"
  );

// Get About content
router.get(
  "/",
  cacheMiddleware(),
  getAbout
);

// Update About content
router.put(
  "/",
  authMiddleware,
  aboutUpload.single(
    "image"
  ),
  updateAbout
);

module.exports = router;