const express = require("express");
const router = express.Router();

const {
  getGallery,
  getGalleryItemById,
} = require("../controllers/galleryController");

router.get("/", getGallery);
router.get("/:id", getGalleryItemById);

module.exports = router;